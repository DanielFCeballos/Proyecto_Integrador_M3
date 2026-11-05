import { describe, expect, it, vi } from 'vitest';
import { requestChatReply } from '../../src/js/chat-api.js';

describe('Fetch API del chat con red simulada', () => {
  it('envía mensaje, historial y señal únicamente al endpoint local', async () => {
    const payload = { reply: 'Respuesta', sourceIds: ['marvel-profile'], generatedBy: 'gemini' };
    const mockFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }));
    vi.stubGlobal('fetch', mockFetch);
    const signal = new AbortController().signal;
    const history = [{ role: 'user', text: 'Antes' }, { role: 'model', text: 'Respuesta anterior' }];
    await expect(requestChatReply({ message: 'Ahora', history, signal })).resolves.toEqual(payload);
    expect(mockFetch).toHaveBeenCalledExactlyOnceWith('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Ahora', history }), signal,
    });
  });

  it('propaga el mensaje público de un error 429 sin reintentar', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { code: 'RATE_LIMITED', message: 'Espera antes de reintentar.' } }), { status: 429 }));
    vi.stubGlobal('fetch', mockFetch);
    await expect(requestChatReply({ message: 'Hola', history: [] })).rejects.toThrow('Espera antes de reintentar.');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('usa un error controlado si el servidor no devuelve JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>Error</html>', { status: 502 })));
    await expect(requestChatReply({ message: 'Hola', history: [] })).rejects.toThrow('El servidor devolvió una respuesta no válida.');
  });

  it('rechaza una respuesta JSON sin la estructura del chat', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('null', { status: 200 })));
    await expect(requestChatReply({ message: 'Hola', history: [] })).rejects.toThrow('El servidor devolvió una respuesta no válida.');
  });

  it('propaga un fallo de red para que la interfaz lo pueda presentar', async () => {
    const failure = new TypeError('Network unavailable');
    const mockFetch = vi.fn().mockRejectedValue(failure);
    vi.stubGlobal('fetch', mockFetch);
    await expect(requestChatReply({ message: 'Hola', history: [] })).rejects.toBe(failure);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('envía más de cuatro turnos y más de 12000 caracteres completos, con el mensaje actual una sola vez', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ reply: 'Respuesta', sourceIds: [] })));
    vi.stubGlobal('fetch', mockFetch);
    const history = Array.from({ length: 6 }, (_, index) => [
      { role: 'user', text: String(index).repeat(1000) }, { role: 'model', text: String(index).repeat(4000) },
    ]).flat();
    await requestChatReply({ message: 'Mensaje actual', history });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({ message: 'Mensaje actual', history });
    expect(body.history).toHaveLength(12);
    expect(body.history.some(item => item.text === 'Mensaje actual')).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('rechaza mensajes vacíos, roles incorrectos y estados de interfaz antes de fetch', async () => {
    for (const history of [
      [{ role: 'user', text: ' ' }, { role: 'model', text: 'Respuesta' }],
      [{ role: 'model', text: 'Pregunta' }, { role: 'user', text: 'Respuesta' }],
      [{ role: 'user', text: 'Pregunta', loading: true }, { role: 'model', text: 'Respuesta' }],
    ]) await expect(requestChatReply({ message: 'Ahora', history })).rejects.toMatchObject({ code: 'INVALID_HISTORY' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('informa el exceso de mensajes sin fetch ni recortes', async () => {
    const history = Array(101).fill([{ role: 'user', text: 'Pregunta' }, { role: 'model', text: 'Respuesta' }]).flat();
    await expect(requestChatReply({ message: 'Ahora', history })).rejects.toMatchObject({ status: 413, code: 'HISTORY_TOO_LARGE' });
    expect(fetch).not.toHaveBeenCalled();
    expect(history).toHaveLength(202);
  });

  it('limita bytes UTF-8 del cuerpo completo aunque los caracteres estén dentro del límite', async () => {
    const history = Array(40).fill([{ role: 'user', text: '\u754c'.repeat(1000) }, { role: 'model', text: '\u754c'.repeat(4000) }]).flat();
    await expect(requestChatReply({ message: 'Ahora', history })).rejects.toMatchObject({ status: 413, code: 'BODY_TOO_LARGE' });
    expect(fetch).not.toHaveBeenCalled();
  });
});
