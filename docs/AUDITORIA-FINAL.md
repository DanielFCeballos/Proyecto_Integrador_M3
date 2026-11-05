# Auditoría final · Proyecto Integrador M3

**Fecha:** 5 de noviembre de 2026, America/Bogota.
**Alcance:** Bloque 11; auditoría, documentación y protección pequeña del servidor. El diseño aprobado del Bloque 10 se conserva sin cambios.
**Resultado:** cinco criterios cumplidos localmente y tres parciales. **La entrega completa no está acreditada todavía:** faltan verificación real del chatbot actual, repositorio público, despliegue y evidencias.

## Fuentes académicas efectivamente consultadas

Material local externo al proyecto: `C:/Users/Daniel Felipe/Desktop/Lecturas_Henry_M3`.

- `PI (9)/Rubrica.png`: imagen oficial con ocho categorías y niveles Excelente, Satisfactorio e Insuficiente. Es la fuente principal de la matriz.
- `PI (9)/L9-03_files/GO1Stc_b9u86.html`: consigna, alcance funcional mínimo y extra credit.
- `PI (9)/L9-04_files/GO1Stc_b9u86.html`: entregable final: GitHub, URL de Vercel, funciones funcionando, .env.example, mínimo cuatro Vitest y contenido obligatorio de README.
- `PI (9)/L9-05_files/GO1Stc_b9u86.html`: guía, explícitamente orientativa; historial en cada solicitud, separación de responsabilidades y documentación del uso de IA.
- `L7/L7-01_files/U-LzJp0R7cuX.html` a `L7-04_files/U-LzJp0R7cuX.html`: claves privadas, proxy serverless, pruebas sin cuota, entorno y SDK. Los cuatro HTML coinciden por SHA-256 con sus entradas en el L7.zip original.
- `L8/L8-01_files/4vWEbwHDlefA.html` y `L8-02_files/4vWEbwHDlefA.html`: unit testing con Vitest y mocking de fetch sin red.

Las páginas HTML principales de las lectures son contenedores; se leyó el contenido guardado en sus subcarpetas. No se copiaron lectures, rúbrica, PDF ni ejemplos académicos al repositorio público. La documentación oficial de Vercel solo se usa para comandos operativos, no para inventar requisitos de la academia.

## Matriz de trazabilidad de los ocho criterios

“Cumplido localmente” indica evidencia de código y pruebas locales, no una calificación oficial. “Parcial” identifica una implementación presente con una verificación obligatoria o entregable faltante.

