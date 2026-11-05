# Bloque 12 · Preparación de publicación en GitHub y Vercel

Fecha: **5 de noviembre de 2026**, America/Bogota. Este informe prepara acciones futuras; no crea repositorios, commits, remotos ni despliegues.

## Alcance y preservación de las capturas

Se revisaron Git, exclusiones, plantilla de entorno, configuración, scripts y README principal. No se modificó código, backend, integración Gemini, diseño, recursos visuales ni ningún README. No se abrió el contenido de las capturas ni se creó, movió, renombró o eliminó ningún archivo de `evidencias/`.

Los nombres que muestra Git son una fotografía del momento de consulta: el usuario puede seguir agregando capturas. No se considera que la carpeta esté terminada ni que su contenido esté aprobado para publicación. Esperar a que el usuario finalice las capturas antes de preparar staging.

El único archivo publicable creado en este bloque es este informe. No se reemplazó ningún archivo existente, por lo que no fue necesario respaldar un original antes de editarlo. Se guardó únicamente un manifiesto de hashes de archivos protegidos en `.respaldos/bloque12-protected-hashes.json`, ignorado por Git, para confirmar que permanecen intactos. No contiene valores de entorno.

## 1. Estado actual de Git

| Comprobación | Resultado local |
| --- | --- |
| Repositorio local | Ya existe; no ejecutar git init de nuevo |
| Rama | `main` |
| Primer commit | No existe HEAD todavía |
| Staging | Vacío; no se ejecutó git add |
| Archivos rastreados | Ninguno todavía; los archivos del proyecto aparecen como `??` |
| Remotos | Ninguno configurado; no hay origin |
| GitHub | No hay URL asociada al repositorio local; no se consultó ni creó un repositorio remoto |
| Vercel | Sin vinculación local `.vercel/` observada ni despliegue comprobado; no se consultó una cuenta remota |

Se ejecutaron exclusivamente consultas de Git: status, branch, remote, ls-files, rev-parse y check-ignore. El fallo de rev-parse al buscar HEAD corresponde a un repositorio sin commits, no a un error del proyecto.

## 2. Exclusiones y archivos aptos

Se comprobaron con `git check-ignore --no-index --stdin` las siguientes categorías:

| Exclusión | Resultado |
| --- | --- |
| `.env`, `tests/.env`, `.env.production` | Excluidos |
| `.npmrc`, `.netrc`, claves PEM/KEY, carpetas private/credentials | Excluidos en los casos comprobados |
| `node_modules/` | Excluido |
| `.respaldos/` | Excluido, incluidas inspecciones de fotografías y capturas de QA |
| `dist/`, `coverage/`, logs | Excluidos |
| `.vercel/` | Excluido |
| Carpetas locales `.aws/`, `.codex/`, `.agents/` | Reglas presentes |
| Lectures, rúbrica y archivos académicos locales conocidos | Reglas presentes; no aparecieron como candidatos publicables |

No hay archivos ignorados ya rastreados. Esto es importante porque gitignore no retira archivos que ya estuvieran en el índice o en commits.

**Aptos para revisión y publicación:** `.gitignore`, `.vercelignore`, `.env.example`, `package.json`, `package-lock.json`, `vercel.json`, `vitest.config.mjs`, `README.md`, `src/`, `api/`, `server/`, `scripts/`, `tests/`, `docs/` y las evidencias reales que el usuario termine y revise. El backend debe estar en el repositorio para empaquetar la función; no debe contener valores reales de credenciales.

`.env.example` contiene exclusivamente los nombres **GEMINI_API_KEY** y **GEMINI_MODEL** con valores vacíos y comentarios. Puede publicarse. La .env real no se leyó ni se copió.

Las rutas PNG/JPG/WebP dentro de evidencias no están excluidas. Eso permite incluirlas cuando estén completas, pero no acredita su contenido: revisar manualmente que no muestren claves, tokens, datos privados ni respuestas simuladas presentadas como Gemini real.

Se hizo un escaneo limitado de patrones comunes de claves Google y claves privadas en los textos candidatos, **excluyendo por completo el contenido de evidencias**. No se encontraron coincidencias. No es una garantía exhaustiva ni un análisis de datos dentro de imágenes.

## 3. Archivos innecesarios o detalles revisables

- No se encontraron ZIP, PDF, PPTX, BAK, TMP, LOG, PSD, EXE, DLL, Thumbs.db o .DS_Store entre los candidatos revisados fuera de evidencias.
- Los respaldos, inspecciones, logs y salidas de build existen localmente, pero están ignorados; no se deben añadir con `git add -f`.
- Los documentos de bloques anteriores pueden resultar redundantes, pero son registros históricos. No se eliminaron. Para el estado actual usar README, AUDITORIA-FINAL y este informe; sus resultados antiguos no deben confundirse con una nueva ejecución.
- `package.json` conserva `main: "index.js"`, aunque ese archivo no existe. Es un metadato heredado **no bloqueante**: npm start usa scripts/server.cjs y Vercel usa api/chat.js. No se cambió; una limpieza posterior requeriría autorización y no es necesaria para esta publicación.
- El campo author está vacío. Completarlo es opcional, no un requisito técnico de Vercel ni un motivo para inventar datos del estudiante.
- Las fotografías propuestas sin permiso de redistribución acreditado permanecen fuera del frontend y del build. No incorporarlas mediante staging forzado ni hotlinks.

