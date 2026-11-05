# Auditoría de entrega · Bloque 13

Fecha: 5 de noviembre de 2026, America/Bogota.
Proyecto: Deadpool / Fuera de viñeta · Proyecto Integrador M3 de SoyHenry.
**Dictamen: APTO CON PENDIENTES.** El código y las verificaciones locales permiten preparar la publicación; no se acredita todavía una entrega académica completa en nivel Excelente porque faltan despliegue, URLs reales y parte de la evidencia. No se publicó nada.

## Alcance, fuentes y reglas de valoración

Respaldo previo: **.respaldos/bloque13-20261105-140548/**. Se copiaron código, configuración, documentación y evidencias antes de modificar el README o crear este informe. Se excluyeron los archivos .env de pruebas. No se modificaron los originales académicos ni las capturas.

Fuentes originales consultadas en C:/Users/Daniel Felipe/Desktop/Lecturas_Henry_M3:

- **PI (9)/Rubrica.png:** inspección visual de los ocho requisitos y sus descriptores Excelente/Satisfactorio/Insuficiente. Es la autoridad para valorar el nivel.
- **PI (9)/Presentación de PI M3.pptx:** lectura de las diapositivas originales desde su XML, sin extraerlas al repositorio. Diapositivas 3–4: objetivos; 6: entregable; 7: estructura sugerida; 9–12: consigna y mínimos; 13–14: extras expresamente no obligatorios.
- **PI (9)/L9-03_files/GO1Stc_b9u86.html:** consigna y alcance mínimo.
- **PI (9)/L9-04_files/GO1Stc_b9u86.html:** entregable final, README, GitHub y URL pública.
- **PI (9)/L9-05_files/GO1Stc_b9u86.html:** guía de acompañamiento, que aclara que no reemplaza la consigna ni impone una única solución. Su contenido incluye el envío del historial en cada llamada y la documentación de prompts/decisiones.
- Lectures L1 a L8: se identificaron los títulos de las secciones guardadas y se leyeron los apartados relevantes indicados abajo. El contenido real está en *_files/*.html; los HTML superiores son contenedores.

No se usa documentación externa para añadir obligaciones académicas. No se copiaron lectures, presentaciones, rúbrica ni material de ejemplo al repositorio público.

**Estados:** CUMPLIDO significa comprobado en el alcance indicado; PARCIAL significa implementación/evidencia presente pero falta una parte; PENDIENTE señala un entregable ausente; NO VERIFICABLE indica que no puede comprobarse con la evidencia disponible. La valoración de Excelente es local y técnica; no sustituye la calificación del docente.

## 1. Matriz de trazabilidad

En esta tabla, la columna de requisito reproduce el texto de “Requerimiento por categoría” de la rúbrica. El descriptor de Excelente se reproduce en la sección siguiente.

| Criterio y requisito exacto | Lecture correspondiente | Archivos y funciones | Prueba y evidencia disponibles | Estado / Excelente |
| --- | --- | --- | --- | --- |
| **1. Diseño Responsive (Mobile-First).** “Implementa diseño mobile-first funcional en 3 tamaños (mobile, tablet, desktop) usando Flexbox/Grid y media queries.” | L1: Introducción al Diseño Mobile-First; Viewport; Unidades relativas; Flexbox; Media Queries y Breakpoints; Estados visuales. | src/styles.css: estilos base móviles, Grid/Flexbox, clamp, media queries 375/768/960/1024/1440, object-fit/position. src/index.html: viewport y semántica. | Chrome con proveedor simulado: Home/Chat/About en 320, 375, 766, 768, 960, 1024 y 1440 px, sin overflow horizontal. Capturas reales Responsive-mobile.png (viewport 320), Responsive-tablet.png (768) y Responsive-Destktop.png (1440). | **CUMPLIDO localmente. Excelente compatible con lo comprobado.** La observación de captura de tablet quedó corregida en el Bloque 14: está disponible Responsive-tablet.png a 768 px. |
| **2. Implementación de SPA con History API.** “Implementa routing funcional (/home, /chat, /about) sin recarga de página usando History API.” | L2-03 History API; L2-04 Router; L2-05 Intercepción; L2-06 Consistencia UI/URL; L2-07 Rutas en deploy; L2-09 Home/Chat/About. | src/js/router.js: createRouter, render, pushState, popstate, replaceState inicial y cleanup. main.js: mapa de vistas. views.js: homeView/chatView/aboutView/notFoundView. vercel.json: rewrites exactos. | Prueba Chrome conserva un marcador del documento al navegar/back/forward, verifica render inicial y rutas directas; tests/chat.test.cjs verifica las tres rutas HTTP. Home.png, Chat-gemini.png y About.png muestran URLs locales correctas. | **CUMPLIDO localmente. Excelente compatible en local.** Recarga y rutas reales de Vercel pendientes dentro del criterio 8. Una captura aislada no prueba ausencia de recarga. |
| **3. Lógica Asíncrona y Fetch API.** “Implementa llamadas asíncronas con async/await, manejo de errores y estados (loading/error).” | L3-01 Asincronía y UX; L3-03 async/await; L3-04 Fetch API; L3-05 Estados UI. L4-08 Separar fetching y UI. | chat-api.js: requestChatReply, fetch y comprobación response.ok/JSON. chat.js: sendMessage, try/catch/finally, activeRequest, lastError, AbortController y timeout. | chat-api.test.mjs y errors.test.mjs cubren HTTP/red/JSON y errores seguros. Chrome verifica carga, envío deshabilitado, 429 y reintento. No hay captura separada de loading/error en evidencias. | **CUMPLIDO localmente. Excelente compatible en los casos probados.** Mejora diagnóstica identificada: el frontend pierde code/status al lanzar Error y varios fallos upstream se agrupan como 502; no se corrigió sin autorización. |
| **4. Integración con AI API (Gemini).** “Integra correctamente Gemini AI mediante envío de mensajes con roles y system prompt bien diseñado.” | L6-01 Integración a nivel API; L6-02 Payload; L6-03 System prompt; L6-04 Parámetros; L6-05 Rate limiting; L6-06 Tokens; L6-07 Historial; L6-08 Parseo. L7-04 Integración real. | server/character.cjs: character, responsePolicy, buildCharacterInstructions. gemini.cjs: buildSystemInstruction, createGeminiProvider.generate y parseResponse. chat.js: completedTurns/buildHistory. chat-policy.js: validateHistory/serializeChatRequest. | gemini-history.test.mjs, history.test.mjs, response.test.mjs y suite API prueban roles, orden, contexto completo, mensaje actual una vez y prompt en cada request. Chrome verifica ocho turnos adicionales. Chat-gemini.png muestra respuesta con voz del personaje; Historial-chat.png muestra dos turnos. | **PARCIAL. Excelente no completamente verificable.** La implementación cumple el contrato dentro de límites explícitos; falta evidencia de petición autenticada actual con contexto completo tras más de cuatro turnos y resolver/documentar el incidente real de UPSTREAM_ERROR. Las imágenes solas no identifican al proveedor ni prueban el payload. |
| **5. Seguridad y Serverless Functions.** “Implementa Vercel Serverless Function como proxy seguro. No expone API key. Usa variables de entorno correctamente.” | L7-01 Gestión de API Keys; L7-02 Vercel Functions; L7-03 Mock/entorno; L7-04 Integración. L8-03 Deployment. | api/chat.js: export createChatHandler(). chat-handler.cjs: readBody, validateBody, publicError, sendJson, límites y control de tráfico. gemini.cjs: process.env solo servidor. scripts/server.cjs: cargador local de entorno y aislamiento de src. | Suite API y traffic.test.mjs; preflight verifica salida pública, plantilla, Git y SDK. No hay claves en src. .env.example tiene valores vacíos. | **PARCIAL. Excelente pendiente en producción.** Proxy/aislamiento comprobados localmente; función y variables reales de Vercel NO VERIFICABLES sin despliegue. No hay control distribuido de abuso; se documenta como riesgo, no como noveno criterio académico. |
| **6. Funcionalidad del Chat y UX.** “Implementa interfaz de chat completa con diferenciación visual, scroll automático, historial en sesión y manejo de errores.” | L1-07 Estados; L2-09 Routing del chat; L3-05 Estados UI; L6-07 Historial; consigna PI. | chat.js: appendMessage, renderState, updateComposer, resetConversation, scrollTop, draft, completedTurns y request invalidation. views.js: formulario, regiones ARIA, sugerencias, avatares y botones. | Chrome: mensajes, scroll, carga/error, Enter/Mayús+Enter, reintento sin duplicar, navegación con historial y reset que descarta respuesta tardía. Chat-gemini.png, Historial-chat.png y responsive aportan evidencia visual. | **CUMPLIDO localmente. Excelente compatible con el flujo comprobado.** No se demuestra calidad de cada respuesta real del modelo; eso se valora en 4. Recargar vacía historial según alcance mínimo. |
| **7. Testing con Vitest.** “Implementa mínimo 4 tests unitarios con mocking cuando corresponda.” | L8-01 Unit Testing; L8-02 Transformación y mocking. | vitest.config.mjs, setup.mjs, ocho archivos *.test.mjs, package scripts. Fetch bloqueado por defecto; SDK/proveedor inyectado; reloj controlado para tráfico. | Dos ejecuciones solicitadas: **48 tests aprobados en cada una**, no 96 casos distintos. Vitest.png muestra 48 passed en ocho archivos. Suite API adicional: 16 aprobados. | **CUMPLIDO. Excelente respaldado localmente** por pruebas de funciones clave, transformación, errores y mocks. No se inventa un porcentaje de cobertura no medido. |
| **8. Deployment y Documentación.** “Proyecto desplegado en Vercel con README completo y repositorio organizado.” | L8-03 Deployment con Vercel; L7-04 vercel dev; PI Entregable Final, guía y presentación diapositiva 6. L5 respalda el registro crítico del uso de IA. | README.md, docs/USO-IA.md, vercel.json, .env.example, scripts, docs/ y evidencias/. | README documenta instalación, variables, vercel dev, tests, despliegue, IA y enlaces. Se enlazan únicamente las diez imágenes existentes, con nombres reales, incluida la tableta y el build corregido en el Bloque 14. Git sigue en main sin commits/origin; 09-vercel.png no existe. | **PARCIAL. Excelente NO alcanzado.** GitHub y Vercel son PENDIENTES obligatorios. Las capturas de build y tablet ya están corregidas. Falta actualizar el inventario de evidencias y demostrar función/chat en producción. vercel dev está documentado, no ejecutado. |

### Descriptores exactos de Excelente usados

1. “Diseño completamente mobile-first, coherente y fluido en los 3 breakpoints. Uso correcto de unidades relativas, Flexbox/Grid bien aplicado y experiencia visual clara y profesional.”
2. “Navegación completamente funcional con pushState y popstate. URLs coherentes, back/forward operativos y correcta renderización inicial según ruta. Código organizado por vistas.”
3. “Uso correcto de async/await con try/catch robusto. Estados visuales claramente integrados (loading, error). Código limpio y bien estructurado.”
4. “System prompt sólido, define personalidad, tono y limitaciones claramente. Mantiene historial completo en cada request. Respuestas bien parseadas y contextualizadas.”
5. “Arquitectura segura y correctamente configurada. Variables de entorno bien implementadas en local y en producción. Frontend nunca expone la key.”
6. “Experiencia fluida y clara. Diferenciación visual excelente entre usuario/personaje. Scroll automático funcional, indicador de ‘escribiendo...’ bien implementado y UX pulida.”
7. “Tests bien estructurados, cubren funciones clave (transformación y/o lógica). Usa mocking correctamente. Todos los tests pasan.”
8. “Deployment completamente funcional (incluyendo serverless). README claro, profesional y completo (instalación, tests, deploy, capturas, link productivo). Proyecto bien estructurado.”

No se asignan puntajes ni se garantiza una calificación. Excelente en 4, 5 y 8 requiere pruebas o entregables que esta auditoría no puede fabricar.

## 2. Fuentes por lecture y diferencias relevantes

Los apartados leídos están en los siguientes archivos internos de las lectures originales:

| Lecture | Archivo HTML dentro de cada *_files/ | Secciones relevantes |
| --- | --- | --- |
| L1 · Mobile-First CSS y Diseño Responsivo | dO-i_dRukqN-.html | 01, 02, 03, 04, 05, 07 y 08 |
| L2 · Routing con History API (SPA) | qMRK2Ysrpi2u.html | 03 a 09 |
| L3 · JavaScript Asíncrono y Fetch API | FT27RNsiy0Aa.html | 01, 03, 04 y 05 |
| L4 · Consumiendo APIs REST y Estructuras de Datos | ob-OaO9CEsIZ.html | 03, 05, 07, 08 y 09 como organización/parseo |
| L5 · AI Prompting para Frontend | p3nIOa00iqw2.html | 01, 03, 06 y 07 como apoyo/limitaciones/iteración |
| L6 · Integración con AI API | 84ANs_7rwD58.html | 02, 03, 04, 05, 06, 07 y 08 |
| L7 · Gestión de API Keys y Vercel Serverless Functions | U-LzJp0R7cuX.html | 01 a 04 |
| L8 · Unit Testing y Deployment en Vercel | 4vWEbwHDlefA.html | 01, 02 y 03 |

Los títulos permiten ubicar la lecture; las exigencias normativas se toman de la rúbrica y el entregable, no de una estructura de carpetas inventada.

Diferencias explicadas:

- **SDK:** L7 usa @google/generative-ai; el proyecto usa @google/genai 2.32.0 por autorización expresa anterior. Conserva Node, proxy, variables, roles/prompt, async/await y parsing. No se instala otra biblioteca.
- **Roles:** se usan user/model de Gemini; no copiar literalmente assistant de ejemplos de otros proveedores.
- **Historial y presupuesto:** L6-06 muestra un ejemplo de recorte por tokens; L6-07, la guía y Excelente piden contexto completo. El proyecto prioriza este último: todos los intercambios confirmados o un error explícito, sin recorte silencioso. Máximos actuales: 200 mensajes anteriores, 200000 unidades UTF-16 y 512 KiB JSON, 1000 por user y 4000 por model.
- **Organización:** la estructura /src/app.js y /api/functions.js del material es sugerida. La modularización existente y api/chat.js cumplen las responsabilidades sin esos nombres exactos.
- **Entorno local:** npm start usa el cargador nativo .env de Node; vercel dev está explicado como exige el README académico, pero su funcionamiento efectivo sigue pendiente. No se instala CLI sin autorización.
- **Comando verify:** el nombre solicitado no existe; el script real documentado es verify:production. Esta diferencia se registra, no se oculta añadiendo un alias.
- **Nombres de capturas:** la rúbrica pide capturas, no nombres numerados específicos. Los prefijos 01–09 proceden del checklist local; se puede mapear la evidencia sin renombrar archivos.

## 3. Inventario visual y correspondencia 01 a 09

Se abrieron y revisaron las nueve imágenes del Bloque 13. En el Bloque 14 se revisaron el reemplazo de Build.png y la nueva Responsive-tablet.png: ahora hay **diez imágenes existentes**. Todas tienen firma PNG válida y formato acorde con su extensión. Las dimensiones indicadas son del archivo de captura completo, no necesariamente del viewport.

| Tema previsto | Archivo existente / tamaño | Qué se comprobó | Límite o pendiente |
| --- | --- | --- | --- |
| 01 Home | Home.png · 1911×1007 | /home, personaje, CTA y aviso no oficial | Captura de escritorio; no prueba routing por sí sola |
| 02 Chat Gemini | Chat-gemini.png · 1915×1017 | Pregunta y respuesta sarcástica en primera persona, avatares y diferenciación | Apoya el funcionamiento aportado por el usuario; sin Network no certifica por sí sola el origen Gemini |
| 03 Historial | Historial-chat.png · 1917×1007 | Continuidad visual de conversación sobre comida entre dos turnos | No demuestra un historial de más de cuatro turnos ni todos los mensajes del payload; falta evidencia de request |
| 04 About | About.png · 1917×1017; About2.png · 1907×1022 | Propósito/tecnologías/personaje y créditos/privacidad | Dos capturas complementarias válidas |
| 05 Responsive móvil | Responsive-mobile.png · 1915×1007 | DevTools indica viewport **320×811**; chat y avatares visibles | El tamaño del PNG no es 320 px. La captura de tablet ya existe. DevTools muestra contador de 3 errores sin detalle |
| 05b Responsive tableta | Responsive-tablet.png · 1915×1007 | DevTools indica viewport **768×811**; chat, mensajes y avatar visibles | **Observación corregida en Bloque 14.** Se conserva el contador de errores sin detalle, sin atribuir causa |
| 06 Responsive escritorio | Responsive-Destktop.png · 1912×1040 | DevTools indica viewport **1440×811**, lateral y chat | Se conserva el nombre con “Destktop”. También se ve contador de 3 errores, no su causa |
| 07 Vitest | Vitest.png · 1077×967 | Terminal: npm.cmd test -- --run; ocho archivos y 48 passed | Evidencia válida de esa ejecución; fuente de mocks comprobada además en el código |
| 08 Build | Build.png · 977×405 | Terminal con npm.cmd run build, scripts/build.cjs y mensaje de frontend preparado en dist, seguido del prompt sin error | **Observación corregida en Bloque 14.** Acredita el build estático; no muestra una ejecución de verify |
| 09 Vercel | 09-vercel.png: **no existe** | No hay URL pública en las capturas revisadas | **PENDIENTE hasta despliegue real**; no crear una imagen ficticia |

No existen literalmente 01-home.png a 08-build-verify.png. Ahora hay cobertura temática de 01–08 con nombres distintos y evidencia adicional de tablet. El usuario sustituyó Build.png antes de este bloque; durante la revisión del Bloque 14 no se renombró, editó o eliminó ninguna evidencia.

### Privacidad y calidad de las capturas

- No se observaron API keys, tokens, valores de .env ni instrucciones privadas del servidor en las imágenes inspeccionadas. La antigua Build.png mostraba nombres de pestañas .env sin su contenido; la versión nueva muestra únicamente terminal de build. Ninguna de las dos imágenes revisadas en Bloque 14 muestra claves o valores privados.
- Las capturas de terminal muestran nombre de usuario, máquina y ruta local de Windows. Son datos identificativos que el usuario debe decidir si desea publicar. No se recortaron ni censuraron automáticamente.
- La revisión visual no garantiza ausencia de información oculta o de texto ilegible; se recomienda revisión humana final antes de publicar.
- Los contadores de tres errores en DevTools de las capturas responsive no permiten inferir si son errores actuales del proyecto, solicitudes previas o extensiones. La revisión automatizada nueva con mocks no produjo excepciones JS. No se borra ni se atribuye una causa al contador sin evidencia.
- evidencias/README.md permanece desactualizado: dice que no hay capturas y conserva casillas vacías. No se modificó porque esta fase solo autoriza enlaces del README principal. Debe actualizarse con autorización antes de presentar el inventario como definitivo.
- Las fotografías externas propuestas sin permisos no aparecen en el frontend observado; se utilizan los recursos vectoriales originales.

## 4. Auditoría técnica y riesgos reales

### Arquitectura, seguridad e historial

La aplicación separa presentación, router, DOM del chat, Fetch/serialización, validación HTTP, configuración del personaje y SDK. No hay frameworks ni dependencia nueva. package-lock fija las dependencias.

La clave se utiliza en el servidor mediante process.env; no se carga en src ni se envía desde el navegador. .env y tests/.env están ignorados. .env.example contiene únicamente GEMINI_API_KEY= y GEMINI_MODEL= vacíos. No se leyeron valores privados para esta auditoría.

El servidor valida método, Content-Type, JSON, forma, texto, roles alternados, pares completos y límites, incluyendo cuerpos procesados por Vercel y streams. La respuesta se valida y sanea con sourceIds conocidos. Las referencias no verifican automáticamente cada afirmación.

Hay dos límites de tráfico por instancia: 20 solicitudes admitidas por ventana fija de 60 segundos y 2 handlers en servicio simultáneo. Los rechazos son 429 SERVER_RATE_LIMITED/SERVER_BUSY con Retry-After, antes del proveedor. No son control por usuario, autenticación ni presupuesto global; múltiples instancias y arranques en frío tienen contadores distintos. El aborto no garantiza detener procesamiento/coste de Google.

El frontend impide envíos duplicados durante activeRequest. Solo añade a completedTurns una pareja tras una respuesta válida; saludo local, errores y mensajes fallidos no entran en el contexto confirmado. Los textos se renderizan con textContent, no HTML. resetConversation cancela e invalida la respuesta tardía. No hay persistencia tras recarga, lo cual coincide con la consigna mínima.

### Incidente real pendiente de diagnóstico

El usuario informó respuestas exitosas y un fallo posterior “No se pudo contactar con Gemini”. En el código actual esa frase corresponde a 502 UPSTREAM_ERROR: engloba excepciones que no tienen tratamiento específico. Google 500/502/503, errores de transporte y otros rechazos pueden terminar con el mismo mensaje. Los límites locales de tráfico producen 429 y textos distintos.

El handler descarta excepciones completas para no exponer datos sensibles, pero tampoco registra metadatos diagnósticos mínimos. El frontend muestra error.message y pierde code/status; no diferencia una indisponibilidad de Google de otros fallos genéricos. No se implementó ninguna corrección. El código original del incidente sigue **NO VERIFICABLE** sin datos de Network/servidor; no se atribuye automáticamente a la cuota local ni al historial.

### Vercel y rutas

vercel.json configura Node 24 mediante package.json, npm ci, npm run build, dist, función api/chat.js con maxDuration 30 y rewrites exactos de /, /home, /chat y /about. No hay regla global que intercepte /api/chat. El SDK instalado declara Node >=20 y exportación CommonJS; es compatible con el Node 24 del proyecto en las comprobaciones locales.

No se ha verificado empaquetado ni ejecución remota. La función no se publica por copiar api a dist: Vercel detecta api desde la raíz y empaqueta imports server-side. La .env local no sustituye configurar las variables en Vercel.

La ruta desconocida se maneja en el router cuando la SPA ya está cargada; una URL desconocida directa en Vercel puede usar el 404 de la plataforma, porque solo se reescriben las rutas requeridas. Esto no incumple el mínimo /home,/chat,/about, pero debe conocerse.

### Git, dependencias y archivos

- Git: main, sin commits, índice vacío y sin remoto origin. GitHub/Vercel no están publicados ni vinculados de forma verificable.
- Se comprobaron exclusiones para entorno, dependencias, respaldos, dist, .vercel, credenciales y archivos académicos conocidos. Las nueve imágenes y .env.example sí pueden incluirse en Git.
- Preflight no encontró patrones comunes de secretos en textos publicables. No es un análisis completo de todos los tipos de secretos.
- No se encontraron ZIP/PDF/PPTX/TMP/BAK/LOG/EXE/DLL entre los candidatos públicos. Los originales académicos siguen fuera del repositorio.
- Dependencia de producción: @google/genai 2.32.0. Desarrollo: Vitest 5.1.0. No se instalaron paquetes.
- package.json conserva main=index.js sin archivo correspondiente; no bloquea npm start ni el endpoint explícito de Vercel. author vacío es un metadato opcional. No se modificaron.
- Los documentos de bloques anteriores son registros históricos y pueden contener estados antiguos. El informe actual no reescribe sus resultados.
- docs/USO-IA.md registra asistente, prompts representativos, influencia y decisiones; cumple el componente documental requerido. No contiene claves ni presenta mocks como respuestas reales.

## 5. Resultados reales de comandos

| Comando ejecutado | Resultado | Salida/cantidad |
| --- | --- | --- |
| npm.cmd test -- --run | **APROBADO, exit 0** | 48 pruebas Vitest, ocho archivos |
| npm.cmd run test | **APROBADO, exit 0** | Las mismas 48 pruebas, segunda ejecución solicitada |
| npm.cmd run build | **APROBADO, exit 0** | dist generado desde src |
| npm.cmd run verify | **FALLÓ, exit 1** | Missing script: “verify”; ese nombre no está en package.json |
| npm.cmd run verify:production | **APROBADO, exit 0** | Preflight real existente: rutas, salida pública, Git, plantilla, SDK/lockfile |
| npm.cmd run test:api | **APROBADO, exit 0** | 16 pruebas originales de API conservadas |
| Revisión Chrome con mocks | **APROBADA** | Tres vistas a 320, 375, 766, 768, 960, 1024 y 1440; sin scroll horizontal, imágenes cargadas, contraste de mensajes ≥4.5:1 |
| Sintaxis Node/módulos del navegador | **APROBADA** | Sin errores en aplicación y tests |
| Git status/branch/remote y comparación con respaldo | **Revisados** | Sin staging/commits/remoto; código y capturas no alterados |

npm también informó que no pudo escribir su log habitual en npm-cache al fallar verify. La causa determinante del comando sigue siendo el script inexistente; no se reinstaló nada ni se modificó package.json para ocultarlo.

No se cuenta dos veces el número de casos de Vitest. No hay porcentaje de cobertura medido. Las pruebas HTTP usan un proveedor inyectado; no consumen Gemini. La revisión de Chrome se ejecutó en un servidor simulado independiente en puerto 3013, no en el servidor real del usuario, y se cerró al terminar.

Logs y capturas de QA: .respaldos/bloque13-*.log y .respaldos/bloque13-*-mock.png. No son capturas añadidas a evidencias ni acreditan una llamada autenticada.

## 6. Obligatorios, recomendaciones y opcionales

**Obligatorios:** personaje ficticio; tres rutas y navegación SPA; mobile-first en móvil/tablet/escritorio; Fetch asíncrono con estados; Gemini real con roles/prompt/contexto; proxy Vercel sin clave pública; mensajes diferenciados, scroll, historial en sesión y errores; mínimo cuatro Vitest con mocking; .env.example sin valores; README con instalación/env/vercel dev, tests, deploy, capturas, URL productiva y registro de IA; repositorio GitHub y URL funcional de Vercel.

**Recomendaciones/guía:** orden de desarrollo, archivos sugeridos, commits pequeños, experimentar el prompt previamente, iterar y contrastar sugerencias de IA. Una recomendación que la rúbrica convierte expresamente en criterio, como la clave privada o el historial completo para Excelente, no se trata como opcional.

**Extra credit explícito:** localStorage, galería de al menos tres personajes, timestamps, indicador animado, copiar respuestas y modo claro/oscuro. Enter ya está implementado. No se exigen esos extras para cerrar el mínimo ni se inventa autenticación distribuida como requisito académico.

El formato 01–09 y los siete anchos de inspección son una organización de evidencia del proyecto: la rúbrica pide tres tamaños y capturas, no esos nombres o cantidades exactas.

## 7. Pendientes para alcanzar Excelente y entregar

1. **Diagnóstico del fallo real de Gemini:** obtener estado/JSON/duración de la petición fallida y, en una etapa autorizada, metadatos seguros del SDK. No registrar prompts ni claves. No modificar modelo o credenciales como supuesto arreglo.
2. **Demostrar contexto y tono con evidencia real suficiente:** una petición posterior al cuarto turno cuyo historial comience en el primer intercambio confirmado, y su respuesta contextual. Las capturas actuales apoyan el chat, pero no prueban esa parte. Nuevas llamadas requieren autorización.
3. **CORREGIDO en Bloque 14: evidencia de build.** Build.png ahora demuestra npm.cmd run build finalizado. El resultado de verify:production sigue respaldado por el log aprobado del Bloque 13; la captura actual solo acredita build.
4. **CORREGIDO en Bloque 14: captura de tablet.** Responsive-tablet.png muestra 768 px. Sigue pendiente aclarar el detalle del contador de errores existente en DevTools y documentar su origen; una insignia por sí sola no demuestra una regresión.
5. **Actualizar inventario cuando se autorice:** evidencias/README.md está desfasado. Mantener nombres reales o renombrar solo con autorización; no es necesario para enlazarlos. Verificar la decisión de publicar nombres/rutas locales que aparecen en terminal.
6. **Resolver consistencia del comando verify:** usar el nombre real ya documentado o autorizar un alias si se requiere literalmente npm run verify. No es una dependencia faltante ni un fallo del build.
7. **Publicar GitHub cuando se autorice:** revisar archivos, primer commit, remoto y push; proporcionar URL real. Nada de esto se ejecutó.
8. **Desplegar y verificar Vercel cuando se autorice:** configurar GEMINI_API_KEY/GEMINI_MODEL existentes, rutas directas/recarga y función. Revisar el riesgo de acceso/cuota antes de exposición pública; no activar facturación automáticamente.
9. **Cerrar documentación con enlaces reales y 09-vercel.png:** capturar la aplicación publicada y el chat real después de verificarlos. No crear una URL ni captura ficticias.

No se promete Excelente antes de cumplir esos puntos. La academia requiere una entrega desplegada; este dictamen favorable con pendientes no certifica que esa entrega final ya exista.

## 8. Cambios efectuados en Bloque 13 y preservación

- Creado: **docs/AUDITORIA-ENTREGA.md**.
- En Bloque 13, README.md se ajustó a los nueve PNG de ese momento y se identificó que Build.png no era un build. El Bloque 14 actualiza esa línea a diez PNG y corrige la etiqueta al verificarse la captura sustituta.
- No se modificó evidencias/README.md ni ninguna imagen; tampoco diseño, código funcional, backend, personalidad, modelo, credenciales, scripts o dependencias.
- El build actualizó dist, excluido de Git. Los auxiliares/logs de auditoría están en respaldos ignorados.
- No se instalaron paquetes, hicieron llamadas reales a Gemini ni ejecutaron git add, commit, push o despliegue.

**Dictamen final: APTO CON PENDIENTES**, con los criterios 1, 2, 3, 6 y 7 cumplidos en el alcance local comprobado; 4, 5 y 8 parciales. La publicación y entrega completa permanecen pendientes de autorización y verificación real.

## 9. Actualización de preparación · Bloque 14

Fecha: 5 de noviembre de 2026. Respaldo previo a las ediciones: **.respaldos/bloque14-20261105-145639/**, con README principal, este informe y las evidencias tal como estaban al iniciar la revisión.

**Observaciones corregidas:** Build.png fue sustituido por el usuario y ahora demuestra el build correcto; Responsive-tablet.png fue añadido por el usuario y demuestra viewport de 768×811. Ambas imágenes son PNG válidos. Se verificaron visualmente sin modificarlas, y se actualizaron las referencias de la matriz y del inventario. El README principal conserva los nombres exactos, incluido Responsive-Destktop.png.

Inventario actual: About.png, About2.png, Build.png, Chat-gemini.png, Historial-chat.png, Home.png, Responsive-Destktop.png, Responsive-mobile.png, Responsive-tablet.png y Vitest.png; además del README de evidencias. No se renombró ni eliminó ningún archivo.

El estado académico continúa **APTO CON PENDIENTES**: estas dos correcciones no acreditan por sí solas el historial completo real, el diagnóstico del incidente, GitHub o Vercel. 09-vercel.png sigue pendiente. El checklist de evidencias conserva estados antiguos y requiere una actualización autorizada; no se editó en este bloque.

Se comprobaron de nuevo exclusiones de Git/.vercelignore, plantilla vacía y candidatos publicables. No se detectaron temporales ni materiales académicos entre los candidatos revisados. No se abrió la .env real ni se imprimieron credenciales. La protección de tráfico por instancia no equivale a una defensa distribuida ni a un límite global de cuota.

Git permanece en main sin commits, staging ni remoto. No se repiten las suites completas porque no cambió código: los resultados reales del Bloque 13 continúan registrados en la sección 5. El comando existente sigue siendo verify:production, sin introducir alias o dependencias.

Solo se modificaron README.md y este informe. Código funcional, diseño, configuración Gemini, claves y modelo permanecen intactos. No se hicieron llamadas reales, instalaciones, git add, commit, push, creación de repositorios ni despliegues.
