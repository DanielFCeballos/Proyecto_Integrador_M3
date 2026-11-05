# Evidencias reales de entrega

Estado actualizado en Bloque 21, 5 de noviembre de 2026: **hay doce PNG existentes y revisados visualmente**, incluidas Vercel.png y Vercel-2.png, añadidas por el autor durante la revisión. No se modificaron ni eliminaron imágenes. El inventario siguiente usa los nombres reales; el checklist posterior conserva nombres propuestos, no archivos que deban darse por existentes.

| Evidencia existente | Criterios / alcance |
| --- | --- |
| [Home.png](Home.png) | 1, 2, 8: presentación y CTA en localhost |
| [Chat-gemini.png](Chat-gemini.png) | 4, 6: pregunta/respuesta y diferenciación; la imagen sola no demuestra el proveedor |
| [Historial-chat.png](Historial-chat.png) | 4, 6: continuidad visual, no payload completo |
| [About.png](About.png), [About2.png](About2.png) | 2, 8: proyecto, personaje, créditos y privacidad |
| [Responsive-mobile.png](Responsive-mobile.png) | 1, 6: viewport de 320 px |
| [Responsive-tablet.png](Responsive-tablet.png) | 1: viewport de 768 px |
| [Responsive-Destktop.png](Responsive-Destktop.png) | 1, 6: viewport de 1440 px; nombre original conservado |
| [Vitest.png](Vitest.png) | 7: ejecución anterior de 48 pruebas en ocho archivos. Ahora pasan 83 en nueve; falta captura nueva |
| [Build.png](Build.png) | 8: build terminado; no acredita verify |
| [Vercel.png](Vercel.png) | 4, 5, 8: URL pública y respuesta contextual a una pregunta de seguimiento; no garantiza disponibilidad continua |
| [Vercel-2.png](Vercel-2.png) | 8: panel con estado Listo, dominio y commit 7153a18; muestra identificadores de cuenta/proyecto, sin credenciales legibles |

**Producción cubierta por Vercel.png:** no hace falta renombrarla a `09-vercel.png`. Pendiente de publicación junto con la documentación, cuando el autor lo autorice. Recomendado: captura actual de Vitest y verify. Una captura del payload puede reforzar el historial, pero no es obligatorio usar los nombres propuestos ni mostrar más de cuatro turnos para cumplir un número impuesto: la rúbrica exige conservar el historial completo de cada request. Usar conversaciones sintéticas y evitar credenciales, encabezados o datos privados. No realizar nuevas llamadas a Gemini sin autorización.

Conservar las evidencias existentes. Las capturas con DevTools muestran un contador de errores sin causa identificada; no se interpreta como prueba de un fallo actual concreto. Las terminales muestran nombre y ruta local. Marcar el checklist solo al guardar y revisar cada archivo propuesto; no equivale al inventario real superior.

## Capturas de entrega

| Revisada | Archivo exacto | Qué capturar | Criterios |
| --- | --- | --- | --- |
| [ ] | `01-home.png` | /home completo: Deadpool, presentación, botón de conversación e identificación no oficial | 1, 2, 8 |
| [ ] | `02-chat-gemini.png` | Pregunta pública y respuesta real del personaje mediante Gemini; mostrar diferenciación y avatar | 4, 6 |
| [ ] | `03-historial.png` | Conversación de más de cuatro turnos y respuesta que retome información del primer intercambio | 4, 6 |
| [ ] | `03b-historial-request.png` | Network → POST /api/chat → Payload: todos los pares anteriores en orden user/model y message actual separado, sin datos privados | 4 |
| [ ] | `04-about.png` | /about: propósito, tecnologías, fuentes y créditos de recursos originales | 2, 8 |
| [ ] | `05-responsive-movil-320.png` | DevTools en 320 px, chat legible, avatar/cabecera compactos, fondo tenue y sin scroll horizontal | 1, 6 |
| [ ] | `05b-responsive-tablet-768.png` | Vista en 768 px con dimensiones visibles; adaptación del diseño y presencia visual del personaje | 1 |
| [ ] | `06-responsive-escritorio-1440.png` | Chat en 1440 px: lateral, fondo, mensajes, formulario e identificación | 1, 6 |
| [ ] | `07-vitest.png` | Terminal con npm.cmd test y resumen actual real de 83 pruebas aprobadas en nueve archivos | 7 |
| [ ] | `07b-vitest-mocking.png` | Editor: setup.mjs y un caso de chat-api.test.mjs o gemini-history.test.mjs mostrando mock/cliente inyectado y aserciones | 7 |
| [ ] | `08-build-verify.png` | Terminal con npm.cmd run build y npm.cmd run verify:production terminados correctamente | 5, 8 |
| [ ] | `09-vercel.png` | URL pública real en el navegador, chat funcionando y respuesta real de Gemini, después de autorización y despliegue | 4, 5, 8 |
| [ ] | `10-github.png` | Repositorio público real, estructura y README con links reales de Vercel/evidencias | 8 |

