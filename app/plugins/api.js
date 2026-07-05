function toHeaderObject(headers) {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  return headers;
}

function getFrontendOrigin(requestHeaders) {
  const host = requestHeaders["x-forwarded-host"] || requestHeaders.host;
  if (!host) return null;

  const proto = requestHeaders["x-forwarded-proto"] || "http";
  return `${proto}://${host}`;
}

function getXsrfToken(cookieHeader) {
  if (!cookieHeader) return null;

  const match = cookieHeader.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function getLocaleFromCookie(cookieHeader) {
  if (!cookieHeader) return "en";

  const match = cookieHeader.match(/(?:^|;\s*)nextflow-locale=([^;]+)/);
  if (!match) return "en";

  const value = decodeURIComponent(match[1] || "").trim();
  return value || "en";
}

export default defineNuxtPlugin({
  name: "api",
  order: -20,
  setup() {
    const serverHeaders = import.meta.server ? useRequestHeaders(["cookie", "host", "x-forwarded-host", "x-forwarded-proto"]) : {};
    const serverCookie = serverHeaders.cookie || "";
    const serverOrigin = getFrontendOrigin(serverHeaders);

    const api = $fetch.create({
      credentials: "include",
      onRequest({ options }) {
        options.credentials = options.credentials ?? "include";

        options.headers = {
          Accept: "application/json",
          ...toHeaderObject(options.headers),
        };

        const cookieHeader = import.meta.server ? serverCookie : document.cookie;
        options.headers["nextflow-locale"] = getLocaleFromCookie(cookieHeader);

        if (import.meta.server) {
          if (serverCookie && !options.headers.cookie) {
            options.headers.cookie = serverCookie;
          }

          if (serverOrigin) {
            options.headers.Origin = serverOrigin;
            options.headers.Referer = serverOrigin;
          }

          const xsrfToken = getXsrfToken(serverCookie);
          if (xsrfToken) {
            options.headers["X-XSRF-TOKEN"] = xsrfToken;
          }
        }

        if (import.meta.client) {
          const xsrfToken = getXsrfToken(document.cookie);
          if (xsrfToken) {
            options.headers["X-XSRF-TOKEN"] = xsrfToken;
          }
        }
      },
    });

    return {
      provide: {
        api,
      },
    };
  },
});
