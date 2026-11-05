import { describe, expect, it } from 'vitest';
import { buildHistory } from '../../src/js/chat.js';

describe('Historial completo de intercambios confirmados', () => {
  it('devuelve una lista vacía si no hay turnos completados', () => {
    expect(buildHistory([])).toEqual([]);
  });

  it('convierte turnos en mensajes user/model ordenados sin mutar la entrada', () => {
    const turns = [{ user: 'Pregunta uno', model: 'Respuesta uno' }, { user: 'Pregunta dos', model: 'Respuesta dos' }];
    const original = structuredClone(turns);
    expect(buildHistory(turns)).toEqual([
      { role: 'user', text: 'Pregunta uno' }, { role: 'model', text: 'Respuesta uno' },
      { role: 'user', text: 'Pregunta dos' }, { role: 'model', text: 'Respuesta dos' },
    ]);
    expect(turns).toEqual(original);
  });

  it('conserva todos los turnos, incluidos los anteriores a los cuatro más recientes', () => {
    const turns = Array.from({ length: 6 }, (_, index) => ({ user: `Pregunta ${index}`, model: `Respuesta ${index}` }));
    const result = buildHistory(turns);
    expect(result).toHaveLength(12);
    expect(result[0]).toEqual({ role: 'user', text: 'Pregunta 0' });
    expect(result.at(-1)).toEqual({ role: 'model', text: 'Respuesta 5' });
  });

  it('conserva íntegros historiales de más de 12000 caracteres', () => {
    const turns = Array.from({ length: 4 }, (_, index) => ({ user: String(index).repeat(1000), model: String(index).repeat(4000) }));
    const result = buildHistory(turns);
    expect(result.map(item => item.role)).toEqual(Array(4).fill(['user', 'model']).flat());
    expect(result.reduce((total, item) => total + item.text.length, 0)).toBe(20000);
    expect(result[0].text).toBe('0'.repeat(1000));
    expect(turns).toHaveLength(4);
  });

  it('envía cada intercambio una sola vez y conserva repeticiones legítimas', () => {
    const turns = [{ user: 'Repite', model: 'Respuesta', status: 'complete', sourceIds: ['marvel-profile'] }, { user: 'Repite', model: 'Otra respuesta' }];
    expect(buildHistory(turns)).toEqual([
      { role: 'user', text: 'Repite' }, { role: 'model', text: 'Respuesta' },
      { role: 'user', text: 'Repite' }, { role: 'model', text: 'Otra respuesta' },
    ]);
  });

  it('rechaza mensajes vacíos en lugar de omitirlos silenciosamente', () => {
    expect(() => buildHistory([{ user: 'Hola', model: '  ' }])).toThrow(expect.objectContaining({ code: 'INVALID_HISTORY' }));
  });

  it('rechaza más de 100 intercambios sin mutar ni recortar la conversación', () => {
    const turns = Array.from({ length: 101 }, () => ({ user: 'Pregunta', model: 'Respuesta' }));
    expect(() => buildHistory(turns)).toThrow(expect.objectContaining({ status: 413, code: 'HISTORY_TOO_LARGE' }));
    expect(turns).toHaveLength(101);
  });

  it('rechaza un historial superior al límite de texto sin truncarlo', () => {
    const turns = Array.from({ length: 41 }, () => ({ user: 'x'.repeat(1000), model: 'y'.repeat(4000) }));
    expect(() => buildHistory(turns)).toThrow(/No se ha recortado el historial/);
    expect(turns).toHaveLength(41);
  });
});
