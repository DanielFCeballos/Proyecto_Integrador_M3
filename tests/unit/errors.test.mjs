import { EventEmitter } from 'node:events';
import { describe, expect, it, vi } from 'vitest';
import handlerModule from '../../server/chat-handler.cjs';

const { createChatHandler } = handlerModule;
const request = () => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: { message: 'Hola', history: [] } });
const response = () => Object.assign(new EventEmitter(), { writeHead: vi.fn(), end: vi.fn(), setHeader: vi.fn() });

describe('Errores del handler con proveedor simulado y sin servidor HTTP', () => {
  it('convierte una cuota del proveedor en 429 y no filtra detalles internos', async () => {
    const generate = vi.fn().mockRejectedValue(Object.assign(new Error('detalle interno del proveedor'), { status: 429 }));
    const handler = createChatHandler({ getProvider: vi.fn(() => ({ generate })) });
    const res = response();
    await handler(request(), res);
    expect(generate).toHaveBeenCalledTimes(1);
    expect(res.writeHead).toHaveBeenCalledWith(429, expect.objectContaining({ 'Content-Type': 'application/json; charset=utf-8' }));
    expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '30');
    const body = JSON.parse(res.end.mock.calls[0][0]);
    expect(body.error.code).toBe('RATE_LIMITED');
    expect(body.error.message).not.toContain('detalle interno');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('convierte un fallo inesperado en 502 sin exponer el error original', async () => {
    const generate = vi.fn().mockRejectedValue(new Error('dato privado que no debe salir'));
    const res = response();
    await createChatHandler({ getProvider: () => ({ generate }) })(request(), res);
    expect(res.writeHead).toHaveBeenCalledWith(502, expect.any(Object));
    expect(JSON.parse(res.end.mock.calls[0][0]).error.code).toBe('UPSTREAM_ERROR');
    expect(res.end.mock.calls[0][0]).not.toContain('dato privado');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rechaza un mensaje vacío sin consultar al proveedor', async () => {
    const getProvider = vi.fn();
    const res = response();
    await createChatHandler({ getProvider })({ ...request(), body: { message: '   ' } }, res);
    expect(res.writeHead).toHaveBeenCalledWith(400, expect.any(Object));
    expect(getProvider).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rechaza el historial excesivo con 413 claro antes de consultar al proveedor', async () => {
    const getProvider = vi.fn();
    const res = response();
    const history = Array(101).fill([{ role: 'user', text: 'Pregunta' }, { role: 'model', text: 'Respuesta' }]).flat();
    await createChatHandler({ getProvider })({ ...request(), body: { message: 'Ahora', history } }, res);
    expect(res.writeHead).toHaveBeenCalledWith(413, expect.any(Object));
    expect(JSON.parse(res.end.mock.calls[0][0]).error).toMatchObject({ code: 'HISTORY_TOO_LARGE', message: expect.stringContaining('No se ha recortado el historial') });
    expect(getProvider).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
});
