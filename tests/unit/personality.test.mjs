import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { character as presentation } from '../../src/js/character.js';
import { homeView, chatView, aboutView } from '../../src/js/views.js';
import characterModule from '../../server/character.cjs';
import geminiModule from '../../server/gemini.cjs';

describe('Deadpool: personalidad y presentación no oficial', () => {
  it('mantiene la misma identidad pública y privada con fuentes contrastables', () => {
    expect(presentation.id).toBe(characterModule.character.id);
    expect(presentation.identification).toContain('Representación ficticia no oficial');
    expect(presentation.sources).toEqual(characterModule.character.sources);
    expect(characterModule.character.sources.filter(source => source.status === 'consultada').map(source => source.id)).toEqual(['marvel-profile']);
  });

  it('prioriza respuestas útiles y permite humor y cuarta pared sin acoso', () => {
    const prompt = geminiModule.buildSystemInstruction();
    for (const policy of ['Interpreta en primera persona', 'Responde realmente a la pregunta', 'humor negro moderado', 'lenguaje adulto moderado', 'cuarta pared', 'presupuesto ficticio', 'sin insultar gratuitamente']) {
      expect(prompt.toLowerCase()).toContain(policy.toLowerCase());
    }
    expect(prompt).toContain('Las bromas acompañan la respuesta, no la sustituyen');
    expect(prompt).toContain('las preguntas generales sí pueden responderse con conocimiento general');
    expect(prompt).not.toContain('evita afirmaciones que no estén en la base');
    expect(prompt).not.toMatch(/Gustavo|Petro|alcald[íi]a|presidente de Colombia/i);
  });

  it('separa canon, continuidades y humor, sin repetir advertencias', () => {
    const prompt = geminiModule.buildSystemInstruction();
    expect(prompt).toContain('Distingue canon documentado');
    expect(prompt).toContain('No inventes números de cómic');
    expect(prompt).toContain('No empieces cada respuesta con advertencias');
    expect(prompt).toContain('No reproduzcas diálogos extensos');
    expect(presentation.greeting).not.toMatch(/te aclaro|te recuerdo|soy una IA|no soy la persona/i);
  });

  it('renueva las tres vistas, fuentes y metadatos sin conservar referencias biográficas anteriores', () => {
    const output = [homeView(), chatView(), aboutView(), fs.readFileSync('src/index.html', 'utf8'), fs.readFileSync('src/js/router.js', 'utf8')].join('\n');
    expect(output).not.toMatch(/Gustavo|Petro|Ciénaga|Bogotá|CIDOB|Congreso Visible/i);
    expect(output).toContain('Deadpool');
    expect(output).not.toMatch(/flickr|wikimedia|https?:[^"']+\.(?:jpg|png)/i);
    const imagePaths = [...output.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1]);
    expect(imagePaths.length).toBeGreaterThan(0);
    expect(imagePaths.every(path => ['/assets/deadpool-avatar.svg', '/assets/deadpool-portrait.svg', '/assets/deadpool-ambient.svg', '/assets/deadpool-about.svg'].includes(path))).toBe(true);
    expect(aboutView()).toContain('HTML y CSS');
  });

  it('conserva todos los controles y regiones accesibles del chat', () => {
    const chat = chatView();
    for (const id of ['messages', 'chat-form', 'message-input', 'chat-status', 'chat-error', 'retry-message', 'reset-chat', 'character-count']) expect(chat).toContain(`id="${id}"`);
    expect(chat).toContain('role="log"');
    expect(chat).toContain('aria-live="polite"');
    expect(chat).toContain('maxlength="1000"');
  });

  it('utiliza SVG locales inertes, con tamaño intrínseco y fondos decorativos accesibles', () => {
    for (const asset of ['deadpool-avatar.svg', 'deadpool-portrait.svg', 'deadpool-ambient.svg', 'deadpool-about.svg']) {
      const svg = fs.readFileSync(`src/assets/${asset}`, 'utf8');
      expect(svg).toContain('viewBox=');
      expect(svg).toContain('<title');
      expect(svg).not.toMatch(/<script|<foreignObject|<image|\son\w+\s*=|(?:href|src)\s*=/i);
    }
    const chat = chatView();
    expect(chat).toContain('class="chat-character-backdrop"');
    expect(chat).toContain('alt="" aria-hidden="true"');
    expect(chat).toContain('width="44" height="44"');
  });
});
