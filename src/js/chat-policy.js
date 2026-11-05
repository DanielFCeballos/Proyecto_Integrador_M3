// Public input limits only. The server validates the same limits independently.
export const CHAT_LIMITS = Object.freeze({ message: 1000, modelMessage: 4000, history: 200, historyText: 200000, bodyBytes: 512 * 1024 });

const fail = (status, code, message) => { throw Object.assign(new Error(message), { status, code }); };

export function validateHistory(history) {
  if (!Array.isArray(history) || history.length % 2 !== 0) fail(400, 'INVALID_HISTORY', 'El historial debe contener intercambios completos en orden.');
  if (history.length > CHAT_LIMITS.history) fail(413, 'HISTORY_TOO_LARGE', 'La conversación supera el límite de 200 mensajes anteriores. No se ha recortado el historial. Reinicia el chat para comenzar otra conversación.');
  let total = 0;
  const result = history.map((item, index) => {
    const role = index % 2 === 0 ? 'user' : 'model';
    const maxLength = role === 'user' ? CHAT_LIMITS.message : CHAT_LIMITS.modelMessage;
    if (!item || typeof item !== 'object' || Array.isArray(item) || Object.keys(item).some(key => !['role', 'text'].includes(key)) || item.role !== role || typeof item.text !== 'string' || !item.text.trim() || item.text.length > maxLength) fail(400, 'INVALID_HISTORY', 'El historial contiene mensajes vacíos, inválidos o fuera de orden.');
    total += item.text.length;
    return { role, text: item.text.trim() };
  });
  if (total > CHAT_LIMITS.historyText) fail(413, 'HISTORY_TOO_LARGE', 'La conversación supera los 200000 caracteres de historial. No se ha recortado el historial. Reinicia el chat para comenzar otra conversación.');
  return result;
}

export function serializeChatRequest({ message, history = [] }) {
  if (typeof message !== 'string' || !message.trim() || message.length > CHAT_LIMITS.message) fail(400, 'INVALID_MESSAGE', 'El mensaje debe tener entre 1 y 1000 caracteres.');
  const body = JSON.stringify({ message: message.trim(), history: validateHistory(history) });
  if (new TextEncoder().encode(body).byteLength > CHAT_LIMITS.bodyBytes) fail(413, 'BODY_TOO_LARGE', 'La conversación completa supera 512 KiB por petición. No se ha recortado el historial. Reinicia el chat para comenzar otra conversación.');
  return body;
}
