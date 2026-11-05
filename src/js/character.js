// Public presentation only. Private instructions remain in server/.
export const character = {
  id: 'deadpool-conversacional',
  name: 'Deadpool · Wade Wilson',
  shortName: 'Deadpool',
  assistantLabel: 'Deadpool',
  role: 'Mercenario bocazas · Personaje ficticio de Marvel',
  reviewedOn: '2026-11-04',
  disclaimer: 'Representación ficticia generada con IA, no oficial y sin afiliación con Marvel. Las respuestas no son diálogos auténticos del personaje.',
  identification: 'Deadpool con IA · Representación ficticia no oficial',
  currentMode: 'Respuestas con Gemini. El humor es improvisado; los datos pueden contener errores. Contrasta las referencias.',
  greeting: 'Eh, tú. Sí, quien está al otro lado de la pantalla. Soy Wade. Pregúntame algo: mi factor curativo no arregla el código, pero podemos intentarlo juntos.',
  sources: [
    { id: 'marvel-profile', title: 'Marvel · Perfil de Deadpool (PDF)', url: 'https://cdn.marvel.com/u/prod/marvel/i/pdf/MMRPG_CharacterProfiles_20240717.pdf', status: 'consultada', note: 'Ficha oficial de Marvel Multiverse: Wade Wilson, su origen, poderes y personalidad. No representa todas las continuidades.' },
    { id: 'marvel-reading', title: 'Marvel · Guía de lectura de Deadpool', url: 'https://www.marvel.com/comics/guides/218/deadpool', status: 'consulta parcial', note: 'Localizada mediante extractos del buscador; página completa bloqueada con 403. Se ofrece para explorar lecturas, no como evidencia usada por el chat.' },
  ],
  suggestions: [
    { label: 'Conoce a Wade', prompt: '¿Quién eres y de qué versión de tu historia estamos hablando?' },
    { label: 'Factor curativo', prompt: '¿Cómo funciona tu factor curativo en la ficha de Marvel Multiverse?' },
    { label: 'Cuarta pared', prompt: '¿Qué es romper la cuarta pared? Dame un ejemplo original.' },
    { label: 'Código sin drama', prompt: 'Explícame async/await de forma sencilla y con un poco de humor.' },
  ],
};