No se eliminó ningún archivo automáticamente.

## 4. Configuración técnica de Vercel

| Ajuste | Valor preparado |
| --- | --- |
| Root Directory | Raíz de Proyecto_Integrador_M3, donde está package.json; no src/ ni dist/ |
| Framework Preset | Other; vercel.json declara framework null |
| Node.js | 24.x, declarado en package.json y admitido por Vercel |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Función | `api/chat.js`, exportación CommonJS válida |
| Duración máxima de función | 30 segundos |
| Rama de producción prevista | main |

El SDK instalado es @google/genai 2.32.0, con Node >=20 y exportación CommonJS. Se comprobó la carga del constructor, sin crear un cliente autenticado ni generar contenido. El SDK es dependencia de producción y Vitest es dependencia de desarrollo. El lockfile está presente.

`scripts/build.cjs` copia src a dist; no copia servidor, API, entorno, pruebas ni respaldos. No se volvió a ejecutar el build en este bloque. El preflight existente detecta archivos sobrantes o divergentes en dist; no borra nada.

Las reescrituras son exactas: `/`, `/home`, `/chat` y `/about` apuntan a `/index.html`. No hay comodín que capture `/api/chat`. El HTML referencia `/styles.css` y `/js/main.js` desde la raíz. La función vive en api/ y usa los módulos de server/, que siguen disponibles para su empaquetado aunque no estén en dist.

`.vercelignore` excluye datos locales y privados y conserva src/, api/, server/, scripts/ y los paquetes necesarios. dist se genera durante el build remoto. No hay motivo para publicar dist en Git.

Esta revisión confirma coherencia de configuración, no un funcionamiento remoto ya demostrado. Falta verificar instalación, empaquetado, variables, rutas y función en Vercel cuando se autorice.

## 5. README y verificación previa existente

El README principal contiene descripción, tecnologías, Node 24, npm ci/start, entorno local, vercel dev condicionado a disponer de la CLI, pruebas, build, seguridad, despliegue, uso de IA, créditos, evidencias y URLs expresamente pendientes. Sus instrucciones son coherentes con los scripts actuales.

No se modifica mientras el usuario toma capturas. Los textos sobre evidencias pendientes son una instantánea anterior y pueden quedar desactualizados al incorporarse imágenes. Cuando termine, revisar ese estado y enlazar únicamente capturas existentes, con autorización separada para editar README.

Los últimos logs locales del Bloque 11 registran **48 Vitest y 16 API aprobadas**, además de build, verify y sintaxis correctos. Se consultaron esos resultados; **no se repitieron pruebas completas, build ni verify en el Bloque 12**, porque no cambió código. No se presenta el resultado anterior como una ejecución nueva.

## 6. Comandos preparados para Git Bash de Windows

**No ejecutar hasta finalizar las capturas y autorizar staging/commit/publicación.** Estos bloques son Bash, no PowerShell. No usan variables `$env:` ni here-strings de PowerShell.

### A. Situarse y revisar

```bash
cd '/c/Users/Daniel Felipe/Desktop/Proyecto_Integrador_M3'
git status --short --untracked-files=all
git branch --show-current
git remote -v
git check-ignore .env tests/.env node_modules/example.js .respaldos/example.txt dist/index.html .vercel/project.json
```

No hace falta git init ni renombrar main. Si Git solicita identidad al crear el commit, configurar solo este repositorio con datos reales elegidos por el usuario:

```bash
# Opcional: sustituir ambos textos antes de ejecutar.
git config --local user.name 'TU_NOMBRE_REAL'
git config --local user.email 'TU_EMAIL_O_NOREPLY_DE_GITHUB'
```

No se cambia la configuración global. No introducir tokens en el email, en la URL del remoto o en estos comandos.

### B. Preparar archivos y detenerse para revisar

```bash
git add -- .env.example .gitignore .vercelignore README.md api docs evidencias package.json package-lock.json scripts server src tests vercel.json vitest.config.mjs
git diff --cached --name-only
git diff --cached --stat
git diff --cached --check
git status --short
```

Revisar lo preparado antes del siguiente bloque. Las exclusiones se respetan al añadir directorios: no se usa `-f`. Finalizar capturas antes de git add evita registrar archivos parcialmente escritos. Si algo no corresponde, detenerse y decidir su retirada del staging sin borrar el archivo original.

El chequeo ligero opcional, después de finalizar capturas y antes de publicar, es `npm run verify:production`; no consume Gemini. Solo repetir las suites completas si hubo cambios de código o una causa nueva que lo justifique.

### C. Crear el primer commit

```bash
git commit -m "Entrega Proyecto Integrador M3 - Deadpool"
git log -1 --oneline
```

### D. Crear el repositorio remoto y vincularlo

