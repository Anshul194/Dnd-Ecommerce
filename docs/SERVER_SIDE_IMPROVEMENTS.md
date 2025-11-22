# Server-side reliability improvements

## What I changed

- Added a small HTTP helper with retries and a simple TTL in-memory cache: `src/app/lib/utils/httpClient.js`.
- Updated shipping-related server code to use the helper:
  - `src/app/lib/services/shippingProviderService.js` now uses `fetchWithRetry`.
  - `src/app/api/delivery/check-pincode/route.js` now uses `fetchWithRetry` for external carrier APIs and caches responses for 1 hour.
  - `src/app/lib/services/orderService.js` now uses `axiosWithRetry` for several external calls (DTDC / Bluedart token & service lookups).

## Why this helps

- Retries with exponential backoff reduce transient failures when carrier APIs are flaky.
- A short TTL cache (1 hour) for pincode/service lookups reduces repeated external calls for the same data, improving latency and reducing third-party load.
- These are server-side-only changes and do not affect the UI or request semantics; they only make external calls more resilient.

## Notes

- The in-memory cache is simple (per-server-instance). For multi-instance production, prefer a shared cache (Redis) for cross-instance deduping.
- Retry parameters are conservative; adjust `retries` and `retryDelay` in `httpClient.js` call-sites if you want stricter/faster behavior.

If you'd like, I can:

- Replace other `axios` usages across `src/app/lib/services/*.js` with `axiosWithRetry` (I made targeted updates to shipping/order functions).
- Add a Redis-backed cache helper and wire it into the helper for production-grade caching.
