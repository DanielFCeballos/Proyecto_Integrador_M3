const { createGeminiProvider } = require('./gemini.cjs');
const { logGeminiFailure } = require('./gemini-diagnostics.cjs');

const LIMITS = Object.freeze({ message: 1000, modelMessage: 4000, history: 200, historyText: 200000, bodyBytes: 512 * 1024 });
// Bounded counters per warm instance only; this is not distributed rate limiting.
const TRAFFIC_LIMITS = Object.freeze({ windowMs: 60000, requests: 20, concurrent: 2 });
class HttpError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
const fail = (status, code, message) => { throw new HttpError(status, code, message); };
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function validateBody(body) {
  if (!isRecord(body) || Object.keys(body).some(key => !['message', 'history'].includes(key))) fail(400, 'INVALID_BODY', 'Envía únicamente message e history.');
  if (typeof body.message !== 'string' || !body.message.trim() || body.message.length > LIMITS.message) fail(400, 'INVALID_MESSAGE', 'El mensaje debe tener entre 1 y 1000 caracteres.');
  const history = body.history === undefined ? [] : body.history;
  if (!Array.isArray(history) || history.length % 2 !== 0) fail(400, 'INVALID_HISTORY', 'El historial debe contener intercambios completos en orden.');
  if (history.length > LIMITS.history) fail(413, 'HISTORY_TOO_LARGE', 'La conversación supera el límite de 200 mensajes anteriores. No se ha recortado el historial. Reinicia el chat para comenzar otra conversación.');
  let total = 0;
  const cleanHistory = history.map((item, index) => {
    if (!isRecord(item) || Object.keys(item).some(key => !['role', 'text'].includes(key))) fail(400, 'INVALID_HISTORY', 'El historial tiene un formato incorrecto.');
    const role = index % 2 === 0 ? 'user' : 'model';
    const maxLength = role === 'user' ? LIMITS.message : LIMITS.modelMessage;
    if (item.role !== role || typeof item.text !== 'string' || !item.text.trim() || item.text.length > maxLength) fail(400, 'INVALID_HISTORY', 'El historial debe alternar mensajes user y model válidos.');
    total += item.text.length;
    return { role, text: item.text.trim() };
  });
  if (total > LIMITS.historyText) fail(413, 'HISTORY_TOO_LARGE', 'La conversación supera los 200000 caracteres de historial. No se ha recortado el historial. Reinicia el chat para comenzar otra conversación.');
  return { message: body.message.trim(), history: cleanHistory };
}

async function readBody(request) {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers['content-type'] || '')) fail(415, 'INVALID_CONTENT_TYPE', 'Utiliza Content-Type: application/json.');
  const length = Number(request.headers['content-length']);
  if (Number.isFinite(length) && length > LIMITS.bodyBytes) fail(413, 'BODY_TOO_LARGE', 'La conversación completa supera 512 KiB por petición. No se ha recortado el historial. Reinicia el chat para comenzar otra conversación.');
  if (request.body !== undefined) {
    const raw = typeof request.body === 'string' || Buffer.isBuffer(request.body) ? request.body.toString() : JSON.stringify(request.body);
    if (Buffer.byteLength(raw, 'utf8') > LIMITS.bodyBytes) fail(413, 'BODY_TOO_LARGE', 'La conversación completa supera 512 KiB por petición. No se ha recortado el historial. Reinicia el chat para comenzar otra conversación.');
    try { return JSON.parse(raw); } catch { fail(400, 'INVALID_JSON', 'El cuerpo debe ser JSON válido.'); }
  }
  const raw = await new Promise((resolve, reject) => {
    let size = 0;
    let exceeded = false;
    const chunks = [];
    request.on('data', chunk => {
      if (exceeded) return;
      size += Buffer.byteLength(chunk);
      if (size > LIMITS.bodyBytes) {
        exceeded = true;
        chunks.length = 0;
        reject(new HttpError(413, 'BODY_TOO_LARGE', 'La conversación completa supera 512 KiB por petición. No se ha recortado el historial. Reinicia el chat para comenzar otra conversación.'));
      } else chunks.push(Buffer.from(chunk));
    });
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
  try { return JSON.parse(raw); } catch { fail(400, 'INVALID_JSON', 'El cuerpo debe ser JSON válido.'); }
}

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  response.end(JSON.stringify(body));
}

