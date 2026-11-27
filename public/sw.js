const VERSION = '2-G.0.16';
const BUILD = '__LIFETRACK_BUILD__';
const SHELL_HASH = '__LIFETRACK_SHELL__';
const PREFIX = 'lifetrack-training-pwa-';
const CACHE = PREFIX + VERSION + '-' + BUILD;
const ROOT = new URL('./', self.location.href);
const SOUNDS = ['sounds/fin-effort.wav', 'sounds/fin-repos.wav'];
const ANATOMY = ['model.glb', 'draco_decoder.js', 'draco_decoder.wasm', 'draco_wasm_wrapper.js'].map(name => 'anatomy/' + name);
const EXTRAS = ['manifest.webmanifest', 'Icons/icon-192.png', 'Icons/icon-512.png', 'Icons/icon-180.png',
  'anatomy/provenance.json', 'anatomy/UPSTREAM-LICENSE.txt', 'anatomy/THREE-LICENSE.txt', 'anatomy/NOTICE.txt'];
const url = path => new URL(path, ROOT).href;
const isStatic = requestURL => requestURL.origin === ROOT.origin &&
  !requestURL.search && /^assets\/[^/]+-[\w-]{8,}\.(js|css)$/.test(requestURL.pathname.slice(ROOT.pathname.length)) &&
  requestURL.pathname.startsWith(ROOT.pathname);

function shellAssets(html) {
  return [...new Set([...html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css))["']/g)]
    .map(match => new URL(match[1], ROOT))
    .filter(isStatic).map(address => address.href))];
}

async function fillMissing(cache, files) {
  await Promise.allSettled(files.map(async path => {
    const address = url(path);
    if (await cache.match(address)) return;
    const response = await fetch(address, { cache: 'no-store' });
    if (response.ok && response.url === address) await cache.put(address, response);
  }));
}

async function repairShell(cache) {
  const saved = await cache.match(ROOT.href);
  const response = saved || await fetch(ROOT.href, {cache: 'reload'});
  if (!response.ok) throw new Error('Index indisponible');
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await response.clone().arrayBuffer())),
    byte => byte.toString(16).padStart(2, '0')).join('');
  if (digest !== SHELL_HASH) throw new Error('Index d’une autre compilation');
  const assets = shellAssets(await response.clone().text());
  if (!assets.some(address => address.endsWith('.js')) || !assets.some(address => address.endsWith('.css'))) {
    throw new Error('Ressources de démarrage introuvables');
  }
  const missing = (await Promise.all(assets.map(async address => (await cache.match(address)) ? null : address))).filter(Boolean);
  if (missing.length) await cache.addAll(missing);
  if (!saved) await cache.put(ROOT.href, response);
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    // The build replaces the marker. Development resources are served by Vite directly.
    if (BUILD.startsWith('__')) return;
    const cache = await caches.open(CACHE);
    await repairShell(cache);
    await fillMissing(cache, [...SOUNDS, ...ANATOMY, ...EXTRAS]);
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    if (!BUILD.startsWith('__')) {
      for (const key of await caches.keys()) {
        if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
      }
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') event.waitUntil(self.skipWaiting());
  if (event.data?.type === 'OFFLINE_STATUS' && event.ports[0]) {
    event.waitUntil((async () => {
      const port = event.ports[0];
      if (BUILD.startsWith('__')) { port.postMessage(null); return; }
      if (!await caches.has(CACHE)) {
        port.postMessage({core: false, sounds: false, anatomy: false});
        return;
      }
      const cache = await caches.open(CACHE);
      if (event.data.repair) await Promise.allSettled([repairShell(cache), fillMissing(cache, [...SOUNDS, ...ANATOMY])]);
      const hasFiles = async files => (await Promise.all(files.map(path => cache.match(url(path))))).every(Boolean);
      const shell = await cache.match(ROOT.href);
      const assets = shell ? shellAssets(await shell.text()) : [];
      port.postMessage({
        core: Boolean(shell) && assets.length > 0 && (await Promise.all(assets.map(address => cache.match(address)))).every(Boolean),
        sounds: await hasFiles(SOUNDS),
        anatomy: await hasFiles(ANATOMY),
      });
    })());
  }
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const address = new URL(request.url);
  if (BUILD.startsWith('__') || request.method !== 'GET' || address.origin !== ROOT.origin ||
      !address.pathname.startsWith(ROOT.pathname)) return;

  event.respondWith((async () => {
    // Named lookups avoid recreating an old cache while a new worker takes control.
    if (request.mode === 'navigate' && (address.pathname === ROOT.pathname || address.pathname === urlPath('index.html'))) {
      const saved = await caches.match(ROOT.href, {cacheName: CACHE});
      if (saved) return saved;
      // A new online visit can also recover after the browser evicts the entire cache.
      await repairShell(await caches.open(CACHE));
      return (await caches.match(ROOT.href, {cacheName: CACHE})) || Response.error();
    }
    const staticAsset = isStatic(address) && ['script', 'style'].includes(request.destination);
    const cached = await caches.match(request, {cacheName: CACHE, ignoreVary: staticAsset});
    return cached || fetch(request);
  })());
});

function urlPath(path) {
  return new URL(path, ROOT).pathname;
}
