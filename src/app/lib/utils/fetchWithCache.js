// Lightweight fetch with optional in-memory caching and retry/backoff.
// Server-side utility for Next.js API routes and services.
const globalCache = globalThis.__fetchWithCache || new Map();
globalThis.__fetchWithCache = globalCache;

function makeCacheKey(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body
    ? typeof options.body === "string"
      ? options.body
      : JSON.stringify(options.body)
    : "";
  return `${method}::${url}::${body}`;
}

async function fetchWithCache(url, options = {}, opts = {}) {
  // opts: { retries, retryDelay, cacheTTL }
  const retries = Number(opts.retries ?? 2);
  const retryDelay = Number(opts.retryDelay ?? 300); // ms
  const cacheTTL = Number(opts.cacheTTL ?? 0); // seconds

  const method = (options.method || "GET").toUpperCase();
  const cacheKey = makeCacheKey(url, options);

  if (cacheTTL > 0 && method === "GET") {
    const cached = globalCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return { fromCache: true, response: cached.value.clone() };
    }
  }

  let lastErr = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        // treat 5xx as retryable; 4xx as final
        if (res.status >= 500 && attempt < retries) {
          lastErr = new Error(`HTTP ${res.status}`);
          await new Promise((r) =>
            setTimeout(r, retryDelay * Math.pow(2, attempt))
          );
          continue;
        }
        // non-retryable or last attempt: return response for caller to handle
        if (cacheTTL > 0 && method === "GET") {
          // cache even failed responses? no — skip caching
        }
        return { fromCache: false, response: res };
      }

      // clone response for cache and return
      if (cacheTTL > 0 && method === "GET") {
        try {
          const clone = res.clone();
          // store clone's body as text to allow reuse
          const bodyText = await clone.text();
          // We'll create a synthetic Response-like object for cached value
          const cachedValue = new Response(bodyText, {
            status: res.status,
            statusText: res.statusText,
            headers: res.headers,
          });
          globalCache.set(cacheKey, {
            expiresAt: Date.now() + cacheTTL * 1000,
            value: cachedValue,
          });
        } catch (e) {
          // ignore cache store failures
        }
      }

      return { fromCache: false, response: res };
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) =>
          setTimeout(r, retryDelay * Math.pow(2, attempt))
        );
        continue;
      }
      throw lastErr;
    }
  }
  throw lastErr;
}

export default fetchWithCache;
