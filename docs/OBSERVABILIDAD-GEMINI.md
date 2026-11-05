# Bloque 19.4 · Observabilidad segura de Gemini

Fecha: 5 de noviembre de 2026. Base local revisada: commit ba7fe27. Esta implementación es local: no se realizó staging, commit, push ni despliegue y no se consultó Gemini real.

## Cambios y respaldo

- Respaldo previo del único archivo existente modificado: `.respaldos/bloque19-4-20261105-164408/server/chat-handler.cjs`.
- Modificado: `server/chat-handler.cjs`; agrega la llamada diagnóstica en el catch, limitada a inicialización/generación/procesamiento del proveedor y al timeout de esa operación.
- Creado: `server/gemini-diagnostics.cjs`; construye metadatos permitidos y emite una única línea JSON mediante console.error.
- Creado: `tests/unit/diagnostics.test.mjs`; 22 casos de privacidad, clasificación y conservación de respuestas.
- Creado: este informe.

No se modificó frontend, API de entrada, personalidad, system prompt, SDK de generación, parámetros, modelo, credenciales, dependencias, configuración Vercel o evidencias. El build regenera dist desde src sin cambiar el frontend.

## Metadatos que aparecerán en Runtime Logs

Cuando se autorice publicar esta versión y ocurra un fallo en la operación del proveedor, los Runtime Logs podrán mostrar una línea JSON con exactamente estos campos:

| Campo | Valores y significado |
| --- | --- |
| event | Constante `gemini_failure`, para localizar estos registros |
| errorName | Nombre reconocido de una lista cerrada, por ejemplo ApiError, TypeError o AbortError; los demás se sustituyen por UnknownError |
| httpStatus | Entero HTTP de error 400–599 recuperado del SDK, o null si no está disponible. No se inventa un HTTP de Google a partir del código público de nuestra API |
| transportCode | Código conocido de transporte, como ECONNRESET, ENOTFOUND, ETIMEDOUT o UND_ERR_CONNECT_TIMEOUT; null si no pertenece a la lista permitida |
| googleStatus | Categoría reconocida de Google, por ejemplo PERMISSION_DENIED, NOT_FOUND, RESOURCE_EXHAUSTED o UNAVAILABLE; null cuando no está disponible o no está permitida |
| category | Clasificación general controlada: configuration, response_processing, content_blocked, timeout_or_abort, transport, authentication_or_permission, resource_not_found, rate_or_quota, upstream_service, request_rejected o unknown |

Ejemplo **simulado**, no resultado de la producción actual:

```json
{"event":"gemini_failure","errorName":"ApiError","httpStatus":503,"transportCode":null,"googleStatus":"UNAVAILABLE","category":"upstream_service"}
```

Ese registro distinguiría un 503 del proveedor del 502 público que sigue recibiendo el navegador. Un timeout producido por el propio handler registra httpStatus null: no demuestra una respuesta HTTP de Google. resource_not_found no significa automáticamente que el nombre del modelo sea incorrecto; authentication_or_permission tampoco identifica por sí sola qué restricción falló.

Los registros no están disponibles retrospectivamente para ba7fe27. Hasta que exista autorización para publicar esta modificación, los Runtime Logs de ese despliegue seguirán teniendo el comportamiento anterior.

## Privacidad y control de los valores

No se imprime el error original, su message, stack, cause completa, URL, parámetros, headers, cuerpo, prompt, historial, respuesta generada, modelo ni credenciales. Tampoco se registra un nombre/código arbitrario solo porque parezca texto corto: se exige coincidencia exacta con una lista controlada.

El SDK incluye normalmente un JSON en ApiError.message. El módulo lo analiza únicamente en memoria si mide como máximo 16384 unidades de texto y extrae solo la categoría permitida y un código HTTP válido. No serializa ni imprime ese JSON, sus detalles o su mensaje descriptivo. JSON malformado, campos desconocidos y mensajes mayores se ignoran.

Los accesos a propiedades que fallan se ignoran sin imprimir la excepción. La salida final contiene solo primitivas y constantes, nunca referencias al error original ni sus objetos. Si el destino de logging falla, se omite el registro sin cambiar la respuesta HTTP ni intentar registrar otra excepción.

## Una sola emisión y respuesta pública intacta

Solo el catch principal del handler llama al logger. Un indicador por solicitud delimita la operación del proveedor y se desactiva antes de escribir la respuesta exitosa. No hay logs adicionales en el SDK, en el frontend ni en callbacks de aborto.

- Fallo del proveedor: como máximo una emisión por solicitud.
- Error de validación, origen o límite local de tráfico: no se etiqueta como fallo de Gemini ni genera este registro.
- Éxito: no genera registro diagnóstico.
- Timeout con rechazo tardío del proveedor: una sola emisión, comprobada con temporizadores simulados.

publicError, el cuerpo JSON público, sus códigos HTTP y Retry-After permanecen sin cambios. Por ejemplo, un ApiError 503 continúa devolviendo al cliente 502/UPSTREAM_ERROR; únicamente el log privado conserva ahora el 503. No se incorporan metadatos diagnósticos a la respuesta del navegador.

## Pruebas y revisión

Comandos ejecutados:

```powershell
npm.cmd test
npm.cmd run test:api
npm.cmd run build
npm.cmd run verify:production
node --check server/gemini-diagnostics.cjs
node --check server/chat-handler.cjs
node --check tests/unit/diagnostics.test.mjs
git diff --check
git diff --stat
git diff -- server/chat-handler.cjs
git diff --cached --name-only
git status --short
```

Resultados:

- **70 pruebas Vitest aprobadas en nueve archivos**: 48 anteriores y 22 nuevas.
- **16 pruebas originales API aprobadas**; conservan validaciones, límites, errores públicos, timeout y aislamiento.
- Build, verify:production y sintaxis correctos; diff sin trailing whitespace.
- No hay cambios en src, api, server/gemini.cjs, server/character.cjs, package.json, lockfile o vercel.json. No hay cambios preparados en el índice.

Las pruebas colocan centinelas privados en message, stack, URL, cabeceras, historial, respuesta, detalles JSON y códigos falsos; comprueban que no aparecen en el registro. También verifican que no se invoque toJSON del error original, que el logger no cambie respuestas públicas al fallar, que se conserve el 429 y que un rechazo tardío no duplique el log.

Todas las llamadas del proveedor en las pruebas son mocks. Algunas pruebas anteriores ahora emiten metadatos de sus fallos simulados en stderr; es el comportamiento esperado del logger, no una solicitud a Google. Los logs locales de pruebas están en .respaldos/bloque19-4-*.log y se excluyen de Git. Las capturas antiguas con otros conteos permanecen intactas y corresponden a ejecuciones anteriores.

## Uso posterior autorizado

Tras un despliegue futuro autorizado, buscar `gemini_failure` en Runtime Logs y correlacionar la línea con la invocación fallida de /api/chat. Compartir únicamente esos campos controlados y la hora/identificador de la invocación que muestre Vercel; nunca copiar cabeceras o excepciones completas.

Esta modificación prepara el diagnóstico; no confirma todavía por qué falla la producción actual. No se modificaron variables de entorno ni se cambió el modelo o el límite de generación. No se ejecutó ninguna nueva llamada real ni se publicó esta versión.
