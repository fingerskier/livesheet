import { clientsClaim } from 'workbox-core'
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// injected by workbox with the list of assets to precache
declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<any> }

self.skipWaiting()
clientsClaim()
precacheAndRoute(self.__WB_MANIFEST)

// cache images at runtime
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [new ExpirationPlugin({ maxEntries: 50 })],
  }),
)

// Dexie Cloud service worker for offline sync
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - script provided at build time
importScripts('dexie-cloud-addon/dist/dexie-cloud-addon-sw.js')
