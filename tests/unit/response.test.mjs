import { describe, expect, it } from 'vitest';
import geminiModule from '../../server/gemini.cjs';

const { parseResponse } = geminiModule;

describe('Procesamiento de respuestas Gemini sin invocar el SDK', () => {
  it('normaliza el texto, filtra fuentes desconocidas y elimina duplicados', () => {
    const input = { text: JSON.stringify({ reply: '  Una respuesta documentada.  ', sourceIds: ['marvel-profile', 'inventada', 'marvel-profile'] }) };
    expect(parseResponse(input)).toEqual({ reply: 'Una respuesta documentada.', sourceIds: ['marvel-profile'], generatedBy: 'gemini' });
  });

  it('rechaza JSON malformado sin propagar el contenido recibido', () => {
    expect(() => parseResponse({ text: 'contenido interno no válido' })).toThrow(expect.objectContaining({ code: 'INVALID_RESPONSE', message: 'INVALID_RESPONSE' }));
  });

  it('rechaza respuestas vacías o mayores de 4000 caracteres', () => {
    for (const reply of ['   ', 'x'.repeat(4001)]) {
      expect(() => parseResponse({ text: JSON.stringify({ reply, sourceIds: [] }) })).toThrow(expect.objectContaining({ code: 'INVALID_RESPONSE' }));
    }
  });

  it('rechaza estructuras incorrectas de referencias', () => {
    for (const sourceIds of [null, 'marvel-profile', [7]]) {
      expect(() => parseResponse({ text: JSON.stringify({ reply: 'Respuesta', sourceIds }) })).toThrow(expect.objectContaining({ code: 'INVALID_RESPONSE' }));
    }
  });

  it('reconoce el bloqueo de seguridad incluso si viene acompañado de texto', () => {
    expect(() => parseResponse({ promptFeedback: { blockReason: 'SAFETY' }, text: JSON.stringify({ reply: 'Texto', sourceIds: [] }) })).toThrow(expect.objectContaining({ code: 'SAFETY_BLOCKED' }));
  });

  it('reconoce contenido bloqueado por el motivo de finalización', () => {
    expect(() => parseResponse({ candidates: [{ finishReason: 'RECITATION' }] })).toThrow(expect.objectContaining({ code: 'SAFETY_BLOCKED' }));
  });
});
