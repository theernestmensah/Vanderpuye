const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { createServer } = require('node:http');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(process.env.BUILD_OUTPUT || 'dist');
const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.ics': 'text/calendar', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };
let posts = 0;
const server = createServer(async (request, response) => {
  if (request.method === 'POST') {
    posts++;
    response.writeHead(posts === 1 ? 503 : 200).end();
    return;
  }
  const url = new URL(request.url, 'http://localhost').pathname;
  const file = path.join(root, url === '/' ? 'index.html' : url === '/privacy' ? 'privacy.html' : url);
  try {
    response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    response.end(await readFile(file));
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/html' }).end(await readFile(path.join(root, '404.html')));
  }
});
async function run() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(base);
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(overflow <= 1, width + 'px viewport overflow: ' + overflow);
      await page.locator('summary').focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('.agenda-menu').getAttribute('open'), '');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.agenda-menu').getAttribute('open'), null);
      for (const target of ['launch', 'acts', 'record', 'trail', 'press', 'photos', 'donate']) {
        const link = page.locator('.nav a[href="#' + target + '"]');
        if (!(await link.isVisible())) await page.locator('summary').click();
        await link.click();
        assert.equal(new URL(page.url()).hash, '#' + target);
      }
    }
    for (const route of ['/', '/privacy', '/thanks.html', '/missing-page']) {
      const response = await page.goto(base + route);
      assert.equal(response.status(), route === '/missing-page' ? 404 : 200);
      assert.equal(await page.locator('h1').count(), 1);
      if (route === '/' || route === '/privacy') {
        const canonical = await page.locator('[rel=canonical]').getAttribute('href');
        assert.equal(new URL(canonical).pathname, route);
        assert.ok(await page.locator('meta[name=description]').getAttribute('content'));
        const sharingImage = await page.locator('meta[property="og:image"]').getAttribute('content');
        assert.equal((await page.request.get(base + new URL(sharingImage).pathname)).status(), 200);
      }
      const links = await page.locator('a[href], img[src], link[rel=stylesheet]').evaluateAll(elements => elements.map(element => element.getAttribute('href') || element.getAttribute('src')));
      for (const href of new Set(links)) {
        const target = new URL(href, page.url());
        if (target.origin !== base) continue;
        const result = await page.request.get(target.href);
        assert.equal(result.status(), 200, href);
        if (target.hash) assert.ok((await result.text()).includes('id="' + target.hash.slice(1) + '"'), href);
      }
    }
    await page.goto(base);
    const form = page.locator('.join-form');
    await form.locator('button').click();
    assert.equal(posts, 0);
    await form.locator('[name=name]').fill('QA Example');
    await form.locator('[name=phone]').fill('+233 200000000');
    await form.locator('[name=region]').selectOption('Ashanti');
    await form.locator('[name=contact-consent]').check();
    await form.locator('button').click();
    await page.getByText(/could not confirm/).waitFor();
    await form.locator('button').click();
    await page.waitForURL('**/thanks.html');
    assert.equal(posts, 2);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(base);
    await page.locator('.record .pin-spacer').waitFor({ state: 'attached' });
    assert.notEqual(await page.locator('.ticker-track').evaluate(track => getComputedStyle(track).animationName), 'none');
    await page.locator('.nav a[href="#launch"]').click();
    await page.waitForURL('**/#launch');
    assert.ok(await page.evaluate(() => scrollY > 0));
    assert.deepEqual(errors, []);
    console.log('Five viewport widths, keyboard menu, internal links, image paths, 404, validation and simulated submission flows passed.');
  } finally { await browser.close(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
