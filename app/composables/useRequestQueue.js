const requestMap = new Map();

function serialize(value) {
  if (value == null) return "";
  if (value instanceof URLSearchParams) return value.toString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function generateCacheKey(url, options = {}) {
  const method = options.method || "GET";
  return `${method}-${url}-${serialize(options.params)}-${serialize(options.body)}`;
}

export function useRequestQueue() {
  function executeRequest(url, options = {}, requestFn) {
    const cacheKey = generateCacheKey(url, options);

    if (requestMap.has(cacheKey)) {
      return requestMap.get(cacheKey);
    }

    const requestPromise = requestFn().finally(() => {
      requestMap.delete(cacheKey);
    });

    requestMap.set(cacheKey, requestPromise);
    return requestPromise;
  }

  return { executeRequest };
}
