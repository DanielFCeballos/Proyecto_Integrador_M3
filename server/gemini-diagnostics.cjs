// Server-only allowlists. Never serialize the original error, message or cause.
const ERROR_NAMES = new Set(['Error', 'ApiError', 'TypeError', 'SyntaxError', 'AbortError', 'TimeoutError', 'AggregateError']);
const GOOGLE_STATUSES = new Set([
  'INVALID_ARGUMENT', 'FAILED_PRECONDITION', 'OUT_OF_RANGE', 'UNAUTHENTICATED',
  'PERMISSION_DENIED', 'NOT_FOUND', 'ALREADY_EXISTS', 'RESOURCE_EXHAUSTED',
  'CANCELLED', 'DEADLINE_EXCEEDED', 'UNIMPLEMENTED', 'INTERNAL', 'UNAVAILABLE',
  'UNKNOWN', 'DATA_LOSS',
]);
const TRANSPORT_CODES = new Set([
  'ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EPIPE',
  'ENETUNREACH', 'EHOSTUNREACH', 'ABORT_ERR', 'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT', 'UND_ERR_BODY_TIMEOUT', 'UND_ERR_SOCKET',
  'UND_ERR_ABORTED', 'ERR_TLS_CERT_ALTNAME_INVALID', 'CERT_HAS_EXPIRED',
  'DEPTH_ZERO_SELF_SIGNED_CERT', 'SELF_SIGNED_CERT_IN_CHAIN',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
]);

function field(value, key) {
  try { return value?.[key]; } catch { return undefined; }
}

function allowed(value, values) {
  return typeof value === 'string' && values.has(value) ? value : null;
}

function httpStatus(value) {
  // Only an HTTP error number, never a free-form status string or object.
  const number = typeof value === 'string' && /^[45]\d{2}$/.test(value) ? Number(value) : value;
  return Number.isInteger(number) && number >= 400 && number <= 599 ? number : null;
}

function googleErrorBody(error) {
  // @google/genai ApiError.message contains JSON. Parse only a bounded string,
  // then select an enum; never log this string, parsed object or its details.
  const message = field(error, 'message');
  if (typeof message !== 'string' || message.length > 16384) return null;
  try { return field(JSON.parse(message), 'error'); } catch { return null; }
}

function buildGeminiDiagnostic(error) {
  const google = googleErrorBody(error);
  const errorName = allowed(field(error, 'name'), ERROR_NAMES) || 'UnknownError';
  const code = field(error, 'code');
  // Application errors do not prove that Google returned an HTTP response.
  const applicationError = ['NOT_CONFIGURED', 'INVALID_RESPONSE', 'SAFETY_BLOCKED', 'TIMEOUT'].includes(code);
  const status = applicationError ? null : httpStatus(field(error, 'status')) || httpStatus(field(error, 'statusCode')) || httpStatus(field(google, 'code'));
  const googleStatus = allowed(field(google, 'status'), GOOGLE_STATUSES);
  const cause = field(error, 'cause');
  const transportCode = allowed(field(error, 'code'), TRANSPORT_CODES)
    || allowed(field(cause, 'code'), TRANSPORT_CODES)
    || allowed(field(field(cause, 'cause'), 'code'), TRANSPORT_CODES);
  let category = 'unknown';
  if (code === 'NOT_CONFIGURED') category = 'configuration';
  else if (code === 'INVALID_RESPONSE') category = 'response_processing';
  else if (code === 'SAFETY_BLOCKED') category = 'content_blocked';
  else if (code === 'TIMEOUT' || ['AbortError', 'TimeoutError'].includes(errorName)
    || transportCode?.includes('TIMEOUT') || [408, 504].includes(status) || googleStatus === 'DEADLINE_EXCEEDED') category = 'timeout_or_abort';
  else if (transportCode) category = 'transport';
  else if ([401, 403].includes(status) || ['UNAUTHENTICATED', 'PERMISSION_DENIED'].includes(googleStatus)) category = 'authentication_or_permission';
  else if (status === 404 || googleStatus === 'NOT_FOUND') category = 'resource_not_found';
  else if (status === 429 || googleStatus === 'RESOURCE_EXHAUSTED') category = 'rate_or_quota';
  else if (status >= 500) category = 'upstream_service';
  else if (status >= 400) category = 'request_rejected';
  return { event: 'gemini_failure', errorName, httpStatus: status, transportCode, googleStatus, category };
}

function logGeminiFailure(error, write = record => console.error(JSON.stringify(record))) {
  // Diagnostics are best effort: a failing log sink must not change HTTP behavior.
  try { write(buildGeminiDiagnostic(error)); } catch { /* Do not log a fallback exception. */ }
}

module.exports = { buildGeminiDiagnostic, logGeminiFailure };
