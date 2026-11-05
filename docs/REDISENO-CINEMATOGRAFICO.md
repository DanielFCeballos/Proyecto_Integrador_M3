# Bloque 10 · Rediseño cinematográfico responsive

Respaldo previo: `.respaldos/bloque10-20261104-194448/`. Incluye frontend, servidor, API, scripts, documentación, paquetes, pruebas sin archivos `.env` y copia de las evidencias. El estado de `evidencias/` permanece intacto.

## Inspección de imágenes seleccionadas

Se consultaron las URLs sin credenciales y se midieron los archivos recibidos. Los tres respondieron HTTP 200. El CDN puede cambiar formato o contenido en el futuro: estos son resultados de la consulta realizada en este bloque, no una garantía permanente.

| Recurso | Dimensiones verificadas | Formato recibido / bytes | Alojamiento observado | Autor, origen editorial y permiso |
| --- | --- | --- | --- | --- |
| [1 · Deadpool2.jpg](https://images.squarespace-cdn.com/content/v1/5a7dcf69d7bdce185884a6b5/1526054349780-5D3PLL55ID87QE9Q3QMA/Deadpool2.jpg) | 1080 × 721 | WebP, 78098 bytes; aunque la URL termina en `.jpg` | CDN de Squarespace | No acreditados |
| [2 · retrato vertical](https://i.pinimg.com/236x/af/4b/f2/af4bf25a3cb7b13c32340428c1bf8243.jpg) | 236 × 420 | JPEG, 23627 bytes | CDN de Pinterest | No acreditados |
| [3 · retrato vertical](https://i.pinimg.com/736x/88/85/7c/88857c7dbbff766df44c50cc523e67dd.jpg) | 736 × 1308 | JPEG, 189418 bytes | CDN de Pinterest | No acreditados |

Una búsqueda de los identificadores exactos no localizó páginas de origen. Las URLs directas y sus respuestas no proporcionaron una licencia verificable. El alojamiento en Squarespace o Pinterest identifica un servicio de distribución, no al autor ni al titular original. No se afirma que las imágenes sean libres, que el usuario tenga autorización del titular ni que el uso académico resuelva el permiso.

Copias y metadatos de inspección: `.respaldos/referencias-bloque10/`. No están en `src/`, `dist/`, el índice de Git ni el conjunto de archivos publicables. No se añaden hotlinks al sitio.

## Propuesta pendiente de permiso

| Imagen | Ubicación propuesta | Tratamiento previsto si se autoriza |
| --- | --- | --- |
| 1 | Encabezado protagonista de Home | Composición horizontal, sujeto hacia la derecha; `object-fit: cover`, foco aproximado 65% 35%, degradado oscuro para separar el texto. En móvil, un panel corto con encuadre propio. |
| 2 | Fondo ambiental del chat | Retrato a baja opacidad con degradado; su resolución de 236 px limita el detalle. Para una ampliación nítida haría falta un original autorizado de mayor resolución. No se inventa ni busca una URL de mayor tamaño. |
| 3 | Sección About | Tarjeta de retrato con foco aproximado 50% 30%; el fondo claro requeriría revisar encuadre y contraste con el panel oscuro. |

Antes de incorporar cualquiera habría que identificar su titular y documentar el permiso o licencia aplicable, sus condiciones de redistribución, atribución y posibles modificaciones. Esos puntos siguen pendientes; las imágenes seleccionadas **no se incorporaron** al repositorio público ni al despliegue.

## Composición implementada con recursos propios

- Home: retrato SVG original del Bloque 9 como protagonista, iluminación roja, degradado de transición, tarjeta sin inclinación, título y CTA con jerarquía clara.
- Chat: nuevo `deadpool-ambient.svg`, oscuro y con encuadre de máscara, siempre presente con baja opacidad incluso en móvil. Las burbujas conservan superficies opacas. El avatar original acompaña las respuestas y permanece en los encabezados.
- About: nuevo `deadpool-about.svg`, otra composición de luz y encuadre basada en los trazados originales del avatar; tarjeta visual con texto al lado en tablet/escritorio y apilada en móvil.
- `visualAssets`, exportado desde `views.js`, separa los tres roles de imagen. Actualmente apunta exclusivamente a SVG locales originales; no activa automáticamente las fotografías propuestas.
- CSS mobile-first con `object-fit`, `object-position`, degradados, bordes suaves y tipografía local. El lateral aparece desde 960 px, mientras que el avatar y el fondo se conservan en tamaños pequeños. A 768 px se adaptan Home y About a columnas; a 1024 px se amplían márgenes y proporciones.

Los SVG nuevos no se basan en las fotografías seleccionadas ni copian fotogramas. Se componen a partir de geometrías creadas en este proyecto. Esto no concede derechos sobre Deadpool ni implica autorización de Marvel: se conserva la identificación no oficial. [Créditos](../src/assets/CREDITS.md).

## Archivos afectados

Modificados: `src/styles.css`, `src/js/views.js`, `tests/unit/personality.test.mjs`, `tests/chat.test.cjs`, `src/assets/CREDITS.md`, `README.md`.

Creados: `src/assets/deadpool-ambient.svg`, `src/assets/deadpool-about.svg` y este documento. Los auxiliares de inspección y QA están únicamente en `.respaldos/`. El build regenera `dist/`, que continúa excluido de Git.

No cambian `server/`, `api/`, `chat.js`, las instrucciones del personaje, el historial, la navegación, el proveedor, las credenciales, el modelo ni las dependencias. Las pruebas se ajustan para reconocer únicamente los nuevos SVG locales y comprobar sus respuestas HTTP y contenido inerte.

## Verificaciones

```powershell
npm.cmd test
npm.cmd run test:api
npm.cmd run build
npm.cmd run verify:production
```

Resultados: 44 casos Vitest y los 16 casos originales de API aprobados; build y preflight correctos. Pruebas sin claves ni llamadas a Gemini real.

Chrome headless verificó **Home, Chat y About en 320, 375, 766, 768, 960, 1024 y 1440 px**: sin scroll horizontal, imágenes cargadas, presencia visual en cada tamaño e identificación permanente. En chat se comprobó fondo visible en móvil, lateral desde 960 px, encabezado compacto y contraste de mensajes mínimo 4.5:1. También pasaron navegación, historial completo, reintento sin duplicados, manejo de errores y reinicio/cancelación. No hubo solicitudes HTTP externas desde la aplicación.

Capturas de revisión con proveedor simulado: `.respaldos/bloque10-*-mock.png`. No se alteraron capturas existentes ni se presentan estas imágenes como evidencia de Gemini autenticado. El auxiliar `.respaldos/verify-bloque10-browser.cjs` inicia un servidor simulado nuevo en puerto 3010 y lo cierra al terminar.

Para ver la aplicación: `npm.cmd start` y abrir `http://localhost:3000/home`, `/chat`, `/about`. Enviar mensajes en ese servidor utiliza la integración real; no hacerlo si se quiere revisar solo el aspecto sin consumir cuota.

Pendientes antes de publicar: permisos documentados para las fotografías si se quieren utilizar, evidencias reales actualizadas, control de abuso del endpoint y validación remota de Vercel. No se realizaron instalaciones, llamadas autenticadas, commits, push ni despliegues.