function publicError(error) {
  if (error instanceof HttpError) return error;
  if (error.code === 'NOT_CONFIGURED') return new HttpError(503, 'NOT_CONFIGURED', 'El chat aún no está configurado en el servidor.');
  if (error.code === 'SAFETY_BLOCKED') return new HttpError(422, 'SAFETY_BLOCKED', 'No se pudo generar una respuesta para esa consulta. Reformúlala.');
  if (error.code === 'INVALID_RESPONSE') return new HttpError(502, 'INVALID_RESPONSE', 'La IA devolvió una respuesta no válida. Inténtalo de nuevo.');
  if (error.status === 429) return new HttpError(429, 'RATE_LIMITED', 'Gemini alcanzó su límite temporal de solicitudes. Espera antes de reintentar.');
  if (error.name === 'AbortError' || error.name === 'TimeoutError') return new HttpError(504, 'TIMEOUT', 'La respuesta tardó demasiado. Inténtalo de nuevo.');
  return new HttpError(502, 'UPSTREAM_ERROR', 'No se pudo contactar con Gemini. Inténtalo más tarde.');
}

// Dependency injection is used only by local tests, never by HTTP parameters.
function createChatHandler({ getProvider = createGeminiProvider, timeoutMs = 20000, now = Date.now } = {}) {
  let windowStartedAt = now();
  let acceptedRequests = 0;
  let activeGenerations = 0;
  return async function chatHandler(request, response) {
    if (request.method !== 'POST') {
      response.setHeader('Allow', 'POST');
      sendJson(response, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Utiliza POST para enviar mensajes.' } });
      return;
    }
    const controller = new AbortController();
    let timer;
    let admitted = false;
    let providerPending = false;
    const onDisconnect = () => { if (!response.writableEnded) controller.abort(); };
    response.on?.('close', onDisconnect);
    try {
      // A same-origin browser policy reduces cross-site use; it is not authentication.
      const origin = request.headers.origin;
      const host = request.headers.host;
      if (origin) {
        let originHost;
        try { originHost = new URL(origin).host; } catch { fail(403, 'ORIGIN_NOT_ALLOWED', 'Origen de petición no permitido.'); }
        if (!host || originHost !== host) fail(403, 'ORIGIN_NOT_ALLOWED', 'Origen de petición no permitido.');
      }
      const body = validateBody(await readBody(request));
      const currentTime = now();
      if (currentTime - windowStartedAt >= TRAFFIC_LIMITS.windowMs || currentTime < windowStartedAt) {
        windowStartedAt = currentTime;
        acceptedRequests = 0;
      }
      if (activeGenerations >= TRAFFIC_LIMITS.concurrent) {
        throw Object.assign(new HttpError(429, 'SERVER_BUSY', 'El chat está atendiendo otras solicitudes. Espera unos segundos e inténtalo de nuevo.'), { retryAfter: 2 });
      }
      if (acceptedRequests >= TRAFFIC_LIMITS.requests) {
        const retryAfter = Math.max(1, Math.ceil((windowStartedAt + TRAFFIC_LIMITS.windowMs - currentTime) / 1000));
        throw Object.assign(new HttpError(429, 'SERVER_RATE_LIMITED', 'Se alcanzó el límite temporal de solicitudes del chat. Espera antes de reintentar.'), { retryAfter });
      }
      acceptedRequests++;
      activeGenerations++;
      admitted = true;
      providerPending = true;
      const provider = getProvider();
      const deadline = new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new HttpError(504, 'TIMEOUT', 'La respuesta tardó demasiado. Inténtalo de nuevo.'));
        }, timeoutMs);
      });
      const result = await Promise.race([provider.generate({ ...body, signal: controller.signal }), deadline]);
      providerPending = false;
      if (!response.destroyed) sendJson(response, 200, result);
    } catch (error) {
      if (providerPending) logGeminiFailure(error);
      const safe = publicError(error);
      if (safe.status === 429) response.setHeader('Retry-After', String(safe.retryAfter || 30));
      if (!response.destroyed) sendJson(response, safe.status, { error: { code: safe.code, message: safe.message } });
      // Only allowlisted metadata is logged above; never log the original exception.
    } finally {
      if (admitted) activeGenerations--;
      clearTimeout(timer);
      response.off?.('close', onDisconnect);
    }
  };
}

module.exports = { createChatHandler, validateBody, LIMITS, TRAFFIC_LIMITS };
