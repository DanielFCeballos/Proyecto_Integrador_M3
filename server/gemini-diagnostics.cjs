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
// Exact constants only: ErrorInfo.reason is not safe merely because it is uppercase.
const GOOGLE_REASONS = new Set([
  'API_KEY_INVALID', 'API_KEY_EXPIRED', 'API_KEY_SERVICE_BLOCKED',
  'API_KEY_HTTP_REFERRER_BLOCKED', 'API_KEY_IP_ADDRESS_BLOCKED',
  'API_KEY_ANDROID_APP_BLOCKED', 'API_KEY_IOS_APP_BLOCKED',
  'SERVICE_DISABLED', 'API_DISABLED', 'BILLING_DISABLED', 'CONSUMER_INVALID',
  'ACCESS_TOKEN_EXPIRED', 'ACCESS_TOKEN_SCOPE_INSUFFICIENT',
]);
const DETAIL_TYPES = new Map([
  ['type.googleapis.com/google.rpc.BadRequest', 'BadRequest'],
  ['type.googleapis.com/google.rpc.ErrorInfo', 'ErrorInfo'],
]);
const REQUEST_FIELDS = new Map([
  ['model', 'model'], ['contents', 'contents'],
  ['systemInstruction', 'systemInstruction'], ['system_instruction', 'systemInstruction'],
  ['generationConfig', 'generationConfig'], ['generation_config', 'generationConfig'],
]);
for (const prefix of ['generationConfig', 'generation_config']) {
  for (const [camel, snake] of [
    ['temperature', 'temperature'], ['maxOutputTokens', 'max_output_tokens'],
    ['responseMimeType', 'response_mime_type'], ['responseJsonSchema', 'response_json_schema'],
    ['responseSchema', 'response_schema'], ['topP', 'top_p'], ['topK', 'top_k'],
    ['candidateCount', 'candidate_count'],
  ]) {
    for (const name of [camel, snake]) REQUEST_FIELDS.set(`${prefix}.${name}`, `generationConfig.${camel}`);
  }
}

function requestField(value) {
  if (typeof value !== 'string' || value.length > 160) return null;
  if (REQUEST_FIELDS.has(value)) return REQUEST_FIELDS.get(value);
  // These anchored patterns parse only structured field paths, never error prose.
  // Numeric indices are discarded; no arbitrary map keys or text are retained.
  if (/^contents\[\d{1,3}\]$/.test(value)) return 'contents[]';
  if (/^contents\[\d{1,3}\]\.role$/.test(value)) return 'contents[].role';
  if (/^contents\[\d{1,3}\]\.parts\[\d{1,2}\]\.text$/.test(value)) return 'contents[].parts[].text';
  if (/^(?:systemInstruction|system_instruction)\.parts\[\d{1,2}\]\.text$/.test(value)) return 'systemInstruction.parts[].text';
  return null;
}

function structuredDetails(google) {
  const details = field(google, 'details');
  const fields = new Set();
  const reasons = new Set();
  const types = new Set();
  if (Array.isArray(details)) {
    // Bound work and output even for hostile or unusually large SDK errors.
    for (const detail of details.slice(0, 16)) {
      const type = DETAIL_TYPES.get(field(detail, '@type'));
      if (!type) continue;
      types.add(type);
      if (type === 'ErrorInfo') {
        const reason = allowed(field(detail, 'reason'), GOOGLE_REASONS);
        if (reason) reasons.add(reason);
      } else {
        const violations = field(detail, 'fieldViolations');
        if (!Array.isArray(violations)) continue;
        for (const violation of violations.slice(0, 32)) {
          const name = requestField(field(violation, 'field'));
          if (name) fields.add(name);
        }
      }
    }
  }
  return {
    googleFields: fields.size ? [...fields].slice(0, 16) : null,
    googleReasons: reasons.size ? [...reasons].slice(0, 16) : null,
    googleDetailTypes: types.size ? [...types] : null,
  };
}

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
  // then select allowlisted metadata; never log this string or parsed object.
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
  return { event: 'gemini_failure', errorName, httpStatus: status, transportCode, googleStatus, category, ...structuredDetails(google) };
}

function logGeminiFailure(error, write = record => console.error(JSON.stringify(record))) {
  // Diagnostics are best effort: a failing log sink must not change HTTP behavior.
  try { write(buildGeminiDiagnostic(error)); } catch { /* Do not log a fallback exception. */ }
}

module.exports = { buildGeminiDiagnostic, logGeminiFailure };
