// Lightweight HTTP helper with retry and simple in-memory TTL cache
// Intended for server-side use only (Next.js server routes / API services)

const cache = new Map();

function makeCacheKey(method, url, body) {
  const b = body ? JSON.stringify(body) : "";
  return `${method.toUpperCase()}::${url}::${b}`;
}

function setCache(key, value, ttlMs) {
  const expires = Date.now() + (ttlMs || 0);
  cache.set(key, { value, expires });
}

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expires && Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

async function fetchWithRetry(
  url,
  options = {},
  { retries = 2, retryDelay = 300, cacheTtl = 0 } = {}
) {
  const method = (options.method || "GET").toUpperCase();
  const key = makeCacheKey(method, url, options.body);

  if (cacheTtl && method === "GET") {
    const cached = getCache(key);
    if (cached) return cached;
  }

  let attempt = 0;
  let lastErr = null;
  while (attempt <= retries) {
    try {
      const res = await fetch(url, options);
      // consider non-2xx as an error to trigger retry for idempotent requests
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const err = new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
        err.status = res.status;
        throw err;
      }

      const contentType = res.headers.get("content-type") || "";
      let data;
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (cacheTtl && method === "GET") {
        setCache(key, data, cacheTtl);
      }

      return data;
    } catch (err) {
      lastErr = err;
      attempt += 1;
      if (attempt > retries) break;
      // exponential backoff
      const wait = retryDelay * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, wait));
    }
  }

  throw lastErr;
}

// axios wrapper using axios instance if needed; fallback to fetch
async function axiosWithRetry(axiosInstance, config = {}, opts = {}) {
  const { retries = 2, retryDelay = 300, cacheTtl = 0 } = opts;
  const method = (config.method || "get").toUpperCase();
  const url = config.url || config;
  const key = makeCacheKey(method, url, config.data || config.body);

  if (cacheTtl && method === "GET") {
    const cached = getCache(key);
    if (cached) return cached;
  }

  let attempt = 0;
  let lastErr = null;
  while (attempt <= retries) {
    try {
      const response = await axiosInstance(config);
      if (cacheTtl && method === "GET") setCache(key, response.data, cacheTtl);
      return response.data;
    } catch (err) {
      lastErr = err;
      attempt += 1;
      if (attempt > retries) break;
      const wait = retryDelay * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, wait));
    }
  }

  throw lastErr;
}

export { fetchWithRetry, axiosWithRetry, getCache, setCache };
