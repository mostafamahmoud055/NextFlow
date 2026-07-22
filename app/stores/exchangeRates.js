import { defineStore } from "pinia";
import { useApi } from "@/composables/useApi";

function unwrap(payload) {
  return payload?.data ?? payload ?? null;
}

function companyUuid() {
  return useCookie("nf_tenant").value?.id ?? null;
}

export const useExchangeRatesStore = defineStore("exchangeRates", () => {
  const { fetchApi } = useApi();

  const allItems = ref([]);
  const allLoaded = ref(false);
  const loadedCompany = ref(null);

  const items = ref([]);
  const meta = ref({ current_page: 1, per_page: 15, last_page: 1, total: 0 });
  const filters = ref({
    search: "",
    currency_id: null,
    rate_type: null,
    status: null,
    effective_date: null,
    as_of: null,
    trashed: null,
    per_page: 15,
  });
  const historyItems = ref([]);
  const loading = ref(false);
  const historyLoading = ref(false);
  const saving = ref(false);

  function setItem(rate) {
    const i = items.value.findIndex((item) => item.id === rate.id);
    if (i === -1) {
      items.value.unshift(rate);
      meta.value.total += 1;
    } else {
      items.value[i] = rate;
    }

    const j = allItems.value.findIndex((item) => item.id === rate.id);
    if (j === -1) allItems.value.unshift(rate);
    else allItems.value[j] = rate;
  }

  function removeItem(id) {
    items.value = items.value.filter((item) => item.id !== id);
    allItems.value = allItems.value.filter((item) => item.id !== id);
    meta.value.total = Math.max(0, meta.value.total - 1);
  }

  async function fetchList(page = 1, force = false) {
    const uuid = companyUuid();
    if (!uuid) {
      items.value = [];
      return { error: { message: "No company selected", status: 400 } };
    }

    if (loadedCompany.value && loadedCompany.value !== uuid) {
      allItems.value = [];
      allLoaded.value = false;
      loadedCompany.value = null;
    }

    const hasFilters = !!(
      filters.value.search ||
      filters.value.currency_id ||
      filters.value.rate_type ||
      filters.value.status ||
      filters.value.effective_date ||
      filters.value.as_of ||
      filters.value.trashed
    );

    if (
      !hasFilters &&
      allLoaded.value &&
      !force &&
      loadedCompany.value === uuid
    ) {
      items.value = allItems.value;
      return { error: null };
    }

    loading.value = true;
    try {
      const params = { page, per_page: filters.value.per_page };
      if (filters.value.search) params.search = filters.value.search;
      if (filters.value.currency_id) params.currency_id = filters.value.currency_id;
      if (filters.value.rate_type) params.rate_type = filters.value.rate_type;
      if (filters.value.status) params.status = filters.value.status;
      if (filters.value.effective_date) {
        params.effective_date = filters.value.effective_date;
      }
      if (filters.value.as_of) params.as_of = filters.value.as_of;
      if (filters.value.trashed) params.trashed = filters.value.trashed;

      const result = await fetchApi(`/companies/${uuid}/exchange-rates`, {
        params,
      });
      if (result.error) {
        items.value = [];
        return result;
      }

      const data = unwrap(result.data) || {};
      const fetched = data.items?.data || data.items || [];

      items.value = fetched;
      meta.value = data.meta || meta.value;

      if (!hasFilters) {
        allItems.value = fetched;
        allLoaded.value = true;
        loadedCompany.value = uuid;
      }

      return result;
    } finally {
      loading.value = false;
    }
  }

  async function fetchHistory(currencyId) {
    const uuid = companyUuid();
    if (!uuid || !currencyId) {
      historyItems.value = [];
      return { items: [], error: null };
    }

    historyLoading.value = true;
    try {
      const result = await fetchApi(
        `/companies/${uuid}/exchange-rates/history/${currencyId}`,
      );
      if (result.error) {
        historyItems.value = [];
        return { items: [], error: result.error };
      }

      const data = unwrap(result.data);
      historyItems.value = Array.isArray(data) ? data : data?.items || [];
      return { items: historyItems.value, error: null };
    } finally {
      historyLoading.value = false;
    }
  }

  async function show(id) {
    const uuid = companyUuid();
    if (!uuid) return { exchangeRate: null, error: { status: 400 } };

    const result = await fetchApi(`/companies/${uuid}/exchange-rates/${id}`);
    const exchangeRate = result.error ? null : unwrap(result.data);
    if (exchangeRate) setItem(exchangeRate);
    return { exchangeRate, error: result.error };
  }

  async function create(payload) {
    const uuid = companyUuid();
    if (!uuid) return { exchangeRate: null, error: { status: 400 } };

    saving.value = true;
    try {
      const result = await fetchApi(`/companies/${uuid}/exchange-rates`, {
        method: "POST",
        body: payload,
      });
      const exchangeRate = result.error ? null : unwrap(result.data);
      if (exchangeRate) setItem(exchangeRate);
      return { exchangeRate, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function update(id, payload) {
    const uuid = companyUuid();
    if (!uuid) return { exchangeRate: null, error: { status: 400 } };

    saving.value = true;
    try {
      const result = await fetchApi(`/companies/${uuid}/exchange-rates/${id}`, {
        method: "PUT",
        body: payload,
      });
      const exchangeRate = result.error ? null : unwrap(result.data);
      if (exchangeRate) setItem(exchangeRate);
      return { exchangeRate, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function activate(id) {
    const uuid = companyUuid();
    if (!uuid) return { exchangeRate: null, error: { status: 400 } };

    const result = await fetchApi(
      `/companies/${uuid}/exchange-rates/${id}/activate`,
      { method: "PATCH" },
    );
    const exchangeRate = result.error ? null : unwrap(result.data);
    if (exchangeRate) setItem(exchangeRate);
    return { exchangeRate, error: result.error };
  }

  async function deactivate(id) {
    const uuid = companyUuid();
    if (!uuid) return { exchangeRate: null, error: { status: 400 } };

    const result = await fetchApi(
      `/companies/${uuid}/exchange-rates/${id}/deactivate`,
      { method: "PATCH" },
    );
    const exchangeRate = result.error ? null : unwrap(result.data);
    if (exchangeRate) setItem(exchangeRate);
    return { exchangeRate, error: result.error };
  }

  async function destroy(id) {
    const uuid = companyUuid();
    if (!uuid) return { error: { status: 400 } };

    saving.value = true;
    try {
      const result = await fetchApi(`/companies/${uuid}/exchange-rates/${id}`, {
        method: "DELETE",
      });
      if (!result.error) removeItem(id);
      return { error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function restore(id) {
    const uuid = companyUuid();
    if (!uuid) return { exchangeRate: null, error: { status: 400 } };

    const result = await fetchApi(
      `/companies/${uuid}/exchange-rates/${id}/restore`,
      { method: "PATCH" },
    );
    const exchangeRate = result.error ? null : unwrap(result.data);
    if (exchangeRate) {
      if (filters.value.trashed === "only") removeItem(id);
      else setItem(exchangeRate);
    }
    return { exchangeRate, error: result.error };
  }

  function setFilters(next) {
    filters.value = { ...filters.value, ...next };
  }

  return {
    items,
    allItems,
    allLoaded,
    meta,
    filters,
    historyItems,
    loading,
    historyLoading,
    saving,
    fetchList,
    fetchHistory,
    show,
    create,
    update,
    activate,
    deactivate,
    destroy,
    restore,
    setFilters,
  };
});
