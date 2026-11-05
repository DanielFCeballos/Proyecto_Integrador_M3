# Deadpool / Fuera de viñeta

Una conversación fuera del guion, dentro de una SPA.

Proyecto Integrador del Módulo 3 de SoyHenry. Permite conversar con una representación ficticia de Deadpool mediante Google Gemini, desde una interfaz responsive desarrollada con HTML, CSS y JavaScript.

## Abrir la aplicación

### [https://proyectointegradorm3.vercel.app](https://proyectointegradorm3.vercel.app)

**Estado:** aplicación publicada en Vercel, con integración real de Gemini y pruebas automatizadas. La disponibilidad de las respuestas depende del servicio de Google.

> **Deadpool con IA · Representación ficticia no oficial.**
> Proyecto académico independiente, sin afiliación con Marvel. Las respuestas son originales generadas con IA, no diálogos auténticos de cómics, películas o actores. Pueden contener errores.

**Recorrido para evaluar:** [Evidencias](#evidencias-fotográficas-del-proyecto) · [Ejecución local](#instalación-y-ejecución-local) · [Pruebas](#pruebas-automatizadas) · [Auditoría](./docs/AUDITORIA-ENTREGA.md)

## Funcionalidades principales

- **Conversación con personalidad:** primera persona, sarcasmo y humor moderado inspirados en Wade Wilson; la respuesta útil tiene prioridad sobre la broma.
- **Navegación SPA:** rutas coherentes, sin recargar la página, mediante History API y botones atrás/adelante.
- **Historial durante la sesión:** conserva los intercambios exitosos al navegar entre vistas.
- **Chat completo:** mensajes diferenciados, avatares, scroll automático, sugerencias y estado de generación.
- **Control de la conversación:** Enter envía, Mayús+Enter añade un salto; reintento manual, prevención de envíos duplicados y reinicio con cancelación.
- **Diseño mobile-first:** adaptación a móvil, tableta y escritorio.
- **Referencias documentales:** fuentes sugeridas para contrastar información del personaje.

### Rutas

- **`/home`:** presentación del personaje y acceso a la conversación.
- **`/chat`:** conversación con Gemini y controles del chat.
- **`/about`:** propósito, tecnologías, fuentes, créditos y privacidad.

El historial se conserva en memoria. Reiniciar lo vacía y recargar la aplicación lo elimina; no se utiliza localStorage.

## Tecnologías utilizadas

- **Frontend:** HTML semántico, CSS con Grid/Flexbox y media queries, JavaScript modular.
- **APIs del navegador:** History API, Fetch API y AbortController; asincronía con async/await.
- **Backend:** Node.js 24.x y Vercel Serverless Functions.
- **Inteligencia artificial:** Google Gemini mediante `@google/genai@2.32.0`.
- **Testing:** Vitest con mocking y suite adicional con el runner nativo de Node.js.

No se utilizan frameworks de interfaz.

### Integración con Gemini

El navegador envía el mensaje y los intercambios anteriores a `POST /api/chat`. La función valida la solicitud, incorpora las instrucciones del personaje y llama a Gemini. La respuesta se procesa en el servidor antes de mostrarse en el chat.

```text
Navegador → /api/chat → validación e instrucciones → Gemini
Navegador ← respuesta procesada ← función serverless
```

La clave permanece exclusivamente en el servidor. Los roles son `user` y `model`; el mensaje actual se añade una sola vez y el system prompt acompaña cada solicitud.

El SDK actualizado sustituye a `@google/generative-ai` utilizado en L7, por autorización del proyecto. Conserva los conceptos académicos: cliente, generación con roles e instrucciones, proxy serverless y manejo asíncrono. Se usa `GoogleGenAI` y `models.generateContent({ model, contents, config })`. [SDK oficial](https://github.com/googleapis/js-genai).

## Evidencias fotográficas del proyecto

**[Abrir todas las capturas](./evidencias/)** · **[Consultar el inventario](./evidencias/README.md)**

### Aplicación publicada y despliegue

- **[Vercel.png — conversación en la URL pública](./evidencias/Vercel.png).** Muestra una respuesta contextual del personaje.
- **[Vercel-2.png — panel de despliegue](./evidencias/Vercel-2.png).** Muestra estado Listo, dominio y commit correspondiente a esa captura.

### Vistas de la SPA

- [Home — presentación y acceso al chat](./evidencias/Home.png).
- [Chat — mensajes y respuesta del personaje](./evidencias/Chat-gemini.png).
- [About — información del proyecto](./evidencias/About.png).
- [About — créditos y privacidad](./evidencias/About2.png).

### Conversación y diseño responsive

- [Historial — continuidad visual de la conversación](./evidencias/Historial-chat.png).
- [Móvil — viewport de 320 px](./evidencias/Responsive-mobile.png).
- [Tableta — viewport de 768 px](./evidencias/Responsive-tablet.png).
- [Escritorio — viewport de 1440 px](./evidencias/Responsive-Destktop.png).

### Pruebas y build

- [Vitest — ejecución fotografiada](./evidencias/Vitest.png).
- [Build — compilación finalizada](./evidencias/Build.png).

La captura de Vitest corresponde a 48 pruebas anteriores. La última ejecución registrada en la auditoría acredita **83 pruebas**, en nueve archivos. La captura de build no muestra la verificación de producción.

Las imágenes complementan el código y las pruebas; por sí solas no demuestran todos los comportamientos ni disponibilidad continua. La trazabilidad de los ocho criterios está en la [auditoría de entrega](./docs/AUDITORIA-ENTREGA.md).

## Instalación y ejecución local

Requisitos: **Node.js 24.x**, npm y una clave propia de Gemini para usar el chat real.

### 1. Obtener el proyecto e instalar dependencias

Desde Git Bash o una terminal compatible:

```bash
git clone https://github.com/DanielFCeballos/Proyecto_Integrador_M3.git
cd Proyecto_Integrador_M3
npm ci
```

Si ya tienes el proyecto, usa su carpeta existente. En PowerShell de Windows puedes sustituir `npm` por `npm.cmd`.

### 2. Configurar el entorno

Crea `.env` en la raíz usando [`.env.example`](./.env.example) como referencia. No sobrescribas un archivo existente. Completa las variables explicadas en la siguiente sección antes de iniciar el chat.

### 3. Iniciar la aplicación

```bash
npm start
```

Abrir [http://localhost:3000/home](http://localhost:3000/home). También están disponibles `/chat` y `/about`.

`npm run dev` inicia el mismo servidor local. Para detenerlo, usa Ctrl+C. Sin variables requeridas, las vistas se muestran y el chat informa un error de configuración.

### Alternativa local con Vercel Dev

Si la CLI de Vercel ya está disponible y tienes acceso a tu proyecto:

```bash
vercel login
vercel link
npm run build
vercel dev --listen 3000
```

Ejecuta los comandos desde la raíz y detén previamente cualquier proceso que ocupe el puerto 3000. Usa la configuración de Vercel indicada en la sección de despliegue.

La CLI no forma parte de las dependencias del repositorio. Esta alternativa está documentada, pero su ejecución no fue comprobada en la auditoría local. Conserva tu `.env`; no ejecutes `vercel env pull` sobre ella sin respaldarla. [Referencia de Vercel Dev](https://vercel.com/docs/cli/dev).

## Configuración de variables de entorno

La plantilla no contiene valores reales:

```dotenv
GEMINI_API_KEY=
GEMINI_MODEL=
```

- **`GEMINI_API_KEY`:** clave privada para el servidor.
- **`GEMINI_MODEL`:** identificador del modelo de Gemini con acceso habilitado en tu proyecto. En una instalación existente, conserva su valor configurado.
- **`PORT`:** opcional para el servidor local; por defecto, 3000. No se necesita en Vercel.

`npm start` carga automáticamente la `.env` raíz mediante `process.loadEnvFile()`, sin dotenv. Reinicia el servidor después de cambiar tu configuración.

En Vercel, configura las variables en el panel del proyecto: la función utiliza `process.env` y no necesita subir la `.env` local.

**No incluyas credenciales en Git, `src/`, capturas, URLs ni comandos públicos.** `.gitignore` y `.vercelignore` excluyen entorno, respaldos, dependencias y archivos privados. Los archivos ya versionados requieren revisión independiente.

Enviar mensajes al chat real puede consumir cuota. Las pruebas automatizadas usan simulaciones y no necesitan una clave.

## Pruebas automatizadas

Ejecuta desde la raíz:

```bash
npm test
npm run test:api
npm run build
npm run verify:production
```

### Resultados registrados

- **Vitest:** 83 pruebas aprobadas en nueve archivos.
- **API con Node.js:** 16 pruebas aprobadas.
- **Build:** correcto; genera únicamente el frontend en `dist/`.
- **Verificación de producción:** correcta en las comprobaciones locales documentadas.

Estos resultados corresponden a la ejecución registrada en la [auditoría de entrega](./docs/AUDITORIA-ENTREGA.md); no implican una nueva ejecución al editar este README.

Las pruebas cubren validación, historial, procesamiento de respuestas, Fetch, personalidad, errores, límites y privacidad de los diagnósticos. Se simulan Fetch y el proveedor para evitar llamadas reales. La suite API utiliza HTTP local con un proveedor inyectado.

`verify:production` comprueba rutas configuradas, salida pública, exclusiones y compatibilidad del SDK. Su escaneo de secretos es limitado: no sustituye la revisión manual. El script se llama `verify:production`, no `verify`.

[Ver pruebas unitarias](./tests/unit/) · [Ver mocks](./tests/unit/setup.mjs) · [Ver suite API](./tests/chat.test.cjs)

## Instrucciones de despliegue

### Desde GitHub, mediante el panel de Vercel

1. Importar el repositorio y usar su raíz como **Root Directory**.
2. Seleccionar **Framework: Other** y **Node.js: 24.x**.
3. Configurar instalación `npm ci`, build `npm run build` y salida `dist`.
4. Añadir `GEMINI_API_KEY` y `GEMINI_MODEL` como variables del servidor en Production. Configurar Preview/Development solo si se van a utilizar esos entornos.
5. Desplegar y comprobar acceso directo, recarga y navegación en `/home`, `/chat` y `/about`.
6. Comprobar la función `/api/chat`. Un GET debe devolver 405 sin llamar a Gemini; un POST válido puede consumir cuota.

[`vercel.json`](./vercel.json) define reescrituras exactas para las rutas SPA sin interceptar `/api/chat`. Vercel detecta la función en `api/chat.js` y sus módulos del servidor; no deben copiarse a `dist/`. La duración máxima configurada es de 30 segundos.

### Mediante CLI

Con la CLI disponible y acceso autorizado a la cuenta:

```bash
vercel login
vercel link
vercel env add GEMINI_API_KEY production
vercel env add GEMINI_MODEL production
vercel --prod
```

Introduce los valores solo en el prompt privado. Si las variables ya existen, omite los comandos `env add`. No configures `PORT` ni subas la `.env` local. [Despliegue desde Git](https://vercel.com/docs/git).

## Documentación técnica adicional

- [Auditoría de entrega y matriz de la rúbrica](./docs/AUDITORIA-ENTREGA.md).
- [Inventario de evidencias](./evidencias/README.md).
- [Política de historial y límites](./docs/HISTORIAL.md).
- [Personaje y fuentes documentales](./docs/DEADPOOL.md).
- [Arquitectura de observabilidad segura](./docs/OBSERVABILIDAD-GEMINI.md).
- [Registro del uso de IA](./docs/USO-IA.md).
- [Créditos de los recursos gráficos](./src/assets/CREDITS.md).
- [Diseño y procedencia de recursos](./docs/REDISENO-CINEMATOGRAFICO.md).

### Arquitectura y seguridad

El frontend está en `src/`; el proxy de Vercel, en `api/chat.js`; las instrucciones, validación y proveedor, en `server/`. Los adaptadores locales y scripts de build/verificación están en `scripts/`.

Los textos se muestran con `textContent`. El servidor valida formato, roles, tamaño y respuesta; rechaza instrucciones del cliente que intenten sustituir la configuración del personaje. Los logs contienen solo metadatos permitidos, sin claves, prompts ni conversaciones.

<details>
<summary>Consultar límites técnicos y manejo de errores</summary>

El historial incluye todos los intercambios confirmados en orden, sin recorte silencioso. Admite hasta 200 mensajes anteriores y 200000 unidades UTF-16 de texto; el cuerpo JSON completo tiene un máximo de 512 KiB UTF-8. Cada mensaje de usuario admite 1000 unidades y cada respuesta histórica 4000. El exceso se informa con HTTP 413.

El control de tráfico admite 20 solicitudes por ventana de 60 segundos y dos operaciones simultáneas por instancia. Devuelve 429 con Retry-After al superar esos límites. Son contadores en memoria, no autenticación ni un límite global de gasto; se reinician en arranques en frío y no se comparten entre instancias.

Hay errores controlados para formato (400), origen (403), método (405), tamaño (413), contenido (415), bloqueo (422), tráfico/cuota (429), proveedor o respuesta inválida (502), configuración (503) y timeout (504). El timeout del servidor es de 20 segundos y el del cliente, 25. No hay reintentos automáticos. Cancelar no garantiza detener el procesamiento o consumo en Google.

</details>

### Alcance y limitaciones

Gemini puede presentar fallos intermitentes. La aplicación informa el error y permite reintentar manualmente o reiniciar; no se garantiza disponibilidad continua. La causa de los rechazos intermitentes observados no está demostrada y no se atribuye automáticamente al historial.

El historial conserva el texto de los turnos exitosos, no el JSON ni los metadatos originales del SDK. Las referencias deben contrastarse: no hay búsqueda web en tiempo real ni verificación automática de cada afirmación.

### Fuentes y uso de IA

La base del personaje utiliza la [ficha oficial de Marvel Multiverse](https://cdn.marvel.com/u/prod/marvel/i/pdf/MMRPG_CharacterProfiles_20240717.pdf). La [guía de lectura de Marvel](https://www.marvel.com/comics/guides/218/deadpool) se ofrece como lectura complementaria; su consulta fue parcial y no se usa como respaldo factual del chat.

Codex apoyó el análisis, código, pruebas, SVG y documentación; Gemini genera las respuestas durante la conversación. Las decisiones y límites se detallan en el [registro de uso de IA](./docs/USO-IA.md).

Los recursos publicados son SVG originales y tipografías del sistema. Las fotografías externas propuestas sin permiso de redistribución acreditado no forman parte del frontend ni del despliegue. Esta interpretación de Deadpool no es material oficial de Marvel.
