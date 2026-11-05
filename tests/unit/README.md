# Pruebas unitarias académicas · Bloques 5, 6, 8 y 11

Se utiliza Vitest en entorno Node, sin DOM ni servicios externos. La configuración raíz descubre exclusivamente `tests/unit/**/*.test.mjs`; no ejecuta la suite independiente de `node:test` ni archivos de `.respaldos/`.

| Archivo | Casos | Función o responsabilidad |
| --- | ---: | --- |
| `validation.test.mjs` | 9 | `validateBody`: normalización, inmutabilidad, mensajes vacíos, longitud, campos no permitidos y roles/límites de historial; paridad de límites entre cliente y servidor. |
| `history.test.mjs` | 8 | `buildHistory`: historial completo, roles, orden, inmutabilidad, repeticiones legítimas, mensajes vacíos y rechazo explícito de excesos. |
| `response.test.mjs` | 6 | `parseResponse`: JSON, referencias válidas, duplicados, longitud y bloqueos de generación. |
| `chat-api.test.mjs` | 9 | `requestChatReply`: Fetch, historial completo/señal, errores, validación previa y tamaño UTF-8 del cuerpo. |
| `errors.test.mjs` | 4 | `createChatHandler`: validación antes del proveedor, exceso de historial y traducción segura de errores sin servidor HTTP. |
| `gemini-history.test.mjs` | 2 | SDK simulado: historial íntegro en orden, mensaje actual una sola vez y system prompt en cada solicitud. |
| `personality.test.mjs` | 6 | Identidad no oficial, respuesta útil con humor, canon y continuidades, vistas, controles accesibles y SVG locales inertes. |
| `traffic.test.mjs` | 4 | Exceso de concurrencia, ventana temporal por instancia, liberación tras errores y validación antes de consumir el límite. |

## Comandos

```powershell
npm.cmd test
npm.cmd run test:api
npm.cmd run build
```

`npm test` ejecuta Vitest una vez y termina, sin modo watch. `npm run test:api` conserva las 16 pruebas originales de Node.js en `tests/chat.test.cjs`.

## Mocking y aislamiento

- `setup.mjs` sustituye `fetch` con un mock que rechaza cualquier petición no configurada por el caso de prueba.
- Los casos de Fetch usan `vi.fn()` y `vi.stubGlobal()` con respuestas o fallos controlados, sin realizar solicitudes reales.
- Los casos del handler inyectan un proveedor simulado y una respuesta HTTP con funciones espía. No arrancan un servidor ni llaman al SDK de Gemini.
- Los mocks y temporizadores se restauran al finalizar cada caso.
- No se cargan archivos `.env` desde la suite ni se necesitan claves reales o inventadas.

Son 48 casos unitarios. La política de historial completo y sus límites explícitos se documentan en [HISTORIAL.md](../../docs/HISTORIAL.md). No se recorta contexto para continuar. Las pruebas del SDK inyectan un cliente simulado: no usan claves ni consumen cuota de Gemini. Las instrucciones y los fixtures se actualizaron al personaje ficticio Deadpool; estas pruebas no evalúan la calidad de una respuesta real del modelo. Los límites de tráfico del Bloque 11 son solo por instancia y no constituyen protección distribuida.

## Capturas para el criterio 7

Guardar únicamente capturas de ejecuciones reales:

1. `evidencias/07-vitest.png`: terminal con `npm.cmd test`, nombres de suites y resumen final de aprobación.
2. `evidencias/07-vitest-mocking.png`: editor mostrando los mocks de `chat-api.test.mjs` y el bloqueo de red de `setup.mjs`.
3. `evidencias/07-node-regresion.png`: ejecución de `npm.cmd run test:api` con las 16 pruebas originales aprobadas.

La evidencia independiente del build corresponde a `evidencias/08-build.png`. Este documento no significa que las capturas ya existan. No mostrar archivos de entorno ni credenciales en las capturas.
