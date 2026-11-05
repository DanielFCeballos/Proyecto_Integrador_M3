# Bloque 9 · Caracterización visual

Respaldo previo: `.respaldos/bloque9-20261104-174305/`. Incluye frontend, servidor, API, scripts, documentación, paquetes, pruebas (sin archivos de entorno) y copia de las evidencias.

## Recursos y procedencia

- `src/assets/deadpool-avatar.svg`: interpretación geométrica original de la máscara, dibujada mediante código SVG para este proyecto. Aparece en la marca global, encabezado del chat y junto al saludo y las respuestas del personaje.
- `src/assets/deadpool-portrait.svg`: retrato original estilizado con traje rojo y negro, ojos blancos y empuñaduras a la espalda. Se utiliza en Home, lateral del chat y fondo decorativo.
- No se descargaron ni calcaron ilustraciones oficiales ni fotografías. No se incorporaron fuentes externas, imágenes incrustadas o librerías gráficas. Los SVG son estáticos y no contienen scripts, enlaces ni contenido externo.
- La autoría de estos trazados nuevos no concede derechos sobre el personaje ni implica autorización de Marvel. Se mantiene la identificación de representación ficticia no oficial. [Créditos completos](../src/assets/CREDITS.md).

## Presentación y accesibilidad

La marca muestra un avatar de 32 px para identificar al personaje incluso antes de desplazarse en Home. El encabezado del chat usa 44 px en móvil y 52 px en escritorio; cada respuesta tiene un avatar de 28 o 32 px. El avatar es decorativo porque el nombre del autor ya se anuncia en texto. El recurso de fondo también se excluye del árbol de accesibilidad.

En anchos menores de 768 px se ocultan el lateral y el fondo. A partir de 768 px el retrato de fondo tiene opacidad 0.13 y un degradado horizontal; los mensajes conservan fondos opacos. La cabecera permanece compacta y los recursos usan dimensiones explícitas para evitar saltos de disposición.

El cambio en `chat.js` se limita al DOM de presentación del avatar. No se agregan imágenes ni estados visuales al historial enviado. Los módulos de personaje, personalidad, system prompt, SDK, API, modelo, dependencias y ciclo de historial/cancelación se compararon con el respaldo y permanecen iguales. `scripts/server.cjs` incorpora únicamente el tipo MIME `image/svg+xml`.

## Archivos

Modificados: `src/index.html`, `src/js/views.js`, `src/js/chat.js`, `src/styles.css`, `src/assets/CREDITS.md`, `scripts/server.cjs`, `tests/chat.test.cjs`, `tests/unit/personality.test.mjs`, `tests/unit/README.md` y `README.md`.

Creados: los dos SVG y este documento. El build actualiza archivos generados en `dist/`, excluido de Git. No se modifica `evidencias/`; sus rutas y bytes se compararon con el respaldo.

## Verificación local

```powershell
npm.cmd test
npm.cmd run test:api
npm.cmd run build
npm.cmd run verify:production
```

Resultados: 44 casos Vitest y 16 casos originales de API aprobados; build, preflight y sintaxis correctos. La prueba del adaptador comprueba además que ambos SVG respondan HTTP 200 y `Content-Type: image/svg+xml`.

Chrome headless con Gemini simulado comprueba Home, Chat y About a 320, 375, 768, 1024 y 1440 px: sin scroll horizontal, identificación permanente, recursos cargados, cabecera compacta y fondo/lateral ocultos en móvil. Los mensajes mantienen contraste mínimo 4.5:1. Se verifica un avatar por mensaje del personaje y ninguno en mensajes del usuario, además del historial completo, navegación, errores, reintento y reinicio/cancelación.

Capturas de revisión: `.respaldos/bloque9-*-mock.png`. No se presentan como evidencia de Gemini real ni se incorporan a `evidencias/`. Para reproducir la comprobación local sin cuota se conservan los auxiliares `.respaldos/mock-bloque9-server.cjs` y `.respaldos/verify-bloque9-browser.cjs`, en puerto 3009 y con proveedor inyectado, sin cargar `.env`.

Para revisar únicamente las vistas, ejecutar `npm.cmd start` y abrir `http://localhost:3000/home`, `/chat` y `/about`. No enviar mensajes en ese servidor si no se quiere consumir Gemini real.

Pendientes de publicación: capturas reales actualizadas, control de abuso del endpoint y validación remota autorizada en Vercel. Este bloque no evalúa respuestas autenticadas, no cambia credenciales ni modelo, no instala dependencias y no realiza commits, push o despliegues.
