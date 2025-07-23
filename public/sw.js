// NelsonGPT Service Worker
const CACHE_NAME = 'nelson-gpt-v1.0.0'
const STATIC_CACHE_NAME = 'nelson-gpt-static-v1.0.0'
const DYNAMIC_CACHE_NAME = 'nelson-gpt-dynamic-v1.0.0'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/.*\.supabase\.co\/.*/,
  /^https:\/\/api\.mistral\.ai\/.*/,
  /^https:\/\/api\.openai\.com\/.*/,
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('NelsonGPT Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('NelsonGPT Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('NelsonGPT Service Worker: Static assets cached')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('NelsonGPT Service Worker: Failed to cache static assets', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('NelsonGPT Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('nelson-gpt-')) {
              console.log('NelsonGPT Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('NelsonGPT Service Worker: Activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Handle different types of requests
  if (request.destination === 'document') {
    // HTML documents - Network first, fallback to cache
    event.respondWith(networkFirstStrategy(request, STATIC_CACHE_NAME))
  } else if (isStaticAsset(request)) {
    // Static assets - Cache first
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE_NAME))
  } else if (isAPIRequest(request)) {
    // API requests - Network first with short cache
    event.respondWith(networkFirstWithTimeoutStrategy(request, DYNAMIC_CACHE_NAME))
  } else {
    // Other requests - Network first
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE_NAME))
  }
})

// Network first strategy
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('NelsonGPT Service Worker: Network failed, trying cache', error)
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline fallback for HTML documents
    if (request.destination === 'document') {
      return caches.match('/offline.html') || new Response(
        getOfflineHTML(),
        { headers: { 'Content-Type': 'text/html' } }
      )
    }
    
    throw error
  }
}

// Cache first strategy
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('NelsonGPT Service Worker: Failed to fetch', request.url, error)
    throw error
  }
}

// Network first with timeout strategy for API requests
async function networkFirstWithTimeoutStrategy(request, cacheName, timeout = 5000) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    const networkResponse = await fetch(request, {
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      // Cache API responses for 5 minutes
      const responseToCache = networkResponse.clone()
      responseToCache.headers.set('sw-cache-timestamp', Date.now().toString())
      cache.put(request, responseToCache)
    }
    
    return networkResponse
  } catch (error) {
    console.log('NelsonGPT Service Worker: API request failed, trying cache', error)
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      // Check if cached response is still fresh (5 minutes)
      const cacheTimestamp = cachedResponse.headers.get('sw-cache-timestamp')
      if (cacheTimestamp && Date.now() - parseInt(cacheTimestamp) < 5 * 60 * 1000) {
        return cachedResponse
      }
    }
    
    throw error
  }
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url)
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/)
}

function isAPIRequest(request) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))
}

function getOfflineHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>NelsonGPT - Offline</title>
      <style>
        body {
          font-family: 'Inter', system-ui, sans-serif;
          background-color: #1e1e1e;
          color: #f2f2f2;
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
        }
        .offline-container {
          max-width: 400px;
          padding: 2rem;
        }
        .offline-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1.5rem;
          background-color: #4a90e2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }
        h1 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #f2f2f2;
        }
        p {
          color: #b3b3b3;
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }
        .retry-button {
          background-color: #4a90e2;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.2s;
        }
        .retry-button:hover {
          background-color: #357abd;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">🩺</div>
        <h1>You're Offline</h1>
        <p>
          NelsonGPT requires an internet connection to provide medical assistance. 
          Please check your connection and try again.
        </p>
        <button class="retry-button" onclick="window.location.reload()">
          Try Again
        </button>
      </div>
    </body>
    </html>
  `
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync())
  }
})

async function handleBackgroundSync() {
  console.log('NelsonGPT Service Worker: Handling background sync')
  // Handle any queued offline actions here
}

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: data.actions
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow('/')
  )
})

console.log('NelsonGPT Service Worker: Loaded')

