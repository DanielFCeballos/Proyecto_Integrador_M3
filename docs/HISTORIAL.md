# Historial completo de conversación · Bloque 6

Cada petición incluye todos los intercambios confirmados de la conversación actual, en orden cronológico: `user`, `model`, `user`, `model`. El campo `message` lleva el mensaje actual separado; el servidor lo añade a `contents` una sola vez. No hay ventana móvil de cuatro turnos ni recorte a 12000 caracteres.

El saludo local, el indicador de carga, errores, referencias de interfaz y mensajes sin respuesta válida no forman parte del contexto confirmado. Un reintento reutiliza el mensaje pendiente sin añadir otra burbuja. Preguntas repetidas de manera deliberada sí se conservan: no se eliminan mensajes por igualdad de texto.

`src/js/chat.js` conserva los intercambios en memoria durante la sesión de la SPA. Cambiar de vista conserva la conversación; recargar la página la reinicia. Reiniciar el chat vacía el contexto y cancela la solicitud pendiente; una respuesta tardía no restaura la conversación anterior.

## Límites técnicos explícitos

| Límite por solicitud | Máximo |
| --- | ---: |
| Mensaje actual y cada mensaje `user` anterior | 1000 unidades UTF-16 (`String.length`) |
| Cada respuesta `model` anterior | 4000 unidades UTF-16 |
| Mensajes anteriores confirmados | 200 (100 intercambios), más el mensaje actual |
| Texto total del historial anterior | 200000 unidades UTF-16 |
| Cuerpo JSON completo codificado en UTF-8 | 512 KiB (524288 bytes) |

Estos topes acotan el contexto enviado y el trabajo de validación. Se aplican en el cliente antes de `fetch` y de nuevo en el servidor, sin confiar en el navegador. El primero que se exceda impide continuar: se muestra un error que indica que no se recortó el historial y permite reiniciar para comenzar otra conversación. El servidor responde HTTP 413 (`HISTORY_TOO_LARGE` o `BODY_TOO_LARGE`) ante solicitudes excesivas. Un formato, rol o mensaje inválido se rechaza con HTTP 400. No se omiten mensajes inválidos para que una petición pase.

El cuerpo incluye estructura JSON y el mensaje actual. Caracteres multibyte pueden alcanzar el tope de bytes antes que el de texto. No se garantiza una conversación ilimitada: también existen límites de contexto, cuota y disponibilidad del proveedor, que pueden causar un error antes de alcanzar estos topes locales. No se resume ni se trunca automáticamente el contexto ante esos errores.

## Instrucciones y pruebas

`server/gemini.cjs` ya transforma todo el historial recibido a mensajes del SDK y conserva `buildSystemInstruction()` en cada solicitud. No se cambian el personaje, su personalidad, el modelo ni las credenciales. El historial enviado por el cliente permanece como contexto no verificado, separado de las instrucciones del servidor.

```powershell
npm.cmd test
npm.cmd run test:api
npm.cmd run build
```

Vitest comprueba transformación íntegra, orden, roles, repeticiones legítimas, límites y contrato del SDK con mocks. La suite original de API conserva sus 16 casos, actualizando las expectativas de los límites. Ninguna de estas pruebas requiere una petición autenticada a Google.

Para comprobarlo manualmente, inicia con `npm.cmd start`, abre `/chat` y completa más de cuatro intercambios. En las solicitudes a `/api/chat` del panel Network, `history` debe comenzar con la primera pregunta y respuesta confirmadas y contener todos los pares anteriores. El mensaje actual aparece solo en `message`. Esta comprobación manual con el proveedor real sí utiliza cuota; para pruebas automatizadas se emplean mocks.

El README principal queda pendiente de su actualización final junto con las evidencias reales de entrega.