| Criterio | Requisito de la rúbrica | Evidencia concreta | Cumplimiento y pendiente para Excelente |
| --- | --- | --- | --- |
| **1. Diseño Responsive (Mobile-First)** | “Implementa diseño mobile-first funcional en 3 tamaños (mobile, tablet, desktop) usando Flexbox/Grid y media queries.” | `src/styles.css`: reglas base para móvil, Grid/Flexbox, unidades relativas, media queries a 375/768/960/1024/1440; recursos con object-fit/object-position. Chrome revisó las tres vistas a 320, 375, 766, 768, 960, 1024 y 1440 px sin scroll horizontal. | **Cumplido localmente.** Diseño coherente en los tamaños revisados, identificación visible e imágenes presentes. Faltan capturas reales de entrega en móvil, tablet y escritorio. No se modificó la apariencia aprobada. |
| **2. Implementación de SPA con History API** | “Implementa routing funcional (/home, /chat, /about) sin recarga de página usando History API.” | `src/js/router.js`: pushState, popstate, replaceState inicial, limpieza de listeners; `main.js` y `views.js`: vistas separadas. Chrome mantuvo un marcador de documento al navegar y usar back/forward; la suite API comprueba rutas directas. `vercel.json` tiene rewrites exactos. | **Cumplido localmente.** Navegación, back/forward y render inicial comprobados. Entrada directa y recarga reales en Vercel pendientes dentro del criterio 8. |
| **3. Lógica Asíncrona y Fetch API** | “Implementa llamadas asíncronas con async/await, manejo de errores y estados (loading/error).” | `src/js/chat-api.js`: fetch/await y parseo; `chat.js`: try/catch/finally, estado de carga, error, timeout, AbortController y prevención de duplicados. `chat-api.test.mjs`, `errors.test.mjs` y suite API cubren fallos HTTP/red/JSON/proveedor. | **Cumplido localmente.** Estados visibles, errores y reintento se probaron con mocks y en navegador. No implica que un servicio externo esté disponible ahora. |
| **4. Integración con AI API (Gemini)** | “Integra correctamente Gemini AI mediante envío de mensajes con roles y system prompt bien diseñado.” Excelente exige “Mantiene historial completo en cada request” y respuestas parseadas/contextualizadas. | `server/character.cjs` y `gemini.cjs`: personalidad, tono, límites, systemInstruction en cada solicitud, contents user/model y mensaje actual una sola vez. `chat.js`/chat-policy.js/handler: historial confirmado completo sin truncado. `history.test.mjs`, `gemini-history.test.mjs`, pruebas API y ocho turnos adicionales en Chrome. | **Parcial.** Implementación y contrato completos dentro de límites explícitos; falta una prueba autenticada del chat actual que demuestre tono, respuesta útil y contexto. Los mocks no prueban calidad ni éxito real de Gemini. No se consume cuota en esta auditoría. |
| **5. Seguridad y Serverless Functions** | “Implementa Vercel Serverless Function como proxy seguro. No expone API key. Usa variables de entorno correctamente.” Excelente incluye entorno local y producción. | `api/chat.js` exporta el handler Node; servidor separado de src; SDK solo en servidor; .env.example vacío; validaciones y límites en `chat-handler.cjs`; control por instancia del Bloque 11. Preflight, tests de aislamiento y comparación del build. | **Parcial.** Proxy y aislamiento comprobados localmente; no se inspeccionan valores secretos. Falta configurar/verificar variables y función en Vercel. Sigue existiendo riesgo distribuido de abuso; los límites locales no son autenticación ni límite global de gasto. |
| **6. Funcionalidad del Chat y UX** | “Implementa interfaz de chat completa con diferenciación visual, scroll automático, historial en sesión y manejo de errores.” | `chat.js`: mensajes en memoria, render por rol, scrollTop, estado aria-busy, reset, reintento sin burbuja duplicada, descarte de respuesta tardía. `views.js`/styles.css: campo, botón, avatares, regiones accesibles. Chrome probó carga, errores, Enter/Mayús+Enter, navegación y reinicio. | **Cumplido localmente.** Flujo comprobado con proveedor simulado. El historial se pierde al recargar, conforme al mínimo oficial. Capturas reales pendientes; la calidad real de IA se evalúa en el criterio 4. |
| **7. Testing con Vitest** | “Implementa mínimo 4 tests unitarios con mocking cuando corresponda.” | `vitest.config.mjs`, package scripts, `tests/unit/setup.mjs`; **48 casos en ocho archivos**. Fetch se sustituye por mocks; cliente SDK y proveedores inyectados; reloj controlado en límites de tráfico. También pasan las **16 pruebas originales Node.js**, bajo test:api. | **Cumplido localmente.** Funciones clave, transformación, validación, respuesta, errores y tráfico cubiertos; todos los casos pasan. No se declara porcentaje de cobertura que no se haya medido. Falta guardar captura de terminal y mocking para entregar. |
| **8. Deployment y Documentación** | “Proyecto desplegado en Vercel con README completo y repositorio organizado.” Excelente requiere despliegue funcional incluido serverless y README con instalación, tests, deploy, capturas y link productivo. | README actualizado con personaje, tecnologías, variables, npm start/vercel dev, pruebas, despliegue, registro de IA y enlaces pendientes. `docs/USO-IA.md`, checklist y configuración Vercel. Git actual: rama main sin commits ni remoto; evidencias solo contiene README. | **Parcial; publicación y capturas pendientes.** No hay repositorio público ni URL funcional verificada. CLI Vercel no disponible en PATH; vercel dev no se ejecutó ni se instaló. Esta categoría no puede considerarse completa con configuración local solamente. |

## Seguridad de /api/chat

| Punto | Resultado |
| --- | --- |
| Método, tipo de cuerpo y JSON | Solo POST/application-json; 405/415/400 controlados. Cuerpos ya procesados por Vercel y streams locales cubiertos. |
| Validación | Solo message/history; texto no vacío, tipos correctos, roles user/model alternados, pares completos, sin campos extra de sistema/modelo/clave. |
| Tamaño | Mensaje de usuario 1000 unidades UTF-16; respuesta histórica 4000; 200 mensajes anteriores; 200000 unidades de historial; cuerpo 512 KiB UTF-8. El primer límite excedido impide continuar, no recorta. |
| Clave e instrucciones | Sin clave ni SDK en frontend. process.env solo en servidor. La plantilla está vacía y los entornos privados están ignorados. El código server-side del repositorio no debe contener valores reales. |
| DOM | Mensajes mediante textContent, sin interpretar HTML del usuario/modelo; prueba de intento de inyección en Chrome. |
| Errores | Respuestas públicas estables, sin excepciones originales, prompts completos o claves. Timeouts y cancelación; no hay reintentos automáticos. |
| Origen | Se compara Origin/Host cuando existe Origin. Esto reduce uso cruzado desde navegadores; no autentica ni impide a un cliente externo omitir/falsificar cabeceras. |
| Tráfico — corrección del Bloque 11 | Hasta **20 solicitudes admitidas por ventana fija de 60 s y 2 en servicio simultáneo por instancia**. Rechazo previo al proveedor con 429 SERVER_RATE_LIMITED/SERVER_BUSY y Retry-After. Contadores acotados, sin mapas de IP ni dependencia nueva. |
| Riesgo restante | Arranques en frío e instancias distintas tienen contadores separados. No hay autenticación, rate limit distribuido, defensa completa contra DDoS ni tope global de coste. Invalid requests todavía consumen trabajo HTTP; no consumen el contador de generación. El aborto del handler no garantiza que Google interrumpa el procesamiento. |

