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
  
    const resolvedUrl = buildUrl(url, requestOptions.params);
  
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
