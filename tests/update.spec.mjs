import { readFile, readdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { expect, test } from '@playwright/test';

test('a new release waits for active tabs, then reloads offline with progress intact', async ({ page, context }) => {
  const root = new URL('../dist/', import.meta.url);
  const worker = await readFile(new URL('sw.js', root), 'utf8');
  const html = await readFile(new URL('index.html', root), 'utf8');
  const assets = new Set((await readdir(root, { recursive: true })).map(path => path.replaceAll('\\', '/')));
  const revision = worker.match(/const release = '([0-9a-f]+)'/)[1];
  const nextRevision = `next-${revision}`;
  const mimeTypes = { js: 'text/javascript', css: 'text/css', png: 'image/png', webmanifest: 'application/manifest+json' };
  let updated = false;
  const server = createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const mount = '/linuxlab/';
    if (!pathname.startsWith(mount)) {
      response.writeHead(404).end();
      return;
    }
    const file = pathname.slice(mount.length);
    try {
      if (file === '' || file === 'index.html') {
        response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
          .end(updated ? html.replaceAll(revision, nextRevision) : html);
      } else if (file === 'sw.js') {
        response.writeHead(200, { 'content-type': 'text/javascript', 'cache-control': 'no-store' })
          .end(updated ? worker.replaceAll(revision, nextRevision) : worker);
      } else {
        const mimeType = mimeTypes[file.split('.').at(-1)];
        const asset = file.replace(nextRevision, revision);
        if (!mimeType || !assets.has(asset)) throw new Error('Unrecognized asset');
        const bytes = await readFile(new URL(asset, root));
        response.writeHead(200, { 'content-type': mimeType }).end(bytes);
      }
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/linuxlab/`;
  try {
    await page.goto(url + '#/settings');
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await page.getByLabel('Цель на день').selectOption('20');
    updated = true;
    await page.evaluate(async () => { await (await navigator.serviceWorker.ready).update(); });
    await expect(page.locator('#pwa-update')).toBeVisible();
    await expect(page.locator('script[type="module"]')).toHaveAttribute('src', `./assets/${revision}/app.js`);
    await page.close();

    const reopened = await context.newPage();
    await expect.poll(async () => {
      await reopened.goto(url + '#/settings', { waitUntil: 'domcontentloaded' });
      return reopened.locator('script[type="module"]').getAttribute('src');
    }).toBe(`./assets/${nextRevision}/app.js`);
    await reopened.waitForFunction(() => !!navigator.serviceWorker.controller);
    await context.setOffline(true);
    await reopened.reload();
    await expect(reopened.getByLabel('Цель на день')).toHaveValue('20');
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