La corrección es pequeña y se justifica por el endpoint público que puede consumir cuota. No se introducen infraestructura, cuentas, servicios pagos ni dependencias. Los cuatro tests nuevos comprueban concurrencia, reapertura de ventana, liberación tras error y que la validación antecede al contador. El caso original API de límites se amplió para demostrar HTTP 429 y que no se llama al proveedor en la solicitud bloqueada.

## Comprobaciones de cierre

| Comando/comprobación | Resultado |
| --- | --- |
| `npm.cmd test` | 48 aprobadas, ocho archivos |
| `npm.cmd run test:api` | 16 aprobadas, suite original conservada |
| `npm.cmd run build` | dist generado exclusivamente desde src |
| `npm.cmd run verify:production` | Rutas, salida pública, exclusiones, plantilla, patrones comunes de secretos, SDK/lockfile: correctos |
| Sintaxis con node --check y --input-type=module --check | JavaScript de servidor, scripts, API, tests y módulos de navegador sin errores |
| Chrome con proveedor simulado | Las tres vistas en los siete anchos, navegación, carga/error, historial, reintento, cancelación, avatares y contraste de mensajes ≥4.5:1: correctos; sin HTTP externo |
| Comparación con respaldo | Todo src/, personalidad, system prompt, proveedor/modelo, dependencias y vercel.json permanecen idénticos byte a byte |
| Git | main sin commits/remoto; archivos del proyecto sin rastrear. .env, tests/.env, .respaldos, node_modules, dist y archivos privados conocidos excluidos. Evidencias publicables. Sin materiales académicos en candidatos de publicación. |
| Capturas de entrega | Ninguna; solo checklist. Las capturas QA en respaldos contienen un proveedor simulado. |
| Gemini autenticado / Vercel real / vercel dev | No ejecutados; no acreditados en este bloque |

No se muestran valores de .env ni se confirma por lectura si una clave concreta es válida. Los resultados de tests no demuestran disponibilidad del modelo ni configuración de producción.

Logs locales ignorados: .respaldos/bloque11-vitest.log, bloque11-api.log, bloque11-build.log, bloque11-verify.log, bloque11-syntax.log y bloque11-git-status.log. Las capturas QA usan el prefijo bloque11- y no alteran imágenes de evidencias.

### Reproducir la comprobación de sintaxis en PowerShell

```powershell
Get-ChildItem -LiteralPath src/js -Filter *.js | ForEach-Object {
  Get-Content -LiteralPath $_.FullName -Raw -Encoding utf8 | node --input-type=module --check
  if ($LASTEXITCODE -ne 0) { throw 'Error de sintaxis en módulo de navegador' }
}
$checkFiles = @('api/chat.js','vitest.config.mjs','tests/chat.test.cjs') +
  @(Get-ChildItem -LiteralPath server,scripts -Filter *.cjs | ForEach-Object { $_.FullName }) +
  @(Get-ChildItem -LiteralPath tests/unit -Filter *.mjs | ForEach-Object { $_.FullName })
foreach ($checkFile in $checkFiles) {
  node --check $checkFile
  if ($LASTEXITCODE -ne 0) { throw 'Error de sintaxis en Node o tests' }
}
git status --short
```

## Requisitos obligatorios y extras

Obligatorios según rúbrica/consigna/entregable: personaje ficticio, tres vistas y History API, diseño mobile-first en tres tamaños, Fetch asíncrono con estados, Gemini real con roles/prompt/contexto, proxy Vercel sin clave pública, chat funcional con historial en sesión, mínimo cuatro Vitest con mocking, .env.example sin valores, repositorio GitHub, URL pública funcional y README con ejecución local usando vercel dev, tests, despliegue, capturas, link productivo y registro de uso de IA.

La estructura indicada por la academia es sugerida: los módulos actuales separan fetching, validación, transformación y render sin necesidad de renombrarlos a un único app.js. El SDK actualizado es una excepción autorizada respecto a L7 y se documenta su equivalencia funcional.

**Extra credit, no bloqueos de aprobación:** localStorage, galería de tres personajes, timestamps, botón de copiar y modo claro/oscuro. Enter ya existe. El indicador de generación existe, aunque no se agregue una animación. Los controles de abuso adicionales son una recomendación de seguridad para exposición pública, no un noveno criterio académico inventado.

