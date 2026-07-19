import { useRequestQueue } from "./useRequestQueue";
import { useSnackbar } from "~/composables/useSnackbar";

function toParams(params) {
  if (params instanceof URLSearchParams) return new URLSearchParams(params);
  if (typeof params === "object" && params !== null) return new URLSearchParams(params);
  return new URLSearchParams();
}

function buildUrl(url, params) {
  const query = toParams(params).toString();
  if (!query) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${query}`;
}

function serializeError(error) {
  const data = error?.data ?? null;

  const status =
    error?.statusCode ??
    error?.response?.status ??
    error?.status ??
    500;

  const message =
    data?.message ||
    error?.message ||
    "Something went wrong";

  // Always provide an errors object (so callers never need to check for missing keys)
  let errors = { form: [message] };

  if (Array.isArray(data?.errors)) {
    errors = { form: data.errors };
  } else if (data?.errors && typeof data.errors === "object") {
    errors = data.errors;
  }

  for (const [key, value] of Object.entries(errors)) {
    errors[key] = Array.isArray(value)
      ? value
      : value
        ? [String(value)]
        : [];
  }

  return {
    message,
    status,
    errors,
    data,
  };
}

function firstErrorMessage(error) {
  if (!error?.errors) {
    return error?.message;
  }

  for (const value of Object.values(error.errors)) {
    if (Array.isArray(value) && value.length) {
      return value[0];
    }

    if (typeof value === "string" && value) {
      return value;
    }
  }

  return error.message;
}

export const useApi = () => {
  const nuxtApp = useNuxtApp();
  const config = useRuntimeConfig();
  const { executeRequest } = useRequestQueue();
  const { showSnackbar } = useSnackbar();

  // Read the selected tenant straight from the cookie (not the auth store) to
  // keep a single source of truth and avoid a circular import: the auth store
  // already depends on useApi.
  const tenantCookie = useCookie("nf_tenant");

  const apiDefaults = {
    baseURL: config.public.apiBase,
    credentials: "include",
  };

  const callApi = (url, options, signal) => {
    if (!nuxtApp.$api) {
      throw new Error("API plugin not initialized");
    }

    return nuxtApp.$api(url, { ...apiDefaults, ...options, signal });
  };

  const runRequest = (fetcher, url, options) => {
    const state = reactive({
      data: null,
      error: null,
      status: "pending",
    });

    let controller = null;

    const run = async () => {
      controller?.abort();
      controller = new AbortController();

      try {
        state.status = "loading";
        state.data = await fetcher(controller.signal);
        state.error = null;
        state.status = "success";

        if (options.successMessage && !options.silent) {
          showSnackbar(options.successMessage, 200);
        }
      } catch (e) {
        if (e?.name === "AbortError") {
          return { data: state.data, error: state.error, status: state.status };
        }

        const error = serializeError(e);
        state.error = error;
        state.status = "error";

        if (!options.silent) {
          const msg = firstErrorMessage(error);
          console.error(options.server ? "Server API Error:" : "API Error:", msg);
          showSnackbar(msg, error.status);
        }
      }

      return { data: state.data, error: state.error, status: state.status };
    };

    return executeRequest(url, options, async () => ({
      ...(await run()),
      refresh: run,
    }));
  };

  const fetchApi = (url, options = {}) => {
    const requestOptions = {
      ...options,
      params: toParams(options.params),
    };

    let path = url;

    // Tenant-scoped calls are prefixed with /tenant/{uuid}. The baseURL already
    // ends with /api, so the final URL becomes /api/tenant/{uuid}/...
    if (requestOptions.tenant) {
      const tenantId = tenantCookie.value?.id;

      if (!tenantId) {
        const error = {
          message: "No company selected",
          status: 409,
          errors: { tenant: ["No company selected"] },
          data: null,
        };

        if (!requestOptions.silent) {
          showSnackbar(error.message, error.status);
        }

        return Promise.resolve({
          data: null,
          error,
          status: "error",
          refresh: () => Promise.resolve(),
        });
      }

      path = `/tenant/${tenantId}${url.startsWith("/") ? url : `/${url}`}`;
    }

    const resolvedUrl = buildUrl(path, requestOptions.params);

    // Central RBAC (roles/permissions/users) requires numeric X-Company-Id.
    // Tenant UUID stays in the cookie `id` for /tenant/{uuid}/... routes.
    const companyId = tenantCookie.value?.company_id;
    if (companyId != null && companyId !== "") {
      requestOptions.headers = {
        ...toHeaderObject(requestOptions.headers),
        "X-Company-Id": String(companyId),
      };
    }

    return runRequest(
      (signal) => callApi(resolvedUrl, requestOptions, signal),
      resolvedUrl,
      requestOptions
    );
  };
  return {
    fetchApi,
  };
};

function toHeaderObject(headers) {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  return headers;
}
