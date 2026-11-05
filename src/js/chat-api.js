import { serializeChatRequest } from './chat-policy.js';

// Browser HTTP boundary, isolated so unit tests can mock fetch without a DOM.
export async function requestChatReply({ message, history, signal }) {
  // Fail before contacting the server; never truncate the conversation to fit.
  const body = serializeChatRequest({ message, history });
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    signal,
  });
  let data;
  try { data = await response.json(); } catch { throw new Error('El servidor devolvió una respuesta no válida.'); }
  if (!response.ok) throw new Error(data?.error?.message || 'No se pudo completar la consulta. Inténtalo de nuevo.');
  if (!data || typeof data.reply !== 'string' || !data.reply.trim() || data.reply.length > 4000 || !Array.isArray(data.sourceIds)) throw new Error('El servidor devolvió una respuesta no válida.');
  return data;
}
