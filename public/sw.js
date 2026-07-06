// Service Worker מינימלי: רשת קודם (תמיד תוכן טרי), נפילה לקאש רק כשאין אינטרנט
const CACHE = 'gan-report-v1'
self.addEventListener('install', e => { self.skipWaiting() })
self.addEventListener('activate', e => { e.waitUntil(clients.claim()) })
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && e.request.url.startsWith(self.location.origin)) {
        const copy = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, copy))
      }
      return res
    }).catch(() => caches.match(e.request).then(m => m || caches.match('/')))
  )
})
