// Package only public files. This command does not publish or deploy anything.
const fs = require('node:fs/promises');
const path = require('node:path');
async function build() {
  const root = path.resolve(__dirname, '..');
  await fs.mkdir(path.join(root, 'dist'), { recursive: true });
  await fs.cp(path.join(root, 'src'), path.join(root, 'dist'), { recursive: true });
  console.log('Frontend preparado en dist/. No incluye server/, api/ ni archivos de entorno.');
}
build().catch(() => { console.error('No se pudo preparar el frontend.'); process.exitCode = 1; });
