import { EventEmitter } from 'node:events';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import diagnostics from '../../server/gemini-diagnostics.cjs';
import handlerModule from '../../server/chat-handler.cjs';

const { buildGeminiDiagnostic, logGeminiFailure } = diagnostics;
const { createChatHandler } = handlerModule;
const request = (message = 'Pregunta') => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: { message, history: [] } });
const response = () => Object.assign(new EventEmitter(), { writeHead: vi.fn(), setHeader: vi.fn(), end: vi.fn() });
let log;
beforeEach(() => { log = vi.spyOn(console, 'error').mockImplementation(() => {}); });

describe('Metadatos de Gemini con allowlist', () => {
  it('extrae HTTP y categoría de Google sin incluir el mensaje o campos adicionales', () => {
    const secret = 'PRIVATE_CREDENTIAL_SENTINEL';
    const error = Object.assign(new Error(JSON.stringify({ error: {
      code: 403, status: 'PERMISSION_DENIED', message: secret,
      details: [{ metadata: { apiKey: secret, prompt: 'PRIVATE_PROMPT' } }],
    } })), {
      name: 'ApiError', status: 403, stack: secret,
      url: `https://example.invalid/?key=${secret}`,
      headers: { authorization: secret }, history: [secret], reply: secret,
      toJSON() { throw new Error('Original error must not be serialized'); },
    });
    logGeminiFailure(error);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0]).toHaveLength(1);
    const record = JSON.parse(log.mock.calls[0][0]);
    expect(record).toEqual({ event: 'gemini_failure', errorName: 'ApiError', httpStatus: 403, transportCode: null, googleStatus: 'PERMISSION_DENIED', category: 'authentication_or_permission' });
    expect(JSON.stringify(log.mock.calls)).not.toMatch(/PRIVATE_|example\.invalid|authorization|apiKey|history|reply|stack/);
  });

  it.each([
    [400, 'request_rejected'], [401, 'authentication_or_permission'],
    [404, 'resource_not_found'], [429, 'rate_or_quota'],
    [500, 'upstream_service'], [502, 'upstream_service'],
    [503, 'upstream_service'], [504, 'timeout_or_abort'],
  ])('clasifica HTTP %s sin inferir una causa más específica', (status, category) => {
    expect(buildGeminiDiagnostic(Object.assign(new Error('PRIVATE'), { status }))).toMatchObject({ httpStatus: status, category });
  });

  it('conserva solo códigos conocidos de transporte de la causa', () => {
    const error = new TypeError('PRIVATE_URL');
    error.cause = { code: 'ECONNRESET', message: 'PRIVATE_HEADER', url: 'PRIVATE_URL' };
    expect(buildGeminiDiagnostic(error)).toEqual({ event: 'gemini_failure', errorName: 'TypeError', httpStatus: null, transportCode: 'ECONNRESET', googleStatus: null, category: 'transport' });
    error.cause.code = 'UND_ERR_CONNECT_TIMEOUT';
    expect(buildGeminiDiagnostic(error).category).toBe('timeout_or_abort');
  });

  it('no admite texto arbitrario en nombre, estado, transporte o categoría Google', () => {
    const error = {
      name: 'ApiError PRIVATE_CREDENTIAL', status: '403 PRIVATE_CREDENTIAL',
      statusCode: { toString() { throw new Error('Do not coerce'); } },
      code: 'ECONNRESET PRIVATE_URL', cause: { code: 'PRIVATE_PROMPT' },
      message: JSON.stringify({ error: { code: 'PRIVATE', status: 'UNAVAILABLE PRIVATE' } }),
    };
    expect(buildGeminiDiagnostic(error)).toEqual({ event: 'gemini_failure', errorName: 'UnknownError', httpStatus: null, transportCode: null, googleStatus: null, category: 'unknown' });
  });

  it('ignora mensajes extensos, JSON malformado y getters que fallan', () => {
    expect(buildGeminiDiagnostic({ message: 'x'.repeat(16385) }).googleStatus).toBeNull();
    expect(buildGeminiDiagnostic({ message: '{PRIVATE' }).category).toBe('unknown');
    const hostile = {};
    for (const field of ['name', 'status', 'statusCode', 'code', 'cause', 'message']) Object.defineProperty(hostile, field, { get() { throw new Error('PRIVATE'); } });
    expect(buildGeminiDiagnostic(hostile)).toMatchObject({ errorName: 'UnknownError', httpStatus: null, transportCode: null, googleStatus: null, category: 'unknown' });
    expect(buildGeminiDiagnostic(null).category).toBe('unknown');
  });

  it.each([
    ['NOT_CONFIGURED', 'configuration'],
    ['INVALID_RESPONSE', 'response_processing'],
    ['SAFETY_BLOCKED', 'content_blocked'],
    ['TIMEOUT', 'timeout_or_abort'],
  ])('clasifica el código interno %s sin copiarlo como texto libre', (code, category) => {
    expect(buildGeminiDiagnostic(Object.assign(new Error('PRIVATE'), { code })).category).toBe(category);
  });
});

