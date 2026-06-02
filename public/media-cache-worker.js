const MEDIA_CACHE_NAME = 'admission-partner-media-v1';
const HERO_VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => Promise.all(cacheNames.filter((cacheName) => cacheName.startsWith('admission-partner-media-') && cacheName !== MEDIA_CACHE_NAME).map((cacheName) => caches.delete(cacheName))))
      .then(() => self.clients.claim()),
  );
});

async function cacheHeroVideo(url) {
  const cache = await caches.open(MEDIA_CACHE_NAME);
  const cachedResponse = await cache.match(url);

  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(url, { mode: 'no-cors' });
  await cache.put(url, response.clone());
  return response;
}

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_HERO_VIDEO') {
    return;
  }

  event.waitUntil(cacheHeroVideo(event.data.url || HERO_VIDEO_URL).catch(() => undefined));
});

self.addEventListener('fetch', (event) => {
  if (event.request.url !== HERO_VIDEO_URL) {
    return;
  }

  event.respondWith(
    caches.open(MEDIA_CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(HERO_VIDEO_URL);
      if (cachedResponse) {
        return cachedResponse;
      }

      const response = await fetch(event.request);
      cache.put(HERO_VIDEO_URL, response.clone()).catch(() => undefined);
      return response;
    }),
  );
});
