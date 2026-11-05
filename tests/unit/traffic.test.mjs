import { EventEmitter } from 'node:events';
import { describe, expect, it, vi } from 'vitest';
import handlerModule from '../../server/chat-handler.cjs';

const { createChatHandler, TRAFFIC_LIMITS } = handlerModule;
const request = (message = 'Pregunta') => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: { message, history: [] } });
const response = () => Object.assign(new EventEmitter(), { writeHead: vi.fn(), setHeader: vi.fn(), end: vi.fn() });
const success = { reply: 'Respuesta simulada', sourceIds: [], generatedBy: 'gemini' };

describe('Protección básica por instancia, sin servicios externos', () => {
  it('rechaza la tercera generación concurrente antes del proveedor y libera plazas al terminar', async () => {
    const releases = [];
    const generate = vi.fn(() => new Promise(resolve => releases.push(resolve)));
    const getProvider = vi.fn(() => ({ generate }));
    const handler = createChatHandler({ getProvider });
    const first = handler(request(), response());
    const second = handler(request(), response());
    await vi.waitFor(() => expect(generate).toHaveBeenCalledTimes(2));
    const blocked = response();
    await handler(request(), blocked);
    expect(blocked.writeHead).toHaveBeenCalledWith(429, expect.any(Object));
    expect(JSON.parse(blocked.end.mock.calls[0][0]).error.code).toBe('SERVER_BUSY');
    expect(blocked.setHeader).toHaveBeenCalledWith('Retry-After', '2');
    expect(getProvider).toHaveBeenCalledTimes(2);
    releases.forEach(release => release(success));
    await Promise.all([first, second]);
    generate.mockResolvedValue(success);
    const next = response();
    await handler(request(), next);
    expect(next.writeHead).toHaveBeenCalledWith(200, expect.any(Object));
    expect(fetch).not.toHaveBeenCalled();
  });

  it('limita a 20 solicitudes admitidas por minuto y reabre la ventana sin temporizadores', async () => {
    let clock = 0;
    const generate = vi.fn().mockResolvedValue(success);
    const handler = createChatHandler({ getProvider: () => ({ generate }), now: () => clock });
    for (let index = 0; index < TRAFFIC_LIMITS.requests; index++) {
      const res = response();
      await handler(request(), res);
      expect(res.writeHead).toHaveBeenCalledWith(200, expect.any(Object));
    }
    clock = 5000;
    const blocked = response();
    await handler(request(), blocked);
    expect(blocked.writeHead).toHaveBeenCalledWith(429, expect.any(Object));
    expect(blocked.setHeader).toHaveBeenCalledWith('Retry-After', '55');
    expect(JSON.parse(blocked.end.mock.calls[0][0]).error.code).toBe('SERVER_RATE_LIMITED');
    expect(generate).toHaveBeenCalledTimes(20);
    clock = TRAFFIC_LIMITS.windowMs;
    const next = response();
    await handler(request(), next);
    expect(next.writeHead).toHaveBeenCalledWith(200, expect.any(Object));
    expect(generate).toHaveBeenCalledTimes(21);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('libera la plaza incluso si la construcción del proveedor falla', async () => {
    const getProvider = vi.fn().mockImplementation(() => { throw new Error('private'); });
    const handler = createChatHandler({ getProvider });
    for (let index = 0; index < 3; index++) {
      const res = response();
      await handler(request(), res);
      expect(res.writeHead).toHaveBeenCalledWith(502, expect.any(Object));
      expect(res.end.mock.calls[0][0]).not.toContain('private');
    }
    expect(getProvider).toHaveBeenCalledTimes(3);
  });

  it('no consume la ventana de generación con mensajes inválidos', async () => {
    const getProvider = vi.fn(() => ({ generate: vi.fn().mockResolvedValue(success) }));
    const handler = createChatHandler({ getProvider });
    for (let index = 0; index < TRAFFIC_LIMITS.requests + 1; index++) await handler(request('  '), response());
    expect(getProvider).not.toHaveBeenCalled();
    const valid = response();
    await handler(request(), valid);
    expect(valid.writeHead).toHaveBeenCalledWith(200, expect.any(Object));
  });
});
