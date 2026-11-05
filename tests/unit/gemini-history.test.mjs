import { describe, expect, it, vi } from 'vitest';
import geminiModule from '../../server/gemini.cjs';

const { createGeminiProvider, buildSystemInstruction } = geminiModule;

describe('Contrato de historial con el SDK simulado', () => {
  it('mantiene todos los mensajes, orden y roles y agrega el mensaje actual una sola vez', async () => {
    const generateContent = vi.fn().mockResolvedValue({ text: JSON.stringify({ reply: 'Respuesta documentada', sourceIds: [] }) });
    const provider = createGeminiProvider({ env: { GEMINI_MODEL: 'model-under-test' }, client: { models: { generateContent } } });
    const history = Array.from({ length: 10 }, (_, index) => [
      { role: 'user', text: `Pregunta ${index}` }, { role: 'model', text: `Respuesta ${index}` },
    ]).flat();
    const original = structuredClone(history);
    await provider.generate({ message: 'Actual', history });
    expect(generateContent).toHaveBeenCalledTimes(1);
    expect(generateContent.mock.calls[0][0].contents).toEqual(
      [...history, { role: 'user', text: 'Actual' }].map(item => ({ role: item.role, parts: [{ text: item.text }] })),
    );
    expect(history).toEqual(original);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('incluye las mismas instrucciones del personaje ficticio del servidor en cada solicitud', async () => {
    const generateContent = vi.fn().mockResolvedValue({ text: JSON.stringify({ reply: 'Respuesta', sourceIds: [] }) });
    const provider = createGeminiProvider({ env: { GEMINI_MODEL: 'model-under-test' }, client: { models: { generateContent } } });
    await provider.generate({ message: 'Primero', history: [] });
    await provider.generate({ message: 'Segundo', history: [{ role: 'user', text: 'Primero' }, { role: 'model', text: 'Respuesta' }] });
    expect(generateContent).toHaveBeenCalledTimes(2);
    for (const [input] of generateContent.mock.calls) {
      expect(input.config.systemInstruction).toBe(buildSystemInstruction());
      expect(input.config.systemInstruction).toContain('Interpreta en primera persona una versión conversacional inspirada en Deadpool');
      expect(input.contents.every(item => ['user', 'model'].includes(item.role))).toBe(true);
    }
    expect(fetch).not.toHaveBeenCalled();
  });
});
