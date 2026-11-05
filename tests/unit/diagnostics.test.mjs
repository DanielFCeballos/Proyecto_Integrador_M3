import { EventEmitter } from 'node:events';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import diagnostics from '../../server/gemini-diagnostics.cjs';
import handlerModule from '../../server/chat-handler.cjs';
import { ApiError } from '@google/genai';

const { buildGeminiDiagnostic, logGeminiFailure } = diagnostics;
const { createChatHandler } = handlerModule;
const emptyDetails = { googleFields: null, googleReasons: null, googleDetailTypes: null };
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
    expect(record).toEqual({ event: 'gemini_failure', errorName: 'ApiError', httpStatus: 403, transportCode: null, googleStatus: 'PERMISSION_DENIED', category: 'authentication_or_permission', ...emptyDetails });
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
    expect(buildGeminiDiagnostic(error)).toEqual({ event: 'gemini_failure', errorName: 'TypeError', httpStatus: null, transportCode: 'ECONNRESET', googleStatus: null, category: 'transport', ...emptyDetails });
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
    expect(buildGeminiDiagnostic(error)).toEqual({ event: 'gemini_failure', errorName: 'UnknownError', httpStatus: null, transportCode: null, googleStatus: null, category: 'unknown', ...emptyDetails });
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

describe('Detalles estructurados del ApiError real, sin red', () => {
  const apiError = details => new ApiError({ status: 400, message: JSON.stringify({ error: {
    code: 400, status: 'INVALID_ARGUMENT', message: 'PRIVATE_MESSAGE', details,
  } }) });
  const badRequest = fields => ({ '@type': 'type.googleapis.com/google.rpc.BadRequest', fieldViolations: fields.map(field => ({ field, description: 'PRIVATE_DESCRIPTION', reason: 'PRIVATE_REASON' })) });
  const errorInfo = reason => ({ '@type': 'type.googleapis.com/google.rpc.ErrorInfo', reason, domain: 'PRIVATE_DOMAIN', metadata: { key: 'PRIVATE_KEY', prompt: 'PRIVATE_PROMPT' } });

  it('extrae y normaliza solo campos permitidos de BadRequest, sin indices ni duplicados', () => {
    logGeminiFailure(apiError([badRequest([
      'generation_config.response_json_schema', 'generationConfig.responseJsonSchema',
      'generationConfig.temperature', 'contents[20].parts[0].text', 'contents[2].role',
      'system_instruction.parts[0].text', 'model',
    ])]));
    const record = JSON.parse(log.mock.calls[0][0]);
    expect(record).toMatchObject({ httpStatus: 400, googleStatus: 'INVALID_ARGUMENT', category: 'request_rejected',
      googleFields: ['generationConfig.responseJsonSchema', 'generationConfig.temperature', 'contents[].parts[].text', 'contents[].role', 'systemInstruction.parts[].text', 'model'],
      googleReasons: null, googleDetailTypes: ['BadRequest'] });
    expect(JSON.stringify(log.mock.calls)).not.toMatch(/PRIVATE|\[20\]/);
  });

  it('recupera ErrorInfo.reason solo por coincidencia exacta con una lista cerrada', () => {
    logGeminiFailure(apiError([errorInfo('API_KEY_INVALID'), errorInfo('API_KEY_INVALID'), errorInfo('BILLING_DISABLED')]));
    expect(JSON.parse(log.mock.calls[0][0])).toMatchObject({ googleReasons: ['API_KEY_INVALID', 'BILLING_DISABLED'], googleFields: null, googleDetailTypes: ['ErrorInfo'] });
    expect(JSON.stringify(log.mock.calls)).not.toContain('PRIVATE');
  });

  it.each([undefined, null, [], {}, 'PRIVATE', [{ '@type': 'PRIVATE_TYPE' }]])('usa null cuando no hay detalles estructurados conocidos: %j', details => {
    expect(buildGeminiDiagnostic(apiError(details))).toMatchObject(emptyDetails);
  });

  it('no interpreta mensajes libres aunque mencionen campos o razones permitidos', () => {
    const error = new ApiError({ status: 400, message: 'PRIVATE generationConfig.temperature API_KEY_INVALID' });
    expect(buildGeminiDiagnostic(error)).toMatchObject(emptyDetails);
    expect(buildGeminiDiagnostic({ message: '{"error":{"message":"generationConfig.temperature API_KEY_INVALID"}}' })).toMatchObject(emptyDetails);
  });

  it('rechaza contenido sensible, tipos desconocidos, objetos y sufijos aunque parezcan identificadores', () => {
    const fields = [
      'generationConfig.temperature PRIVATE_KEY', 'contents[0].parts[0].text?key=PRIVATE',
      'contents[0].parts[0].PRIVATE_PROMPT', 'generationConfig.responseJsonSchema.properties.PRIVATE',
      'https://PRIVATE.invalid', 'PRIVATE_USER_EMAIL', null, {}, ['model'], 'x'.repeat(200),
    ];
    const details = [badRequest(fields), errorInfo('API_KEY_INVALID PRIVATE_KEY'), errorInfo('PRIVATE_UPPERCASE_SECRET'),
      errorInfo({ value: 'API_KEY_INVALID' }), { '@type': 'PRIVATE_TYPE', reason: 'API_KEY_INVALID' },
      { '@type': 'type.googleapis.com/google.rpc.ErrorInfo PRIVATE', reason: 'API_KEY_INVALID' }];
    logGeminiFailure(apiError(details));
    expect(JSON.parse(log.mock.calls[0][0])).toMatchObject({ googleFields: null, googleReasons: null, googleDetailTypes: ['BadRequest', 'ErrorInfo'] });
    expect(JSON.stringify(log.mock.calls)).not.toMatch(/PRIVATE|https:|description|metadata|domain|prompt/i);
  });

  it('no recupera campos de un tipo equivocado ni detalles top-level ajenos al JSON del SDK', () => {
    const error = apiError([{ ...errorInfo('API_KEY_INVALID'), fieldViolations: [{ field: 'model' }] },
      { ...badRequest([]), reason: 'BILLING_DISABLED' }]);
    error.details = [badRequest(['generationConfig.temperature'])];
    expect(buildGeminiDiagnostic(error)).toMatchObject({ googleFields: null, googleReasons: ['API_KEY_INVALID'] });
  });

  it('limita el trabajo y descarta errores JSON mayores de 16384 caracteres', () => {
    const details = Array.from({ length: 16 }, () => badRequest([]));
    details.push(errorInfo('API_KEY_INVALID'));
    expect(buildGeminiDiagnostic(apiError(details)).googleReasons).toBeNull();
    expect(buildGeminiDiagnostic(apiError([badRequest([...Array(32).fill('PRIVATE'), 'model'])])).googleFields).toBeNull();
    const error = apiError([errorInfo('API_KEY_INVALID')]);
    error.message += ' '.repeat(16385);
    expect(buildGeminiDiagnostic(error)).toMatchObject(emptyDetails);
  });

  it('conserva exactamente el HTTP 502 publico y un solo registro para HTTP 400', async () => {
    const error = apiError([badRequest(['generationConfig.responseJsonSchema']), errorInfo('API_KEY_INVALID')]);
    const res = response();
    await createChatHandler({ getProvider: () => ({ generate: vi.fn().mockRejectedValue(error) }) })(request('PRIVATE_USER_MESSAGE'), res);
    expect(res.writeHead).toHaveBeenCalledWith(502, expect.any(Object));
    expect(JSON.parse(res.end.mock.calls[0][0])).toEqual({ error: { code: 'UPSTREAM_ERROR', message: 'No se pudo contactar con Gemini. Inténtalo más tarde.' } });
    expect(log).toHaveBeenCalledTimes(1);
    expect(JSON.parse(log.mock.calls[0][0])).toMatchObject({ httpStatus: 400, googleFields: ['generationConfig.responseJsonSchema'], googleReasons: ['API_KEY_INVALID'] });
    expect(JSON.stringify(log.mock.calls)).not.toMatch(/PRIVATE|description|metadata|domain/);
    expect(fetch).not.toHaveBeenCalled();
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
