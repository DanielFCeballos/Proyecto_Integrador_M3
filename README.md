# Deadpool / Fuera de viñeta

Proyecto Integrador Módulo 3 de SoyHenry: una SPA para conversar con una representación ficticia de Deadpool. Home presenta al personaje, Chat mantiene la conversación durante la sesión y About explica el proyecto y sus fuentes.

**Deadpool con IA · Representación ficticia no oficial.** Proyecto académico independiente, sin afiliación con Marvel. Los mensajes son originales generados con IA, no diálogos auténticos de cómics, películas o actores. Pueden contener errores.

## Estado de entrega

| Elemento | Estado al 5 de noviembre de 2026 |
| --- | --- |
| Aplicación y diseño aprobado del Bloque 10 | Implementados; sin cambios visuales en esta auditoría |
| Pruebas y empaquetado | 83 Vitest y 16 API aprobadas en el Bloque 21; build y verify:production correctos |
| Repositorio GitHub | [DanielFCeballos/Proyecto_Integrador_M3](https://github.com/DanielFCeballos/Proyecto_Integrador_M3); publicación informada por el autor y origin local coincidente |
| Aplicación Vercel | [Abrir aplicación](https://proyectointegradorm3.vercel.app); publicada según la comprobación del autor, con errores intermitentes de Gemini |
| Capturas de entrega | Doce PNG revisados, incluidos Vercel.png con respuesta contextual y Vercel-2.png con despliegue Listo; recomendable actualizar evidencia de tests. [Inventario](evidencias/README.md) |
| Respuestas reales del personaje actual | Generación real confirmada en un diagnóstico local anterior; producción reportada por el autor. No se ejecutaron llamadas reales durante el Bloque 21 |

La [auditoría de entrega actualizada](docs/AUDITORIA-ENTREGA.md) contiene la matriz vigente de los ocho criterios oficiales, evidencias y limitaciones. Los informes de bloques anteriores conservan sus estados históricos. Dictamen: **APTO CON PENDIENTES**; no se garantiza el nivel Excelente ni disponibilidad continua del proveedor.

## Personaje, tecnologías y arquitectura

Deadpool, Wade Wilson, es un personaje ficticio de Marvel. La interpretación conversa en primera persona con sarcasmo, irreverencia, humor negro y lenguaje adulto moderados. La respuesta útil tiene prioridad sobre la broma. Los comentarios sobre código, desarrolladores o presupuesto son ficción, no información privada del equipo. Se reconocen límites y diferencias entre continuidades.

Tecnologías: HTML semántico, CSS mobile-first con Grid/Flexbox, JavaScript modular, History API, Fetch API, async/await, Node.js 24.x, Google GenAI SDK y Vercel Serverless Functions. Vitest es una dependencia exclusiva de desarrollo. No se usan frameworks de interfaz.

```text
Navegador → POST /api/chat → función Node.js → Gemini
             message         validación       system prompt
             history         clave privada    roles y contenido
Navegador ← JSON saneado ← respuesta del servidor
```

| Ruta o archivo | Responsabilidad |
| --- | --- |
| `src/index.html`, `src/styles.css` | Estructura y diseño aprobado |
| `src/js/main.js`, `router.js`, `views.js` | Vistas /home, /chat y /about; pushState y popstate |
| `src/js/chat.js` | DOM seguro con textContent, historial en memoria, carga, reintento y reinicio |
| `src/js/chat-api.js`, `chat-policy.js` | Fetch, serialización y validación previa |
| `src/js/character.js` | Datos públicos y preguntas sugeridas |
| `server/character.cjs`, `gemini.cjs` | Personalidad, base documental y SDK, fuera del frontend |
| `server/chat-handler.cjs` | Validación HTTP, límites, protección básica por instancia, timeout y errores |
| `api/chat.js` | Entrada serverless CommonJS de Vercel |
| `scripts/server.cjs` | Adaptador HTTP local del mismo handler |
| `scripts/build.cjs` | Copia solo src/ a dist/; no publica |
| `scripts/verify-production.cjs` | Preflight local de rutas, Git, salida pública y SDK |
| `tests/unit/`, `tests/chat.test.cjs` | Pruebas unitarias con mocks y suite API independiente |

Se utiliza **@google/genai@2.32.0**, SDK actualizado autorizado como sustituto de @google/generative-ai de L7. Se conservan los conceptos académicos: inicialización del cliente, generación con roles e instrucciones, proxy serverless y manejo asíncrono. La interfaz actual es `GoogleGenAI` y `models.generateContent({ model, contents, config })`. [SDK oficial de Google](https://github.com/googleapis/js-genai).

## Instalación y ejecución local

Requisitos comprobados: Node.js 24.x y npm. El lockfile fija las dependencias. Desde la raíz:

```powershell
npm.cmd ci
npm.cmd start
```

Abrir <http://localhost:3000/home>, /chat o /about. `npm run dev` ejecuta el mismo adaptador. Ctrl+C detiene el proceso. En otras terminales se puede usar npm en lugar de npm.cmd.

### Variables de entorno

Crear `.env` **en la raíz**, tomando `.env.example` como referencia y sin sobrescribir un archivo existente. La plantilla tiene valores vacíos:

```dotenv
GEMINI_API_KEY=
GEMINI_MODEL=
```

- `GEMINI_API_KEY`: clave privada, exclusivamente del servidor.
- `GEMINI_MODEL`: identificador del modelo ya elegido; conservar el valor existente.
- `PORT`: opcional solo para el adaptador local, por defecto 3000. No es necesario en Vercel.

`npm start` carga automáticamente la .env raíz mediante `process.loadEnvFile()`, sin dotenv. Reiniciar el servidor tras cambiar la configuración por cuenta propia. Sin las variables requeridas, las vistas funcionan y el chat devuelve un error controlado 503.

No poner credenciales en src/, URLs, comandos públicos, capturas ni Git. La función de Vercel usa process.env; no necesita subir la .env local. El código de backend puede ser visible en el repositorio público; eso no convierte sus variables privadas de ejecución en parte del frontend.

### Ejecución académica con vercel dev

La CLI de Vercel no es una dependencia de este proyecto y **no se instaló ni ejecutó en esta auditoría**. Los comandos siguientes requieren que su instalación/uso y la vinculación a una cuenta estén autorizados. No confundir vercel dev con un despliegue.

Si la CLI ya está disponible:

```powershell
vercel login
vercel link
npm.cmd run build
vercel dev --listen 3000
```

Ejecutar desde la raíz y detener antes cualquier servidor que use el puerto 3000. En la configuración del proyecto seleccionar Framework Other, Node 24.x, build `npm run build` y salida dist. Conservar la .env local existente; no ejecutar env pull sobre ella. Vercel Dev permite probar las funciones y el routing localmente; esta vía sigue **pendiente de comprobación efectiva con la CLI**. [Referencia oficial](https://vercel.com/docs/cli/dev).

Como alternativa futura sin instalación global, una vez autorizado descargar la herramienta, cada comando se puede invocar con `npm.cmd exec --package=vercel -- vercel ...`. Esto descarga/ejecuta una CLI: no se ha hecho en este bloque ni se necesita para npm start.

Abrir vistas o hacer GET a /api/chat no consume Gemini. **Enviar un mensaje válido sí puede consumir cuota**. Para pruebas sin cuota se utilizan proveedores inyectados desde los tests; no existe un modo mock activable desde HTTP en producción.

## Uso de la aplicación

1. Abrir Home y seleccionar «Abrir conversación».
2. Escribir una pregunta o usar una sugerencia. Enter envía; Mayús+Enter añade un salto.
3. Durante la generación se muestra el estado de carga y se impiden envíos duplicados.
4. Consultar las referencias sugeridas; no son una verificación automática de cada frase.
5. Si falla, leer el error y reintentar manualmente. No se duplica la burbuja.
6. Reiniciar vacía la memoria y cancela la petición pendiente. Una respuesta tardía se descarta.

Cambiar de vista conserva la conversación. Recargar la aplicación la reinicia, como permite el alcance académico mínimo. No hay localStorage; es extra credit, no un requisito de la entrega mínima.

## Historial, contrato y seguridad

El navegador envía POST /api/chat con Content-Type application/json, `message` y `history`. El historial alterna user/model en orden cronológico; el mensaje actual se añade una sola vez. El servidor rechaza campos extra, roles incorrectos, mensajes vacíos y cambios de instrucciones enviados por el cliente.

Se envían **todos los intercambios confirmados**, sin ventanas móviles ni recorte silencioso. Límites: 200 mensajes anteriores, 200000 unidades UTF-16 de historial y 512 KiB de JSON UTF-8. Cada mensaje de usuario admite 1000 unidades y cada respuesta histórica 4000. Si se exceden, se informa el problema con 413; no se elimina contexto para continuar. [Política](docs/HISTORIAL.md).

Errores públicos: 400 formato, 403 origen, 405 método, 413 tamaño, 415 contenido, 422 bloqueo, 429 exceso de solicitudes, 502 proveedor/respuesta inválida, 503 configuración y 504 timeout. No se devuelven excepciones internas del SDK ni se registran claves o prompts. El timeout del servidor es 20 segundos y el del cliente 25. No hay reintentos automáticos.

El Bloque 11 añade **20 solicitudes admitidas por ventana de 60 segundos y 2 solicitudes en servicio simultáneas por instancia**. Los excesos se rechazan antes del proveedor con 429 y Retry-After. La validación de formato no consume esa ventana. Los contadores son acotados y están en memoria: **se reinician en arranque en frío y no se comparten entre instancias**. No son autenticación, control por usuario, límite global de gasto ni defensa completa contra abuso. Cancelar no garantiza que Google deje de procesar una generación. Antes de exposición pública debe revisarse el riesgo restante y la configuración de acceso/cuota del proyecto, sin activar servicios de pago por defecto.

.gitignore y .vercelignore excluyen entorno, respaldos, dependencias, archivos privados y materiales académicos locales conocidos. .env.example y las imágenes de evidencias sí pueden incluirse en Git. Un archivo ya rastreado no queda protegido retroactivamente por gitignore.

## Pruebas, build y preflight

```powershell
npm.cmd test
npm.cmd run test:api
npm.cmd run build
npm.cmd run verify:production
```

- Vitest: **83 pruebas en nueve archivos**; validación, transformación de historial, respuestas, Fetch, personalidad, recursos SVG, errores, límites de tráfico y privacidad de los diagnósticos.
- API original: **16 pruebas** de Node.js, conservadas bajo un comando independiente.
- Los tests de fetch y SDK usan mocks. Los de API levantan HTTP local con proveedor simulado. No cargan .env ni necesitan claves.
- Build genera solo los archivos públicos. Verify comprueba que dist coincida con src y revisa configuración de rutas, exclusiones y compatibilidad.
- El escaneo de secretos es limitado a patrones comunes; no sustituye la revisión manual ni analiza secretos dentro de imágenes o todo el historial antiguo de Git.

La auditoría verifica el diseño aprobado en Chrome con proveedor simulado a 320, 375, 766, 768, 960, 1024 y 1440 px. Las capturas de QA en .respaldos/ no acreditan respuestas auténticas de Gemini ni reemplazan las capturas de entrega.

## Despliegue en Vercel

Producción: **https://proyectointegradorm3.vercel.app**. El autor confirmó el despliegue y respuestas reales, con fallos intermitentes. En el Bloque 21 no se redesplegó ni se repitieron llamadas autenticadas. Para reproducir la configuración desde GitHub:

1. Root Directory: raíz del repositorio; Framework: Other.
2. Node.js 24.x; instalación npm ci; build npm run build; Output Directory dist.
3. Configurar `GEMINI_API_KEY` y `GEMINI_MODEL` como variables **de servidor** en Production y en Preview/Development solo si se autoriza usar esos entornos. No cambiar sus valores actuales ni configurar PORT.
4. Revisar el riesgo de acceso público y los límites disponibles en las cuentas antes de activar la publicación.
5. Cuando se autorice, desplegar y comprobar entrada directa y recarga en /home, /chat y /about. GET /api/chat debe devolver 405 JSON sin consultar Gemini. Una prueba POST real requiere autorización porque usa cuota.
6. Conservar la captura real de producción Vercel.png y comprobar los enlaces antes de entregar.

vercel.json contiene rewrites exactos para las vistas, sin capturar /api/chat. La función está en api/chat.js; no forma parte de dist. La duración máxima configurada es 30 segundos. [Despliegue desde Git](https://vercel.com/docs/git).

Si se elige CLI y ya se autorizó su uso:

```powershell
vercel login
vercel link
vercel env add GEMINI_API_KEY production
vercel env add GEMINI_MODEL production
vercel --prod
```

Introducir los valores únicamente en el prompt privado de la herramienta, nunca en argumentos o documentación. Si ya están configurados en el panel, omitir env add. Los comandos publican solo al ejecutarlos; aquí se documentan, no se ejecutan.

## Limitaciones conocidas

Gemini genera respuestas, pero se han observado fallos intermitentes en producción con HTTP 400 `INVALID_ARGUMENT`, transformados por el proxy en HTTP 502 `UPSTREAM_ERROR`. La causa raíz no está demostrada. No se atribuyen automáticamente a un defecto del historial ni a una caída del proveedor.

En un diagnóstico local autenticado anterior, con la misma configuración y mensaje sintético, A sin historial respondió HTTP 200 y B con dos intercambios recibió HTTP 503 `UNAVAILABLE`. Ese resultado acredita una indisponibilidad en esa llamada; no reproduce ni explica el 400 de producción. No hubo más llamadas en esta auditoría.

La interfaz permite reintentar manualmente y reiniciar. Los tests simulados verifican esos flujos, pero no garantizan disponibilidad ni validez factual de cada respuesta real. El historial conserva el texto de los intercambios exitosos hasta los límites explícitos; no conserva la respuesta completa ni los metadatos originales del SDK. Se pierde al recargar. Las referencias deben contrastarse.

## Uso de IA, fuentes y recursos

El asistente Codex se utilizó para análisis, generación y revisión de código, pruebas, SVG y documentación. Las decisiones aprobadas por el usuario, prompts representativos, impacto y límites de las verificaciones están registrados en [USO-IA.md](docs/USO-IA.md). Gemini es además la IA de conversación en ejecución. No se atribuyen respuestas de mocks al modelo real.

Base factual: [ficha oficial de Marvel Multiverse](https://cdn.marvel.com/u/prod/marvel/i/pdf/MMRPG_CharacterProfiles_20240717.pdf). La [guía de lectura de Marvel](https://www.marvel.com/comics/guides/218/deadpool) tuvo consulta parcial por bloqueo 403; no se utiliza como respaldo factual del chat. No hay búsqueda web en tiempo real.

El diseño del Bloque 10 está aprobado y se conserva intacto. Se utilizan exclusivamente SVG originales y tipografías del sistema. Las tres fotografías propuestas no tienen permiso de redistribución acreditado y no se incluyen en src/, dist/ ni en el despliegue. [Créditos](src/assets/CREDITS.md) y [estado de imágenes](docs/REDISENO-CINEMATOGRAFICO.md).

## Evidencias y enlaces finales

- Repositorio GitHub: [DanielFCeballos/Proyecto_Integrador_M3](https://github.com/DanielFCeballos/Proyecto_Integrador_M3).
- Aplicación Vercel: [Deadpool / Fuera de viñeta](https://proyectointegradorm3.vercel.app).
- Capturas existentes: [Home](evidencias/Home.png), [Chat](evidencias/Chat-gemini.png), [historial visual](evidencias/Historial-chat.png), [About](evidencias/About.png), [créditos de About](evidencias/About2.png), [móvil a 320 px](evidencias/Responsive-mobile.png), [tableta a 768 px](evidencias/Responsive-tablet.png), [escritorio a 1440 px](evidencias/Responsive-Destktop.png), [Vitest](evidencias/Vitest.png) y [build correcto](evidencias/Build.png). [Checklist de capturas](evidencias/README.md).
- Producción: [Vercel.png](evidencias/Vercel.png), añadida por el autor durante el Bloque 21 y revisada; muestra la URL pública y una respuesta contextual, sin acreditar disponibilidad continua.
- Despliegue: [Vercel-2.png](evidencias/Vercel-2.png), panel de Vercel con estado Listo, dominio y commit 7153a18; no muestra credenciales.
- Criterios, resultados actuales y orden de cierre: [AUDITORIA-ENTREGA.md](docs/AUDITORIA-ENTREGA.md).

La consigna exige entregar el enlace del repositorio GitHub y una URL pública funcional. Ambas URLs están documentadas y la evidencia de producción existe. Antes de enviar, comprobar su acceso como evaluador y publicar estos cambios documentales y Vercel.png únicamente cuando el autor lo autorice. La captura Vitest existente corresponde a 48 pruebas anteriores; el resultado actual comprobado es 83.
