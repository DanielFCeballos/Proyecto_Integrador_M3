// Offline preflight: no .env loading, provider calls, installs or deployment.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');

function git(args, input) {
  const result = spawnSync('git', args, { cwd: root, input, encoding: 'utf8', windowsHide: true });
  assert.ok(!result.error && [0, 1].includes(result.status), 'Git preflight could not run');
  return result.stdout;
}

function files(directory) {
  return fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap(entry => {
    const relative = `${directory}/${entry.name}`;
    assert.ok(!entry.isSymbolicLink(), `Symlink not allowed in public output: ${relative}`);
    return entry.isDirectory() ? files(relative) : [relative];
  });
}

function verify() {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  assert.equal(config.framework, null);
  assert.equal(config.installCommand, 'npm ci');
  assert.equal(config.buildCommand, 'npm run build');
  assert.equal(config.outputDirectory, 'dist');
  assert.equal(config.functions['api/chat.js'].maxDuration, 30);
  assert.deepEqual(config.rewrites, ['/', '/home', '/chat', '/about'].map(source => ({ source, destination: '/index.html' })));
  assert.equal(typeof require('../api/chat.js'), 'function');
  const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
  assert.match(html, /href="\/styles.css"/);
  assert.match(html, /src="\/js\/main.js"/);
  console.log('Routes: exact SPA rewrites, absolute assets, separate API handler: OK (configuration check)');

  const sourceFiles = files('src');
  const outputFiles = files('dist');
  assert.deepEqual(outputFiles.map(file => file.slice(5)).sort(), sourceFiles.map(file => file.slice(4)).sort(), 'dist must contain exactly src files; inspect stale output before publishing');
  for (const file of sourceFiles) {
    assert.ok(!/(^|\/)(\.[^/]+|private|credentials|server|api|node_modules)(\/|$)|\.(?:pem|key|p12|pfx|log)$/i.test(file), `Private path in public source: ${file}`);
    const content = fs.readFileSync(path.join(root, file));
    assert.ok(content.equals(fs.readFileSync(path.join(root, 'dist', file.slice(4)))), `Stale public output: ${file}`);
    if (/\.(?:js|html|css|md)$/i.test(file)) assert.doesNotMatch(content.toString('utf8'), /GEMINI_API_KEY|@google\/genai|buildCharacterInstructions|responsePolicy|systemInstruction/, `Server configuration found in public source: ${file}`);
  }
  console.log('Public output: matches src exactly; no server modules or environment files: OK');

  const ignoredPaths = ['.env', 'tests/.env', '.env.production', '.respaldos/example.txt', 'node_modules/example.js', 'dist/index.html', '.vercel/project.json', 'private/secret.txt', 'credentials/secret.json', 'server/private.key', 'server/private.pem', '.npmrc', 'L7.zip', 'L7/lecture.html', 'Lecturas_Henry_M3/lecture.pdf', 'Rubrica.png', 'rubrica-m3.png'];
  const publicPaths = ['.env.example', 'evidencias/README.md', 'evidencias/home.png', 'evidencias/chat.jpg', 'evidencias/mobile.webp', 'api/chat.js', 'server/gemini.cjs', 'package-lock.json'];
  const ignored = new Set(git(['check-ignore', '--no-index', '--stdin'], [...ignoredPaths, ...publicPaths].join('\n') + '\n').trim().split(/\r?\n/));
  for (const file of ignoredPaths) assert.ok(ignored.has(file), `Missing Git exclusion: ${file}`);
  for (const file of publicPaths) assert.ok(!ignored.has(file), `Required delivery file excluded: ${file}`);
  assert.equal(git(['ls-files', '--cached', '--ignored', '--exclude-standard', '-z']), '', 'Ignored files are already tracked; review Git index before publication');
  const candidates = git(['ls-files', '--cached', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean);
  for (const file of candidates) {
    if (!/\.(?:cjs|mjs|js|html|css|md|json|txt|example)$/i.test(file)) continue;
    const content = fs.readFileSync(path.join(root, file), 'utf8');
    // Never print matching text: report only the file needing review.
    assert.ok(!/AIza[0-9A-Za-z_-]{35}|-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/.test(content), `Possible secret in publishable file: ${file}`);
  }
  const example = fs.readFileSync(path.join(root, '.env.example'), 'utf8').split(/\r?\n/).filter(line => line.trim() && !line.trim().startsWith('#'));
  assert.deepEqual(example, ['GEMINI_API_KEY=', 'GEMINI_MODEL=']);
  console.log('Git: private paths excluded; evidence images allowed; no tracked ignored files: OK');
  console.log('Limited secret-pattern scan of publishable text and empty env template: OK (not a complete secret audit)');
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  const sdk = JSON.parse(fs.readFileSync(path.join(root, 'node_modules/@google/genai/package.json'), 'utf8'));
  assert.equal(pkg.engines.node, '24.x');
  assert.equal(sdk.engines.node, '>=20.0.0');
  assert.equal(sdk.version, pkg.dependencies['@google/genai']);
  assert.equal(lock.packages['node_modules/@google/genai'].version, sdk.version);
  assert.equal(typeof require('@google/genai').GoogleGenAI, 'function');
  console.log(`SDK: ${sdk.version}, CommonJS import, Node 24 configuration and lockfile: OK`);
  console.log('No Vercel deployment or authenticated Gemini request was performed.');
}

try { verify(); } catch (error) {
  // Assertion messages above contain paths/policy only, never matched content.
  console.error('Production preflight failed:', error.message.split('\n')[0]);
  process.exitCode = 1;
}
