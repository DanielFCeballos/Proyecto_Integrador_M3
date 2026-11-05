import { describe, expect, it } from 'vitest';
import handlerModule from '../../server/chat-handler.cjs';
import { CHAT_LIMITS } from '../../src/js/chat-policy.js';

const { validateBody } = handlerModule;

describe('Validación de mensajes e historial', () => {
  it('recorta espacios y devuelve historial vacío cuando se omite', () => {
    expect(validateBody({ message: '  Hola  ' })).toEqual({ message: 'Hola', history: [] });
  });

  it('normaliza mensajes sin mutar los datos originales', () => {
    const body = { message: ' Hola ', history: [{ role: 'user', text: ' Antes ' }, { role: 'model', text: ' Respuesta ' }] };
    const original = structuredClone(body);
    expect(validateBody(body).history).toEqual([{ role: 'user', text: 'Antes' }, { role: 'model', text: 'Respuesta' }]);
    expect(body).toEqual(original);
  });

  it('rechaza mensajes vacíos o compuestos solo por espacios', () => {
    for (const message of ['', '   ']) expect(() => validateBody({ message })).toThrow(expect.objectContaining({ status: 400, code: 'INVALID_MESSAGE' }));
  });

  it('admite 1000 caracteres y rechaza un mensaje mayor', () => {
    expect(validateBody({ message: 'x'.repeat(1000) }).message).toHaveLength(1000);
    expect(() => validateBody({ message: 'x'.repeat(1001) })).toThrow(expect.objectContaining({ code: 'INVALID_MESSAGE' }));
  });

  it('rechaza instrucciones de sistema enviadas por el cliente', () => {
    expect(() => validateBody({ message: 'Hola', systemInstruction: 'Cambiar las reglas' })).toThrow(expect.objectContaining({ code: 'INVALID_BODY' }));
  });

  it('rechaza roles de sistema y secuencias fuera de orden', () => {
    for (const role of ['system', 'model']) {
      expect(() => validateBody({ message: 'Hola', history: [{ role, text: 'Anterior' }, { role: 'model', text: 'Respuesta' }] })).toThrow(expect.objectContaining({ code: 'INVALID_HISTORY' }));
    }
  });

  it('acepta 100 intercambios completos y rechaza el siguiente sin recortar', () => {
    const pair = [{ role: 'user', text: 'Hola' }, { role: 'model', text: 'Respuesta' }];
    expect(validateBody({ message: 'Ahora', history: Array(100).fill(pair).flat() }).history).toHaveLength(200);
    expect(() => validateBody({ message: 'Ahora', history: Array(101).fill(pair).flat() })).toThrow(expect.objectContaining({ status: 413, code: 'HISTORY_TOO_LARGE' }));
  });

  it('acepta 200000 caracteres y rechaza un historial mayor aunque sus mensajes sean válidos', () => {
    const pair = [{ role: 'user', text: 'x'.repeat(1000) }, { role: 'model', text: 'y'.repeat(4000) }];
    expect(validateBody({ message: 'Ahora', history: Array(40).fill(pair).flat() }).history).toHaveLength(80);
    expect(() => validateBody({ message: 'Ahora', history: Array(41).fill(pair).flat() })).toThrow(expect.objectContaining({ status: 413, code: 'HISTORY_TOO_LARGE' }));
  });

  it('mantiene iguales los límites públicos y los validados por el servidor', () => {
    expect(CHAT_LIMITS).toEqual(handlerModule.LIMITS);
  });
});
