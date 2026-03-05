/// Service Worker for EDUDA PWA
/// Caching strategies:
///   - Static assets (/_next/static/): Cache First (immutable, hashed filenames)
///   - Fonts (Google Fonts, fonts.gstatic.com): Cache First, 1 year
///   - Images: Stale While Revalidate, 30 days max
///   - Navigation (HTML pages): Network First, offline fallback
///   - API / Server Actions: Network Only (never cached)

const CACHE_VERSION = 'eduda-v2'
const STATIC_CACHE = CACHE_VERSION + '-static'
const RUNTIME_CACHE = CACHE_VERSION + '-runtime'
const OFFLINE_URL = '/offline'

// Precache offline page on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.add(OFFLINE_URL))
  )
})

// Clean old caches on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Skip waiting when asked by the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Fetch handler with routing
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests (mutations, server actions)
  if (request.method !== 'GET') return

  // Skip API routes and Next.js internals that are dynamic
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/data/')
  ) {
    return
  }

  // Strategy: Cache First for static assets (hashed filenames, immutable)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Strategy: Cache First for fonts
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Strategy: Stale While Revalidate for images
  if (
    request.destination === 'image' ||
    url.pathname.startsWith('/_next/image')
  ) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE))
    return
  }

  // Strategy: Network First for navigation (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOffline(request))
    return
  }

  // Default: Network First for other resources (CSS, JS chunks)
  event.respondWith(networkFirst(request, RUNTIME_CACHE))
})

// --- Caching strategies ---

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('', { status: 408, statusText: 'Offline' })
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    return cached || new Response('', { status: 408, statusText: 'Offline' })
  }
}

async function networkFirstWithOffline(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached

    // Serve offline fallback page
    const offlinePage = await caches.match(OFFLINE_URL)
    return offlinePage || new Response('Offline', {
      status: 503,
      headers: { 'Content-Type': 'text/html' },
    })
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => cached)

  return cached || fetchPromise
}
