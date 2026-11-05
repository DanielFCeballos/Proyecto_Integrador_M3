# Bloque 8 · Deadpool / Fuera de viñeta

Se sustituye la identidad anterior por una representación ficticia no oficial inspirada en Deadpool, Wade Wilson. La identificación permanece visible en las tres vistas. No hay afiliación con Marvel ni se presentan los mensajes como diálogos auténticos.

## Personalidad y alcance

El servidor solicita primera persona, sarcasmo y espontaneidad con humor negro y lenguaje adulto moderados. Debe responder la pregunta antes del remate y puede tratar preguntas generales, como programación, sin inventar referencias de Marvel. No se repiten advertencias sobre IA en respuestas ordinarias. Las preguntas explícitas de identidad reciben una aclaración breve.

Las bromas sobre el chatbot, desarrolladores, código y presupuesto son improvisaciones ficticias. No implican acceso a datos privados ni describen recursos reales del proyecto. Se evitan insultos gratuitos, acoso, odio y violencia gráfica. La base distingue canon documentado, interpretación y continuidades de distintos medios.

Fuente factual consultada: [ficha oficial de Marvel Multiverse](https://cdn.marvel.com/u/prod/marvel/i/pdf/MMRPG_CharacterProfiles_20240717.pdf), sección Deadpool. La [guía de lectura de Marvel](https://www.marvel.com/comics/guides/218/deadpool) se localizó mediante extractos del buscador, pero devolvió 403 al abrirla; por eso no es un ID autorizado para fundamentar respuestas. La app conserva la referencia con esa limitación explícita. No se descargó el PDF ni material gráfico al repositorio.

## Diseño y recursos

Home, Chat y About usan rojo, negro y gris con tipografía del sistema. Tramas, paneles, bocadillos y composición tipográfica son HTML/CSS originales. No se reproducen ilustraciones, fotogramas, actores, logotipos ni emblemas oficiales. Los créditos explican el alcance; no se atribuye una licencia de Marvel al proyecto.

La fotografía anterior se trasladó fuera de `src/` y `dist/` a `archivos-retirados/` dentro del respaldo. Los archivos originales permanecen conservados. El contenido público y el README ya no presentan la biografía anterior.

## Archivos afectados

- Presentación: `src/index.html`, `src/styles.css`, `src/js/character.js`, `src/js/views.js`, `src/js/router.js`, `src/assets/CREDITS.md`.
- Servidor: `server/character.cjs`, `server/gemini.cjs` (personalidad, fuentes y prompt; no cambia el modelo ni la configuración de generación).
- Pruebas: `tests/chat.test.cjs`, `tests/unit/chat-api.test.mjs`, `gemini-history.test.mjs`, `history.test.mjs`, `response.test.mjs`, `README.md`; nuevo `tests/unit/personality.test.mjs`.
- Preparación: `.gitignore`, `.vercelignore`, `scripts/verify-production.cjs` (exclusión comprobada de materiales académicos locales conocidos).
- Documentación/metadatos: `README.md`, `package.json` (descripción), `docs/PUBLICACION.md` y este documento.
- Recurso retirado del árbol público y preservado: fotografía anterior de `src/assets/` y copia generada en `dist/assets/`.

No se cambia el lockfile, no se instalan dependencias y no se modifican `GEMINI_API_KEY` ni `GEMINI_MODEL`. La función serverless, Fetch API, History API, historial completo, manejo de errores y cancelación mantienen su arquitectura. `evidencias/` se compara byte a byte con su respaldo y permanece intacta.

## Respaldo

`.respaldos/bloque8-20261104-164542/`, antes de editar. Incluye frontend, servidor, API, scripts, configuración, paquetes, documentación, pruebas (sin `.env`) y copia de las evidencias. Los recursos retirados se conservan además en `archivos-retirados/`. Ninguno se incorpora a Git.

## Comprobaciones

```powershell
npm.cmd test
npm.cmd run test:api
npm.cmd run build
npm.cmd run verify:production
```

- 43 casos Vitest en siete archivos, con fetch y SDK simulados.
- 16 casos originales de API, adaptando las expectativas del personaje y conservando cobertura de seguridad, historial y errores.
- Revisión de sintaxis del JavaScript de navegador, servidor, scripts y pruebas.
- Build y preflight de publicación: sin módulos de servidor, secretos ni material académico en la salida pública.
- Chrome headless con proveedor simulado: las tres vistas a 320, 375, 768, 1024 y 1440 px; sin desbordamiento horizontal, identificación visible, contraste de mensajes mínimo 4.5:1 y sin peticiones HTTP externas.
- Continuidad SPA, historial completo tras ocho turnos adicionales, roles y orden, no duplicación al reintentar, error 429, Enter/Mayús+Enter, cancelación y descarte de respuestas tardías al reiniciar.

Las capturas de revisión se guardan únicamente en `.respaldos/bloque8-*-mock.png`. Contienen estados con un proveedor simulado y no son evidencia de respuestas reales de Gemini. No se incorporaron capturas a `evidencias/` ni se modificaron las existentes.

## Cómo revisar y qué queda pendiente

Con `npm.cmd start`, abrir `http://localhost:3000/home`, `/chat` y `/about` para revisar las vistas. Solo abrirlas no realiza una llamada a Gemini; enviar un mensaje sí usa la configuración real y consume cuota. Para reproducir la revisión local sin cuota, los auxiliares ignorados `.respaldos/mock-bloque8-server.cjs` y `.respaldos/verify-bloque8-browser.cjs` utilizan un proveedor simulado en el puerto 3008, sin cargar archivos de entorno.

El comportamiento efectivo de la personalidad requiere una evaluación autenticada posterior autorizada; las pruebas actuales validan instrucciones y flujo, no la calidad de un modelo real. Antes de publicar faltan las evidencias reales actualizadas, el control de abuso del endpoint y la validación de instalación, rutas, función y chat en Vercel. No hay commits, push ni despliegues en este bloque. No se activa facturación.
