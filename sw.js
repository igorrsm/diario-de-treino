// Guarda o app no celular para abrir sem internet.
// Ao mudar qualquer arquivo do app, aumente a VERSAO para os celulares baixarem de novo.
const VERSAO = 'diario-v1';
const ARQUIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];
const FONTES = 'diario-fontes';

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO && n !== FONTES).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

function comPrazo(promessa, ms) {
  return new Promise((ok, falha) => {
    const t = setTimeout(() => falha(new Error('prazo')), ms);
    promessa.then((r) => { clearTimeout(t); ok(r); }, (e) => { clearTimeout(t); falha(e); });
  });
}

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // A planilha nunca passa pelo cache.
  if (url.hostname.endsWith('script.google.com') || url.hostname.endsWith('googleusercontent.com')) return;

  // Fontes: usa a guardada e atualiza por trás.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    ev.respondWith(caches.open(FONTES).then(async (c) => {
      const guardada = await c.match(req);
      const rede = fetch(req).then((r) => { c.put(req, r.clone()); return r; }).catch(() => guardada);
      return guardada || rede;
    }));
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Página: tenta a versão nova por 3 s; sem sinal, abre a guardada.
  if (req.mode === 'navigate') {
    ev.respondWith(
      comPrazo(fetch(req), 3000)
        .then((r) => { const copia = r.clone(); caches.open(VERSAO).then((c) => c.put('./index.html', copia)); return r; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  ev.respondWith(caches.match(req).then((r) => r || fetch(req)));
});
