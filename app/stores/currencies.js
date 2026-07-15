import { defineStore } from "pinia";
import { useApi } from "@/composables/useApi";
import { useSnackbar } from "~/composables/useSnackbar";
import { useCompaniesStore } from "@/stores/companies";

function unwrap(payload) {
  return payload?.data ?? payload ?? null;
}

function asList(payload) {
  const data = unwrap(payload);
  if (Array.isArray(data)) return data;
  return data?.items?.data || data?.items || [];
}

function companyUuid() {
  return useCookie("nf_tenant").value?.id ?? null;
}

function noCompanyError() {
  const message = "No company selected";
  const { showSnackbar } = useSnackbar();
  showSnackbar(message, 400);
  return {
    message,
    status: 400,
    errors: { form: [message] },
  };
}

export const useCurrenciesStore = defineStore("currencies", () => {
  const { fetchApi } = useApi();
  const companies = useCompaniesStore();

  const allItems = ref([]);
  const allLoaded = ref(false);
  const loadedTenant = ref(null);

  const items = ref([]);
  const catalog = ref([]);
  const filters = ref({ search: "" });
  const loading = ref(false);
  const catalogLoading = ref(false);
  const saving = ref(false);

  const baseCurrency = computed(() => {
    const base = items.value.find((item) => item.is_base);
    return base?.currency?.code ?? null;
  });

  const filteredItems = computed(() => {
    const q = (filters.value.search || "").trim().toLowerCase();
    if (!q) return items.value;

    return items.value.filter((item) => {
      const currency = item.currency || {};
      return (
        String(currency.code || "").toLowerCase().includes(q) ||
        String(currency.name_en || "").toLowerCase().includes(q) ||
        String(currency.name_ar || "").includes(q) ||
        String(currency.symbol || "").toLowerCase().includes(q)
      );
    });
  });

  function setItem(row) {
    const i = items.value.findIndex((item) => item.id === row.id);
    if (i === -1) {
      items.value.unshift(row);
    } else {
      items.value[i] = row;
    }

    const j = allItems.value.findIndex((item) => item.id === row.id);
    if (j === -1) allItems.value.unshift(row);
    else allItems.value[j] = row;
  }

  function removeItem(id) {
    items.value = items.value.filter((item) => item.id !== id);
    allItems.value = allItems.value.filter((item) => item.id !== id);
  }

  async function fetchList(force = false) {
    const uuid = companyUuid();
    if (!uuid) {
      items.value = [];
      allItems.value = [];
      allLoaded.value = false;
      loadedTenant.value = null;
      return { error: noCompanyError() };
    }

    if (loadedTenant.value && loadedTenant.value !== uuid) {
      allItems.value = [];
      allLoaded.value = false;
      loadedTenant.value = null;
    }

    if (!force && allLoaded.value && loadedTenant.value === uuid) {
      items.value = allItems.value;
      return { error: null };
    }

    loading.value = true;
    try {
      const result = await fetchApi(`/companies/${uuid}/currencies`);
      if (result.error) {
        items.value = [];
        return result;
      }

      const fetched = asList(result.data);
      items.value = fetched;
      allItems.value = fetched;
      allLoaded.value = true;
      loadedTenant.value = uuid;
      return result;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCatalog(search = "") {
    catalogLoading.value = true;
    try {
      const params = {};
      if (search) params.search = search;

      const result = await fetchApi("/currencies", { params });
      if (result.error) {
        catalog.value = [];
        return result;
      }

      catalog.value = asList(result.data);
      return result;
    } finally {
      catalogLoading.value = false;
    }
  }

  async function attach(payload) {
    const uuid = companyUuid();
    if (!uuid) return { currency: null, error: noCompanyError() };

    saving.value = true;
    try {
      const result = await fetchApi(`/companies/${uuid}/currencies`, {
        method: "POST",
        body: payload,
      });
      const currency = result.error ? null : unwrap(result.data);
      if (currency) {
        if (currency.is_base) {
          await fetchList(true);
        } else {
          setItem(currency);
        }
      }
      return { currency, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function update(code, payload) {
    const uuid = companyUuid();
    if (!uuid) return { currency: null, error: noCompanyError() };

    saving.value = true;
    try {
      const result = await fetchApi(`/companies/${uuid}/currencies/${code}`, {
        method: "PATCH",
        body: payload,
      });
      const currency = result.error ? null : unwrap(result.data);
      if (currency) setItem(currency);
      return { currency, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function detach(code) {
    const uuid = companyUuid();
    if (!uuid) return { error: noCompanyError() };

    saving.value = true;
    try {
      const result = await fetchApi(`/companies/${uuid}/currencies/${code}`, {
        method: "DELETE",
      });
      if (!result.error) {
        const row = allItems.value.find((item) => item.currency?.code === code);
        if (row) removeItem(row.id);
      }
      return { error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function setBaseCurrency(code) {
    const uuid = companyUuid();
    if (!uuid) return { company: null, error: noCompanyError() };

    if (baseCurrency.value === code) {
      return { company: null, error: null };
    }

    saving.value = true;
    try {
      const result = await fetchApi(`/companies/${uuid}/base-currency`, {
        method: "PATCH",
        body: { base_currency: code },
      });
      const company = result.error ? null : unwrap(result.data);
      if (company) {
        companies.setItem(company);
        await fetchList(true);
      }
      return { company, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  function setFilters(next) {
    filters.value = { ...filters.value, ...next };
  }

  return {
    items,
    allItems,
    allLoaded,
    catalog,
    filters,
    loading,
    catalogLoading,
    saving,
    baseCurrency,
    filteredItems,
    fetchList,
    fetchCatalog,
    attach,
    update,
    detach,
    setBaseCurrency,
    setFilters,
  };
});