describe('Diagnóstico en el catch del handler', () => {
  it('registra una sola vez y conserva exactamente el 502 público', async () => {
    const error = Object.assign(new Error(JSON.stringify({ error: { status: 'UNAVAILABLE', message: 'PRIVATE_GENERATED_RESPONSE' } })), { name: 'ApiError', status: 503 });
    const generate = vi.fn().mockRejectedValue(error);
    const res = response();
    await createChatHandler({ getProvider: () => ({ generate }) })(request('PRIVATE_USER_MESSAGE'), res);
    expect(log).toHaveBeenCalledTimes(1);
    expect(JSON.parse(log.mock.calls[0][0])).toMatchObject({ httpStatus: 503, googleStatus: 'UNAVAILABLE', category: 'upstream_service' });
    expect(res.writeHead).toHaveBeenCalledWith(502, expect.any(Object));
    expect(JSON.parse(res.end.mock.calls[0][0])).toEqual({ error: { code: 'UPSTREAM_ERROR', message: 'No se pudo contactar con Gemini. Inténtalo más tarde.' } });
    expect(JSON.stringify(log.mock.calls)).not.toContain('PRIVATE');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('conserva 429 y Retry-After cuando la cuota procede de Google', async () => {
    const res = response();
    await createChatHandler({ getProvider: () => ({ generate: vi.fn().mockRejectedValue(Object.assign(new Error('PRIVATE'), { status: 429 })) }) })(request(), res);
    expect(res.writeHead).toHaveBeenCalledWith(429, expect.any(Object));
    expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '30');
    expect(JSON.parse(res.end.mock.calls[0][0]).error.code).toBe('RATE_LIMITED');
    expect(log).toHaveBeenCalledTimes(1);
  });

  it('no registra validaciones locales ni éxitos como fallos de Gemini', async () => {
    const getProvider = vi.fn(() => ({ generate: vi.fn().mockResolvedValue({ reply: 'Respuesta', sourceIds: [] }) }));
    const handler = createChatHandler({ getProvider });
    await handler(request(' '), response());
    expect(getProvider).not.toHaveBeenCalled();
    await handler(request(), response());
    expect(log).not.toHaveBeenCalled();
  });

  it('no registra el límite local de solicitudes como cuota de Google', async () => {
    const handler = createChatHandler({ getProvider: () => ({ generate: vi.fn().mockResolvedValue({ reply: 'Respuesta', sourceIds: [] }) }) });
    for (let index = 0; index < 20; index++) await handler(request(), response());
    const blocked = response();
    await handler(request(), blocked);
    expect(JSON.parse(blocked.end.mock.calls[0][0]).error.code).toBe('SERVER_RATE_LIMITED');
    expect(log).not.toHaveBeenCalled();
  });

  it('no deja que un fallo del logger cambie la respuesta pública', async () => {
    log.mockImplementation(() => { throw new Error('PRIVATE_LOG_SINK_FAILURE'); });
    const res = response();
    await createChatHandler({ getProvider: () => { throw new Error('PRIVATE_PROVIDER_FAILURE'); } })(request(), res);
    expect(log).toHaveBeenCalledTimes(1);
    expect(res.writeHead).toHaveBeenCalledWith(502, expect.any(Object));
    expect(JSON.parse(res.end.mock.calls[0][0]).error.code).toBe('UPSTREAM_ERROR');
  });

  it('emite un registro para timeout aunque el proveedor rechace tarde', async () => {
    vi.useFakeTimers();
    let rejectProvider;
    const handler = createChatHandler({ timeoutMs: 10, getProvider: () => ({ generate: () => new Promise((_, reject) => { rejectProvider = reject; }) }) });
    const res = response();
    const running = handler(request(), res);
    await vi.advanceTimersByTimeAsync(10);
    await running;
    rejectProvider(new Error('PRIVATE_LATE_FAILURE'));
    await Promise.resolve();
    expect(res.writeHead).toHaveBeenCalledWith(504, expect.any(Object));
    expect(log).toHaveBeenCalledTimes(1);
    expect(JSON.parse(log.mock.calls[0][0])).toMatchObject({ category: 'timeout_or_abort', httpStatus: null });
  });
});