Las capturas no demuestran por sí solas back/forward, ausencia de recarga, scroll automático, cancelación ni seguridad total de la clave. Complementarlas con el código y comprobaciones manuales/automatizadas de la auditoría.

## Evidencias complementarias recomendadas

Estas mejoran la demostración; la rúbrica no fija estos nombres ni un número obligatorio de capturas:

| Revisada | Archivo | Contenido |
| --- | --- | --- |
| [ ] | `11-loading.png` | Estado real de generación con envío deshabilitado; puede documentarse con mock solo si se etiqueta claramente como tal |
| [ ] | `12-error-controlado.png` | Error público y reintento visible, indicando si fue prueba simulada; no provocar consumo abusivo para obtenerlo |
| [ ] | `13-api-regresion.png` | npm.cmd run test:api con las 16 pruebas originales aprobadas |
| [ ] | `14-responsive-766-960-1024.png` | Composición o capturas adicionales de esos anchos, sin alterar contenido ni resultados |
| [ ] | `15-api-publica-get.png` | GET a la URL real /api/chat con HTTP 405 JSON, sin llamada a Gemini ni secretos |

## Procedimiento de captura

1. Iniciar con npm.cmd start para las vistas locales. Revisar el diseño aprobado sin modificarlo. Abrir vistas no llama a Gemini; enviar un mensaje válido sí utiliza el proveedor real.
2. Para 02, 03 y 09 utilizar únicamente mensajes públicos y contar con autorización para consumir cuota. Un ejemplo de contexto no privado es pedir recordar la palabra «luciérnaga», completar varios intercambios y preguntar después qué palabra se indicó. Registrar el resultado verdadero, incluso si el modelo falla.
3. Para 03b, expandir el historial de una petición posterior al cuarto turno: comprobar que comienza con el primer intercambio confirmado. No incluir el saludo local, estados de interfaz ni intentos sin respuesta válida. No mostrar cabeceras sensibles ni instrucciones del servidor.
4. Para 05/05b/06, mantener visibles las dimensiones del viewport. La auditoría automatizada también revisa 375, 766, 960 y 1024 px; no se requieren siete capturas distintas para demostrar los tres tamaños mínimos.
5. Para 07/08/13, ejecutar los comandos actuales y capturar su salida al terminar. No reutilizar un resultado viejo con otra cantidad de pruebas.
6. Tras publicar, sustituir las URLs pendientes del README y agregar enlaces relativos **solo a archivos que existan**. No usar capturas de .respaldos/ con respuestas simuladas como prueba de Gemini real.

## Revisión de privacidad y registro

- Nunca mostrar .env, claves, tokens, valores de variables privadas, datos personales ni el contenido completo de instrucciones internas.
- En capturas del panel de Vercel, si se utilizan, mostrar solo nombres de variables; omitir sus valores.
- Cada archivo real debe registrarse abajo con fecha, ruta o comando, dimensiones cuando corresponda y origen de respuestas: interfaz sin envío / Gemini real / proveedor simulado.
- Un error, captura ausente o despliegue pendiente se registra como tal; no se marca cumplido por anticipado.
- Las imágenes propuestas sin permiso de redistribución acreditado no deben aparecer en el sitio ni en capturas de entrega.

| Archivo realmente guardado | Fecha | Ruta/comando | Ancho | Origen de respuestas / observaciones |
| --- | --- | --- | --- | --- |
| Ninguno al cierre de esta auditoría | — | — | — | Capturas pendientes |

evidencias/ y sus PNG/JPG/WebP pueden incluirse en Git. Eso no autoriza publicar datos sensibles ni certifica que las imágenes ya estén completas.