Cuando se autorice, crear manualmente un repositorio en GitHub, con la visibilidad exigida para entregar. Crearlo **vacío**, sin inicializar README, .gitignore ni licencia adicionales para evitar un historial remoto distinto del local. No se creó aquí. [Procedimiento oficial de GitHub](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github).

Después de obtener la URL real, sustituir el marcador de este bloque:

```bash
github_remote='REEMPLAZAR_POR_URL_HTTPS_REAL_DEL_REPOSITORIO'
if [[ "$github_remote" == 'REEMPLAZAR_POR_URL_HTTPS_REAL_DEL_REPOSITORIO' ]]; then
  printf '%s\n' 'Configura primero la URL HTTPS real. No se añadió ningún remoto.'
else
  git remote add origin "$github_remote"
  git remote -v
fi
```

Comprobar que origin es el repositorio elegido y autenticarse mediante los mecanismos de GitHub/Git Credential Manager; nunca incrustar una credencial en la URL. Si origin ya existe al llegar a este paso, detenerse y revisarlo: no reemplazarlo automáticamente.

### E. Push, solo con autorización expresa

```bash
git push -u origin main
git status --short
```

No usar force push ni comandos para borrar/reiniciar el historial. El push cambia el estado remoto y, si después se vincula con Vercel, futuros pushes pueden disparar despliegues automáticos.

## 7. Importación en Vercel y variables

Una vez publicados y revisados los archivos en GitHub, y solo cuando se autorice crear/vincular/desplegar:

1. En Vercel, iniciar New Project y autorizar el acceso al repositorio real. No instalar la CLI para este flujo: puede hacerse en el panel.
2. Seleccionar raíz del repositorio, Framework Other y los valores de la tabla técnica. Comprobar que la rama de producción sea main.
3. Antes de desplegar, configurar únicamente estas variables de aplicación, con sus valores existentes, **sin mostrarlos en capturas ni pegarlos en esta documentación**:

| Nombre | Uso | Entorno |
| --- | --- | --- |
| GEMINI_API_KEY | Credencial privada de Gemini, solo servidor | Production; Preview/Development solo si se autoriza utilizarlos |
| GEMINI_MODEL | Identificador del modelo ya elegido; no cambiarlo | Mismos entornos en los que se permita conversar |

No se requieren PORT, prefijos públicos, credenciales de cuenta de servicio ni cambios en la .env local. Las variables del equipo no se suben por Git: Vercel debe tenerlas configuradas en su entorno de ejecución.

4. Revisar el acceso público y el riesgo de consumo de cuota antes de confirmar Deploy. La importación y conexión Git forman parte de la etapa remota y pueden desencadenar un despliegue: no realizarlas como si fueran solo una inspección local.
5. Cuando se autorice Deploy, comprobar logs de instalación/build y creación de api/chat.js. No atribuir éxito hasta verificarlo.
6. Abrir directamente y recargar /home, /chat y /about. Verificar CSS/JS/SVG. GET /api/chat debe devolver 405 JSON y no llama a Gemini.
7. Una petición POST válida y la evaluación de personalidad/contexto requieren autorización de cuota por separado. Registrar resultados reales, incluidos los fallos.
8. Con las URLs definitivas, y cuando el usuario termine las capturas, solicitar autorización para actualizar README/enlaces/checklist. Esta edición se pospone deliberadamente.

Referencias operativas: [Vercel Git](https://vercel.com/docs/git), [Node.js admitido](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), [entornos de Vercel](https://vercel.com/docs/deployments/environments). La primera publicación no debe asumirse una preview inocua: revisar el entorno y las variables de Production antes de desplegar.

## 8. Riesgos y autorizaciones pendientes

| Punto | Estado y acción necesaria |
| --- | --- |
| Capturas en curso | No preparar staging hasta que el usuario confirme que terminó; no editar sus archivos o README |
| Credenciales en imágenes | No se inspeccionaron capturas; revisión manual imprescindible antes de publicar |
| Exposición del endpoint | Hay 20 solicitudes/minuto y 2 simultáneas por instancia, pero no autenticación ni límite distribuido/global de gasto; revisar riesgo antes de exposición pública |
| Configuración real de Gemini | No se leyeron claves, no se cambió modelo y no hubo llamadas autenticadas; funcionamiento real actual pendiente de prueba autorizada |
| Recursos gráficos | SVG originales en el árbol público con procedencia documentada; esto no acredita autorización sobre el personaje. Fotografías sin permisos fuera del repositorio |
| Archivos aún sin rastrear | Deben revisarse y añadirse conscientemente; no confundir status `??` con archivos ya publicados |
| GitHub/Vercel | URLs pendientes; creación de repositorio, autenticación, vinculación, commit, push e importación/despliegue necesitan autorización |
| CLI y dependencias | No se instalaron; no son necesarias para importar desde el panel. Instalar/descargar herramientas exige autorización previa |
| Documentación final | Se actualizará después de terminar evidencias y conocer las URLs reales; no se modificaron los README aquí |

No se activó facturación, contrataron servicios ni alteraron configuraciones globales. Las decisiones de acceso, cuota y publicación quedan para una etapa autorizada.
