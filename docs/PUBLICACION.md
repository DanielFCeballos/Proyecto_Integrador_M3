# Preparación técnica para GitHub y Vercel · Bloque 7

Registro de preparación del Bloque 7: **sin commits, push ni despliegue**. En el Bloque 8 se actualizó el personaje a Deadpool y se renovó el README; consultar [DEADPOOL.md](DEADPOOL.md) para el estado actual. Las evidencias reales y URL pública siguen pendientes. No se han realizado peticiones a Gemini durante estos bloques.

## Configuración prevista de Vercel

| Ajuste | Configuración |
| --- | --- |
| Root Directory | Raíz de este proyecto, donde están `package.json`, `vercel.json` y `api/` |
| Framework | Other (`framework: null`) |
| Install Command | `npm ci`, usando `package-lock.json` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js | `24.x`, declarado en `package.json` |
| Función | `api/chat.js`, CommonJS, duración máxima 30 segundos |

Vercel documenta el descubrimiento de funciones en el directorio raíz `api/` y la configuración de [build, outputDirectory, functions y rewrites](https://vercel.com/docs/project-configuration/vercel-json). El SDK instalado `@google/genai@2.32.0` declara Node ≥20 y exportación CommonJS; su carga se comprueba localmente sin instanciar un cliente autenticado. [Vercel admite Node 24.x](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions); no se utiliza Edge Runtime.

El SDK es una dependencia de producción; Vitest es de desarrollo. No hay nuevas dependencias en este bloque. `npm ci` queda configurado para el futuro build remoto; no se ha ejecutado una instalación nueva durante esta preparación.

## Rutas y empaquetado

- `/`, `/home`, `/chat` y `/about` se reescriben exactamente a `/index.html`. Al abrir o recargar una de estas URLs, el navegador recibe la SPA y `router.js` renderiza según `location.pathname`.
- CSS y módulos usan URLs absolutas desde `/`, por lo que una entrada directa en `/chat` no cambia su resolución.
- Ninguna reescritura coincide con `/api/chat`. Vercel debe resolverlo como función Node, no como HTML. No se agrega un comodín que absorba la API.
- `api/chat.js` carga el handler y los módulos `server/` mediante `require`; estos archivos y el SDK quedan disponibles para el empaquetado de la función. Nunca se copian a `dist/`.
- `npm run build` copia únicamente `src/` a `dist/`. `npm run verify:production` comprueba que ambas carpetas contengan exactamente los mismos archivos y bytes. Si detecta archivos sobrantes o desactualizados, falla para impedir publicar ese resultado sin revisarlo; no borra archivos.
- Las rutas desconocidas no tienen fallback global en Vercel: pueden devolver el 404 de la plataforma al acceder directamente. Las tres rutas requeridas sí tienen reglas explícitas.

Estas son verificaciones de código y configuración. No sustituyen una comprobación en Vercel: la instalación remota, trazado de dependencias, ejecución real, recarga y respuestas HTTP en producción siguen pendientes de un despliegue autorizado.

## Variables que habrá que configurar

| Nombre exacto | Uso | Ubicación |
| --- | --- | --- |
| `GEMINI_API_KEY` | Credencial secreta de Gemini | Environment Variables del proyecto Vercel, solo servidor |
| `GEMINI_MODEL` | Identificador del modelo ya elegido; conservar el valor actual | Environment Variables del proyecto Vercel, solo servidor |

Son las únicas variables de aplicación requeridas. Configurarlas en **Production** y, si se desea que las previews puedan conversar, también en **Preview**. No usar prefijos públicos ni introducirlas en el build del frontend. No configurar `PORT` en Vercel: solo sirve como opción del adaptador local. No se requiere `GOOGLE_CLOUD_PROJECT`, región de Vertex AI ni un archivo de cuenta de servicio para esta integración con API key.

En local, `npm start` carga la `.env` raíz con el cargador nativo de Node. Vercel inyecta las variables en el proceso de la función: no carga nuestra `.env` local. `.env.example` conserva exclusivamente los nombres requeridos con valores vacíos. No se ha leído, cambiado ni mostrado ninguna clave en este bloque.

## Exclusiones y comprobaciones de Git

`.gitignore` excluye archivos `.env` (incluido `tests/.env`), respaldos, dependencias, salida del build, cobertura, metadatos de Vercel, logs, credenciales privadas habituales y carpetas locales privadas. `.env.example` es la excepción pública. `evidencias/` y sus imágenes PNG/JPG/WebP pueden incluirse en Git; esto no significa que existan capturas reales.

`.vercelignore` añade una barrera para excluir archivos locales y privados del envío a Vercel, incluso en un uso posterior de CLI. Conserva `src/`, `api/`, `server/`, `scripts/`, paquetes y lockfile. `dist/` se genera en el build remoto. Vercel documenta este mecanismo en [.vercelignore](https://vercel.com/docs/deployments/vercel-ignore). El archivo no reemplaza revisar lo que se publica en Git.

```powershell
npm.cmd test
npm.cmd run test:api
npm.cmd run build
npm.cmd run verify:production
```

El preflight usa Git solo para lectura y comprueba exclusiones, archivos ignorados que pudieran estar ya rastreados, plantilla sin valores, separación del frontend, SDK y lockfile. Busca patrones comunes de claves de Google y bloques de claves privadas en archivos de texto publicables, sin mostrar coincidencias. No lee archivos ignorados de entorno ni utiliza la red. Este escaneo limitado no garantiza detectar cualquier clase de secreto ni revisa contenido sensible dentro de imágenes, archivos binarios o historial antiguo de Git. Revisar manualmente cada evidencia antes de incluirla.

## Pendientes antes de exposición pública

1. Completar las capturas reales y actualizar el README principal: contiene información antigua sobre historial y pruebas. No presentar el checklist como evidencia ya obtenida.
2. Revisar el contenido exacto que se vaya a añadir a Git; no usar `git add -f` sobre archivos privados. Las exclusiones no protegen archivos que ya se hubieran rastreado ni eliminan secretos de commits anteriores.
3. Resolver el control de abuso del endpoint antes de abrirlo al público: actualmente no hay autenticación ni límite distribuido propio. La comprobación de Origin no autentica a clientes externos; los límites de tamaño y timeout no impiden muchas solicitudes pequeñas. No se activa ningún servicio ni facturación para resolverlo en este bloque.
4. Cuando se autorice la publicación, configurar las dos variables sin cambiar modelo ni clave, comprobar instalación/build y el bundle de la función, y probar entrada directa y recarga en `/home`, `/chat`, `/about`. Un GET a `/api/chat` debería devolver 405 JSON sin consumir Gemini. La prueba POST real debe autorizarse por separado porque usa cuota.

## Archivos y respaldo

Respaldo previo: `.respaldos/bloque7-20261104-162645/`. Incluye configuración, paquetes, API, servidor, scripts, frontend, README y pruebas; excluye archivos `.env` de pruebas. Los respaldos no se incorporan a Git.

Modificados: `.gitignore`, `.env.example`, `vercel.json` y `package.json` (solo agrega el comando de comprobación). Creados: `.vercelignore`, `scripts/verify-production.cjs` y este documento. No se modifican el chatbot, personalidad, modelo, credenciales, dependencias, lockfile, build ni README principal.

## Resultados locales del bloque

- `npm.cmd test`: 38 casos Vitest aprobados en seis archivos.
- `npm.cmd run test:api`: las 16 pruebas originales aprobadas, con servicios simulados.
- `npm.cmd run build`: salida `dist/` generada correctamente.
- `npm.cmd run verify:production`: comprobaciones de rutas, salida pública, exclusiones, plantilla y compatibilidad SDK/lockfile aprobadas.
- `node --check scripts/verify-production.cjs`: sintaxis correcta.

No se atribuye a estas comprobaciones un despliegue exitoso ni funcionamiento autenticado del chatbot en producción.