## Pendientes imprescindibles, en orden

1. **Comprobar el chatbot actual con Gemini real cuando se autorice cuota:** respuestas pertinentes con personalidad y retención de contexto después del cuarto turno. No reutilizar el éxito histórico de una llamada mínima ni texto simulado como prueba del chat actual.
2. **Completar capturas reales:** seguir evidencias/README.md; móvil/tablet/escritorio, Home/Chat/About, historial y payload, Vitest/mocking y build/verify. No incluir datos privados. Las capturas de Gemini requieren petición real autorizada.
3. **Revisar el conjunto que se publicará:** comprobar exclusiones, no forzar archivos ignorados, no incluir academia/fotografías sin permisos, completar revisión y comprensión del código. El patrón de escaneo no es una garantía de ausencia absoluta de secretos.
4. **Publicar repositorio en GitHub cuando se autorice:** crear repositorio real y vacío, revisar staging, primer commit y push. Incorporar URL real al README.
5. **Resolver el riesgo de exposición y desplegar en Vercel cuando se autorice:** configurar solo GEMINI_API_KEY/GEMINI_MODEL en los entornos deseados, revisar acceso/cuota sin activar facturación, comprobar build y función. La protección por instancia no garantiza un presupuesto global.
6. **Verificar producción y cerrar documentación:** rutas directas/recarga, GET /api/chat 405 JSON, prueba POST real autorizada, evidencia de Vercel/GitHub y reemplazo de URLs pendientes. Entregar el enlace real del repositorio como indica la academia.

CLI Vercel ausente: no bloquea usar el panel GitHub/Vercel, pero la ejecución efectiva con vercel dev sigue pendiente. Su instalación o descarga requiere autorización adicional; no se hizo aquí.

## Comandos de publicación futuros — NO ejecutados

Desde la raíz y solo después de autorización. El repositorio local ya existe en main. Crear en GitHub un repositorio vacío y sustituir el valor de la variable por su URL real.

```powershell
$githubRemote = 'REEMPLAZAR_POR_URL_REAL_DEL_REPOSITORIO'
if ($githubRemote -eq 'REEMPLAZAR_POR_URL_REAL_DEL_REPOSITORIO') {
  throw 'Configura primero la URL real de GitHub'
}

npm.cmd test
npm.cmd run test:api
npm.cmd run build
npm.cmd run verify:production

git add .env.example .gitignore .vercelignore README.md api docs evidencias package.json package-lock.json scripts server src tests vercel.json vitest.config.mjs
git diff --cached --name-only
git diff --cached --check
git status --short
npm.cmd run verify:production
# Revisar los archivos preparados antes de continuar.
git commit -m "Completa Proyecto Integrador M3"
git remote add origin $githubRemote
git push -u origin main
```

No se usa git add -f. Si el remoto ya se hubiera configurado en otra sesión, revisar git remote -v antes de adaptar ese paso. No modificar configuraciones globales de Git en esta preparación.

Para Vercel se recomienda importar ese repositorio desde el panel, con Framework Other, raíz del proyecto, Node 24.x, npm ci, npm run build y dist; configurar los dos nombres de variables con los valores ya existentes. La conexión Git puede disparar despliegues posteriores automáticamente: autorizar esa etapa antes de vincular/publicar.

Si la CLI está disponible y su uso está autorizado:

```powershell
vercel login
vercel link
vercel env add GEMINI_API_KEY production
vercel env add GEMINI_MODEL production
# Omitir env add si las variables ya existen en el panel.
# Introducir valores únicamente en los prompts privados.
vercel --prod
```

Para comprobar localmente el entorno Vercel, también en una etapa autorizada:

```powershell
npm.cmd run build
vercel dev --listen 3000
```

Referencia de comandos: [Vercel Dev](https://vercel.com/docs/cli/dev), [deploy CLI](https://vercel.com/docs/cli/deploy), [integración Git](https://vercel.com/docs/git). No se ejecutan login, link, env add, vercel dev o deploy durante esta auditoría.

## Respaldo y archivos modificados

Respaldo previo: **.respaldos/bloque11-20261105-120924/**. Incluye configuración, código y documentación antes de editar; no copia .env de pruebas ni expone secretos.

Modificados: README.md, evidencias/README.md, server/chat-handler.cjs, tests/chat.test.cjs y tests/unit/README.md. Creados: tests/unit/traffic.test.mjs, docs/USO-IA.md y este informe. Los auxiliares y logs de auditoría están ignorados en respaldos. El build actualiza dist, también ignorado.

No se modificaron src/, personaje, personalidad, SDK de generación, historial, modelos, claves, dependencias ni diseño. No se eliminaron archivos ni capturas, no se instalaron paquetes y no se realizaron llamadas a Gemini, commits, push o despliegues.
