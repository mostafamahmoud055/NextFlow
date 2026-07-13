import { defineStore } from "pinia";
import { useApi } from "@/composables/useApi";

function unwrap(payload) {
  return payload?.data ?? payload ?? null;
}

export const useFiscalYearsStore = defineStore("fiscalYears", () => {
  const { fetchApi } = useApi();

  const allItems = ref([]);
  const allLoaded = ref(false);
  const loadedTenant = ref(null);

  const items = ref([]);
  const meta = ref({ current_page: 1, per_page: 15, last_page: 1, total: 0 });
  const filters = ref({ search: "", status: null, is_default: null, per_page: 15 });
  const loading = ref(false);
  const saving = ref(false);

  function clearDefaultFlags(exceptId = null) {
    items.value = items.value.map((item) =>
      item.id === exceptId ? item : { ...item, is_default: false },
    );
    allItems.value = allItems.value.map((item) =>
      item.id === exceptId ? item : { ...item, is_default: false },
    );
  }

  function setItem(fiscalYear) {
    const i = items.value.findIndex((item) => item.id === fiscalYear.id);
    if (i === -1) {
      items.value.unshift(fiscalYear);
      meta.value.total += 1;
    } else {
      items.value[i] = fiscalYear;
    }

    const j = allItems.value.findIndex((item) => item.id === fiscalYear.id);
    if (j === -1) allItems.value.unshift(fiscalYear);
    else allItems.value[j] = fiscalYear;
  }

  function removeItem(id) {
    items.value = items.value.filter((item) => item.id !== id);
    allItems.value = allItems.value.filter((item) => item.id !== id);
    meta.value.total = Math.max(0, meta.value.total - 1);
  }

  async function fetchList(page = 1, force = false) {
    const tenantId = useCookie("nf_tenant").value?.id ?? null;
    if (loadedTenant.value && loadedTenant.value !== tenantId) {
      allItems.value = [];
      allLoaded.value = false;
      loadedTenant.value = null;
    }

    const hasFilters = !!(
      filters.value.search ||
      filters.value.status ||
      (filters.value.is_default !== null && filters.value.is_default !== "")
    );

    if (!hasFilters && allLoaded.value && !force && loadedTenant.value === tenantId) {
      items.value = allItems.value;
      return { error: null };
    }

    loading.value = true;
    try {
      const params = { page, per_page: filters.value.per_page };
      if (filters.value.search) params.search = filters.value.search;
      if (filters.value.status) params.status = filters.value.status;
      if (filters.value.is_default !== null && filters.value.is_default !== "") {
        params.is_default = filters.value.is_default;
      }

      const result = await fetchApi("/fiscal-years", { tenant: true, params });
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
        loadedTenant.value = tenantId;
      }

      return result;
    } finally {
      loading.value = false;
    }
  }

  async function create(payload) {
    saving.value = true;
    try {
      const result = await fetchApi("/fiscal-years", {
        tenant: true,
        method: "POST",
        body: payload,
      });
      const fiscalYear = result.error ? null : unwrap(result.data);
      if (fiscalYear) {
        if (fiscalYear.is_default) clearDefaultFlags(fiscalYear.id);
        setItem(fiscalYear);
      }
      return { fiscalYear, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function update(id, payload) {
    saving.value = true;
    try {
      const result = await fetchApi(`/fiscal-years/${id}`, {
        tenant: true,
        method: "PUT",
        body: payload,
      });
      const fiscalYear = result.error ? null : unwrap(result.data);
      if (fiscalYear) {
        if (fiscalYear.is_default) clearDefaultFlags(fiscalYear.id);
        setItem(fiscalYear);
      }
      return { fiscalYear, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function open(id) {
    const result = await fetchApi(`/fiscal-years/${id}/open`, {
      tenant: true,
      method: "PATCH",
    });
    const fiscalYear = result.error ? null : unwrap(result.data);
    if (fiscalYear) setItem(fiscalYear);
    return { fiscalYear, error: result.error };
  }

  async function close(id) {
    const result = await fetchApi(`/fiscal-years/${id}/close`, {
      tenant: true,
      method: "PATCH",
    });
    const fiscalYear = result.error ? null : unwrap(result.data);
    if (fiscalYear) setItem(fiscalYear);
    return { fiscalYear, error: result.error };
  }

  async function archive(id) {
    const result = await fetchApi(`/fiscal-years/${id}/archive`, {
      tenant: true,
      method: "PATCH",
    });
    const fiscalYear = result.error ? null : unwrap(result.data);
    if (fiscalYear) setItem(fiscalYear);
    return { fiscalYear, error: result.error };
  }

  async function setDefault(id) {
    const result = await fetchApi(`/fiscal-years/${id}/set-default`, {
      tenant: true,
      method: "PATCH",
    });
    const fiscalYear = result.error ? null : unwrap(result.data);
    if (fiscalYear) {
      clearDefaultFlags(fiscalYear.id);
      setItem(fiscalYear);
    }
    return { fiscalYear, error: result.error };
  }

  async function destroy(id) {
    saving.value = true;
    try {
      const result = await fetchApi(`/fiscal-years/${id}`, {
        tenant: true,
        method: "DELETE",
      });
      if (!result.error) removeItem(id);
      return { error: result.error };
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
    meta,
    filters,
    loading,
    saving,
    fetchList,
    create,
    update,
    open,
    close,
    archive,
    setDefault,
    destroy,
    setFilters,
  };
});
