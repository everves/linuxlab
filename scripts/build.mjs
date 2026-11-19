import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'dist');
const versioned = ['app.js', 'answers.js', 'content.js', 'progress.js', 'pwa.js', 'routes.js', 'styles.css'];
const icons = (await readdir(join(root, 'icons'))).filter(name => name.endsWith('.png')).sort();
const files = ['index.html', 'manifest.webmanifest', 'sw.js', ...versioned, ...icons.map(name => `icons/${name}`)];
const source = new Map(await Promise.all(files.map(async file => [file, await readFile(join(root, file))])));
const hash = createHash('sha256');
for (const [file, bytes] of source) hash.update(JSON.stringify([file, bytes.length])).update(bytes);
// Include this script so changes to the output layout also invalidate the release.
const revision = hash.update(await readFile(fileURLToPath(import.meta.url))).digest('hex').slice(0, 20);
const assets = `assets/${revision}`;
const entry = source.get('index.html').toString()
  .replace('<html lang="ru">', '<html lang="ru" data-offline>')
  .replace(/\.\/(app\.js|content\.js|styles\.css)"/g, `./${assets}/$1"`);
const precache = ['./index.html', './manifest.webmanifest', ...versioned.map(file => `./${assets}/${file}`), ...icons.map(name => `./icons/${name}`)];
const worker = source.get('sw.js').toString().replace('__LINUXLAB_RELEASE__', revision)
  .replace('/* PRECACHE */ []', JSON.stringify(precache, null, 2));

await rm(output, { recursive: true, force: true });
await mkdir(join(output, assets), { recursive: true });
await mkdir(join(output, 'icons'));
await Promise.all([
  writeFile(join(output, 'index.html'), entry),
  writeFile(join(output, 'sw.js'), worker),
  writeFile(join(output, 'manifest.webmanifest'), source.get('manifest.webmanifest')),
  ...versioned.map(file => writeFile(join(output, assets, file), source.get(file))),
  ...icons.map(name => writeFile(join(output, 'icons', name), source.get(`icons/${name}`))),
]);
console.log(`LinuxLab ${revision} собран в dist/`);
