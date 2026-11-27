import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { chromium, devices, expect } from '@playwright/test';

const dist = process.env.LIFETRACK_DIST ?? 'dist';
const base = '/LifeTrack-Training-Preview/';
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.wasm': 'application/wasm', '.wav': 'audio/wav', '.glb': 'model/gltf-binary' };
const resources = ['sounds/fin-effort.wav', 'sounds/fin-repos.wav', 'anatomy/model.glb', 'anatomy/draco_decoder.wasm', 'anatomy/draco_decoder.js', 'anatomy/draco_wasm_wrapper.js'];
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (!url.pathname.startsWith(base)) { res.writeHead(404).end(); return; }
  if (outage) { requestsDuringOutage++; res.destroy(); return; }
  const file = url.pathname.slice(base.length) || 'index.html';
  if (missing.has(file)) { res.writeHead(404).end(); return; }
  try {
    let data = await readFile(join(dist, file));
    if (file === 'sw.js' && update) data = data.toString().replace(/const BUILD = '[^']+';/, "const BUILD = 'production-test-update';");
    if (file === 'index.html' && mixedShell) data = Buffer.concat([data, Buffer.from('<!-- another build -->')]);
    res.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store', Vary: 'Origin' });
    res.end(data);
  } catch { res.writeHead(404).end(); }
});
let outage = false, update = false, mixedShell = false, requestsDuringOutage = 0;
const missing = new Set();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const root = 'http://127.0.0.1:' + server.address().port + base;
const browser = await chromium.launch({
  executablePath: process.env.LIFETRACK_CHROMIUM || undefined,
});
const context = () => browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'allow' });
const home = page => page.getByRole('heading', { name: /Bonjour/ });
const nav = page => page.getByRole('navigation', { name: 'Navigation mobile' });
const openSession = page => nav(page).getByRole('button', { name: 'Séance', exact: true }).tap();
const resume = page => page.getByRole('dialog', { name: 'Séance interrompue' }).getByRole('button', { name: 'Reprendre' });
const cacheInventory = page => page.evaluate(async () => {
  const keys = await caches.keys();
  return Object.fromEntries(await Promise.all(keys.map(async key => [key, (await (await caches.open(key)).keys()).map(request => new URL(request.url).pathname)])));
});
const initial = async page => {
  page.setDefaultTimeout(10000);
  await page.goto(root);
  await page.waitForFunction(() => navigator.serviceWorker.controller?.state === 'activated');
  await home(page).waitFor();
};
const record = page => page.evaluate(async () => {
  const db = await new Promise((resolve, reject) => {
    const req = indexedDB.open('lifetrack-training'); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
  });
  try {
    return await new Promise((resolve, reject) => {
      const req = db.transaction('executions').objectStore('executions').get('execution:diagnostic');
      req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
    });
  } finally { db.close(); }
});
const assertStatus = async (page, status) => expect.poll(async () => (await record(page))?.status).toBe(status);
async function seed(page, restRemainingMs = 0) {
  await expect(page.getByText(/Schéma 4 vérifié/)).toBeVisible();
  await page.evaluate(async restRemainingMs => {
    const db = await new Promise(resolve => { const req = indexedDB.open('lifetrack-training'); req.onsuccess = () => resolve(req.result); });
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction('executions', 'readwrite');
        const now = new Date().toISOString();
        tx.objectStore('executions').put({
          id: 'execution:diagnostic', templateId: 'template:diagnostic', plannedId: null, name: 'Séance fictive de diagnostic',
          targets: [{ exerciseId: 'diagnostic', order: 0, sets: 3, reps: 10, restSeconds: 60 }],
          startedAt: now, updatedAt: now, endedAt: null, status: 'paused', activeMs: 4000, pauseMs: 0, restMs: 0,
          lastTick: now, restUntil: null, restRemainingMs, completedIndexes: [], manualDuration: false,
          exerciseKinds: { 0: 'musculation' }, exerciseResults: [{ index: 0, sets: [{ set: 1, reps: 10, loadKg: 20, rir: 2, validated: true }] }],
        });
        tx.oncomplete = resolve; tx.onabort = () => reject(tx.error);
      });
    } finally { db.close(); }
  }, restRemainingMs);
}
const hide = page => page.evaluate(() => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
  document.dispatchEvent(new Event('visibilitychange'));
});
const show = page => page.evaluate(() => {
  delete document.visibilityState;
  document.dispatchEvent(new Event('visibilitychange'));
});
try {
  {
    const ctx = await context();
    const page = await ctx.newPage();
    await initial(page);
    const inventory = await cacheInventory(page);
    assert.equal(Object.keys(inventory).length, 1);
    const entries = Object.values(inventory).flat();
    assert.ok(entries.includes(base) && entries.some(path => path.endsWith('.css')) && entries.some(path => path.includes('/assets/') && path.endsWith('.js')));
    for (const resource of resources) assert.ok(entries.includes(base + resource));
    outage = true;
    const response = await page.reload();
    await home(page).waitFor();
    await openSession(page);
    await page.getByRole('heading', { name: 'Exécution', exact: true }).waitFor();
    const fetched = await page.evaluate(async resources => await Promise.all(resources.map(async path => {
      const x = await fetch(path); const bytes = await x.arrayBuffer();
      return [path, x.status, bytes.byteLength];
    })), resources);
    assert.equal(response.fromServiceWorker(), true);
    assert.ok(fetched.every(([, status, bytes]) => status === 200 && bytes > 0));
    assert.equal(requestsDuringOutage, 0);
    console.log('PASS cached production app, sounds and anatomy with server unavailable');
    outage = false;
    await ctx.close();
  }
  {
    const ctx = await context();
    const page = await ctx.newPage();
    await initial(page);
    await ctx.setOffline(true);
    for (const target of [page, await ctx.newPage()]) {
      const response = target === page ? await target.reload() : await target.goto(root);
      assert.equal(response?.status(), 200);
      assert.equal(response?.fromServiceWorker(), true);
      await home(target).waitFor();
    }
    console.log('PASS browser offline with Vary: Origin, on reload and in a new tab');
    await ctx.close();
  }
  {
    const ctx = await context();
    missing.add('sounds/fin-effort.wav'); missing.add('anatomy/model.glb');
    const page = await ctx.newPage();
    await initial(page);
    const entries = Object.values(await cacheInventory(page)).flat();
    for (const file of missing) assert.ok(!entries.includes(base + file));
    const warning = page.getByText(/Disponibilité hors ligne limitée.*Sons.*Modèle anatomique/);
    await expect(warning).toBeVisible();
    missing.clear();
    await ctx.setOffline(true);
    await ctx.setOffline(false);
    await expect(warning).toBeHidden();
    const repaired = Object.values(await cacheInventory(page)).flat();
    assert.ok(repaired.includes(base + 'sounds/fin-effort.wav') && repaired.includes(base + 'anatomy/model.glb'));
    await page.evaluate(async () => {
      const [name] = await caches.keys();
      const cache = await caches.open(name);
      const css = (await cache.keys()).find(request => request.url.endsWith('.css'));
      if (!css || !await cache.delete(css)) throw Error('Compiled stylesheet absent before eviction');
    });
    await ctx.setOffline(true);
    const coreWarning = page.getByText(/Disponibilité hors ligne limitée.*Démarrage/);
    await expect(coreWarning).toBeVisible();
    await ctx.setOffline(false);
    await expect(coreWarning).toBeHidden();
    await ctx.setOffline(true);
    await page.reload();
    await expect(home(page)).toBeVisible();
    console.log('PASS missing optional assets and lost core stylesheet are reported and repaired');
    await ctx.close();
  }
  {
    const ctx = await context();
    const page = await ctx.newPage();
    await initial(page);
    await seed(page, 60000);
    await openSession(page);
    await resume(page).tap();
    await assertStatus(page, 'active');
    await hide(page);
    await assertStatus(page, 'paused');
    const paused = await record(page);
    assert.ok(paused.restRemainingMs > 0 && paused.restUntil === null);
    assert.equal(paused.exerciseResults[0].sets[0].reps, 10);
    await show(page);
    await page.reload();
    await home(page).waitFor();
    await openSession(page);
    await resume(page).tap();
    await assertStatus(page, 'active');
    assert.ok((await record(page)).restUntil);
    console.log('Masquage simulé et rechargement : série conservée, repos figé puis repris', paused.restRemainingMs);
    update = true;
    mixedShell = true;
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      await registration.update().catch(() => {});
      const installing = registration.installing;
      if (installing && !['redundant', 'installed'].includes(installing.state)) {
        await new Promise(resolve => installing.addEventListener('statechange', function check() {
          if (installing.state === 'redundant' || installing.state === 'installed') resolve();
        }));
      }
      if (registration.waiting) throw Error('Mixed shell accepted');
    });
    mixedShell = false;
    await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration()).update(); });
    await expect(page.getByText('Nouvelle version disponible.', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mettre à jour', exact: true })).toHaveCount(0);
    const secondTab = await ctx.newPage();
    await initial(secondTab);
    await secondTab.getByRole('button', {name:'Mettre à jour', exact:true}).tap();
    await expect(secondTab.getByText('Termine la séance en cours avant de mettre à jour.')).toBeVisible();
    await secondTab.close();
    await assertStatus(page, 'active');
    const switched = page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      await new Promise(resolve => {
        navigator.serviceWorker.addEventListener('controllerchange', resolve, {once:true});
        registration.waiting.postMessage({type:'SKIP_WAITING'});
      });
    });
    await switched;
    await expect(page.getByRole('heading', {name:'Exécution', exact:true})).toBeVisible();
    assert.equal((await record(page)).status, 'active');
    assert.ok((await cacheInventory(page))['lifetrack-training-pwa-2-G.0.16-production-test-update']?.includes(base));
    await page.evaluate(async () => {
      const other = await caches.open('lifetrack-training-pwa-2-G.0.16-stale-test');
      await other.put(new URL('assets/stale-abcdefgh.css', location.href), new Response('body {}', {headers:{'Content-Type':'text/css'}}));
    });
    await ctx.setOffline(true);
    const staleLoaded = await page.evaluate(() => new Promise(resolve => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'assets/stale-abcdefgh.css';
      link.onload = () => resolve(true);
      link.onerror = () => resolve(false);
      document.head.append(link);
    }));
    assert.equal(staleLoaded, false);
    await ctx.setOffline(false);
    // Verify a review draft survives a reload even when another client activates the worker.
    await page.getByRole('button', {name:'Passer le repos', exact:true}).tap();
    await page.getByRole('button', {name:'Terminer', exact:true}).tap();
    const comment = page.getByRole('textbox', {name:/Commentaires sur ma séance/});
    await comment.fill('Brouillon de diagnostic');
    await page.reload();
    await home(page).waitFor();
    await openSession(page);
    await page.getByRole('dialog', {name:'Séance interrompue'}).getByRole('button', {name:'Terminer', exact:true}).tap();
    await expect(comment).toHaveValue('Brouillon de diagnostic');
    assert.equal((await record(page)).exerciseResults[0].sets[0].reps, 10);
    console.log('PASS mixed build rejected, update deferred, draft and saved set recovered');
    update = false;
    await ctx.close();
  }
  for (const abort of [false, true]) {
    const ctx = await context();
    const page = await ctx.newPage();
    await initial(page);
    await seed(page);
    await openSession(page);
    await resume(page).tap();
    await assertStatus(page, 'active');
    await page.getByRole('button', {name:'Valider la série', exact:true}).waitFor();
    await page.evaluate(abort => {
      const original = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function (value, ...args) {
        const result = original.call(this, value, ...args);
        if (this.name === 'executions' && value.pendingAssessment) {
          IDBObjectStore.prototype.put = original;
          window.hiddenAt = Date.now();
          Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
          document.dispatchEvent(new Event('visibilitychange'));
          window.hiddenHandledAt = Date.now();
          if (abort) this.transaction.abort();
        }
        return result;
      };
    }, abort);
    await page.getByRole('button', {name:'Valider la série', exact:true}).tap();
    await assertStatus(page, 'paused');
    const committed = await record(page);
    assert.deepEqual(committed.exerciseResults[0].sets.map(set => set.set), abort ? [1] : [1, 2]);
    const [hiddenAt, handledAt] = await page.evaluate(() => [window.hiddenAt, window.hiddenHandledAt]);
    const persistedAt = Date.parse(committed.lastTick);
    assert.ok(persistedAt >= hiddenAt && persistedAt <= handledAt, 'Pause uses the visibility event time');
    await show(page);
    await page.reload();
    await home(page).waitFor();
    await openSession(page);
    await resume(page).tap();
    await assertStatus(page, 'active');
    assert.deepEqual((await record(page)).exerciseResults[0].sets.map(set => set.set), abort ? [1] : [1, 2]);
    console.log('PASS pause during set validation, resume without duplicate; aborted =', abort);
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}
