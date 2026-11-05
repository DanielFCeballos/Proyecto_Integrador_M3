# Registro de uso de IA

Actualizado el 5 de noviembre de 2026. Este documento registra intervenciones reales de la conversación de desarrollo; no es una transcripción completa ni contiene claves o archivos de entorno.

## Herramientas y responsabilidades

- Codex: asistente empleado para inspeccionar archivos, proponer soluciones, implementar módulos, generar SVG originales, escribir y ejecutar pruebas y redactar documentación.
- Google Gemini: servicio de generación del chatbot a través del SDK @google/genai en el servidor. Su personalidad actual es una representación ficticia de Deadpool.
- Usuario: seleccionó y aprobó el personaje, diseño y alcance, autorizó las dependencias incorporadas en bloques anteriores y estableció las restricciones. La comprensión del código y la revisión final de la entrega siguen siendo responsabilidad del estudiante.

## Prompts representativos y efecto en el proyecto

Los textos entre comillas son fragmentos de solicitudes del usuario; el resto resume cómo influyeron en la implementación.

| Solicitud real | Influencia | Decisión y comprobación |
| --- | --- | --- |
| «Utilizar únicamente HTML, CSS, JavaScript y APIs nativas del navegador» | Frontend sin frameworks | SPA modular con History API; pruebas de rutas y revisión en navegador |
| «Autorizo instalar exclusivamente @google/genai» | Sustituye el SDK heredado de L7 | SDK actualizado, manteniendo Node, Fetch, async/await y proxy serverless; contrato probado con cliente inyectado |
| «Conserva las 16 pruebas existentes de Node.js» | Dos suites independientes | npm test usa Vitest; npm run test:api conserva la suite original |
| «Elimina los recortes arbitrarios de cuatro turnos y 12 000 caracteres» | Historial completo confirmado | Sin truncado silencioso; límites explícitos con error, roles y orden verificados |
| «Sustituir el personaje Gustavo Petro por Deadpool» | Cambio definitivo de personaje en el Bloque 8 | Configuración y prompt de ficción, fuentes de Marvel y pruebas adaptadas; las iteraciones posteriores conservan esa personalidad |
| «Si no hay imágenes autorizadas, crea una ilustración original mediante SVG/CSS» | Recursos gráficos propios | Trazados SVG originales, sin calcar ilustraciones ni descargar recursos al frontend; créditos documentados |
| «Si la licencia de redistribución no está acreditada, no copies las imágenes al repositorio público» | Se descartan las fotografías propuestas del build | Inspección solo en respaldos ignorados; diseño cinematográfico con recursos originales |
| «No debemos seguir modificando la apariencia de Deadpool» | El Bloque 11 congela la interfaz aprobada | Comparación de bytes del frontend con respaldo; solo documentación y protección pequeña del servidor |
| «No realizar llamadas reales a Gemini» | Verificación sin cuota | Fetch y SDK simulados, sin carga de .env en pruebas; no se atribuye a Gemini el texto del proveedor de QA |

## Decisiones evaluadas y límites

El resultado de la IA no se aceptó como evidencia por sí solo: se inspeccionaron los archivos existentes, se contrastó la rúbrica local, se ejecutaron tests y se revisaron capturas del navegador. La auditoría distingue comportamiento implementado y simulado de una verificación autenticada o remota pendiente.

Las pruebas actuales comprueban instrucciones, contrato del SDK, historial, seguridad y presentación. No demuestran que cada respuesta real de Gemini sea pertinente, correcta o fiel a la personalidad. Los IDs de fuentes se filtran, pero no verifican automáticamente cada afirmación. El historial del cliente sigue siendo contexto no confiable; no hay garantía absoluta contra prompt injection.

Los límites de tráfico añadidos son un compromiso sencillo: reducen ráfagas en una instancia sin incorporar infraestructura. No se presentan como autenticación ni protección global de cuota. La selección de un SDK actualizado fue una excepción autorizada respecto de L7, no una sustitución silenciosa de los conceptos académicos.

No se incluyeron materiales completos de la academia en Git. Los documentos locales de SoyHenry se usaron como fuentes de auditoría, sin copiar lectures, rúbricas ni archivos de ejemplo al código público.

## Antes de entregar

El estudiante debe poder explicar el flujo de datos, separación de responsabilidades, roles/system prompt, límites, async/await, mocking, rutas y exclusiones. Completar las evidencias reales, revisar el contenido que se publique y sustituir las URLs pendientes. No afirmar que los textos de QA fueron generados por Gemini ni que un despliegue funcionó antes de comprobarlo.
