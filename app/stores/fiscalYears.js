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

  const optionsItems = ref([]);
  const optionsLoaded = ref(false);
  const optionsTenant = ref(null);
  let optionsPromise = null;

  const items = ref([]);
  const meta = ref({ current_page: 1, per_page: 15, last_page: 1, total: 0 });
  const filters = ref({ search: "", status: null, is_default: null, trashed: null, per_page: 15 });
  const loading = ref(false);
  const saving = ref(false);

  function clearOptionsCache() {
    optionsItems.value = [];
    optionsLoaded.value = false;
    optionsTenant.value = null;
    optionsPromise = null;
  }

  function setOptionItem(fiscalYear) {
    const i = optionsItems.value.findIndex((item) => item.id === fiscalYear.id);
    if (i === -1) {
      optionsItems.value = [fiscalYear, ...optionsItems.value];
    } else {
      const next = [...optionsItems.value];
      next[i] = fiscalYear;
      optionsItems.value = next;
    }
  }

  function removeOptionItem(id) {
    optionsItems.value = optionsItems.value.filter((item) => item.id !== id);
  }

  function clearDefaultFlags(exceptId = null) {
    items.value = items.value.map((item) =>
      item.id === exceptId ? item : { ...item, is_default: false },
    );
    allItems.value = allItems.value.map((item) =>
      item.id === exceptId ? item : { ...item, is_default: false },
    );
    if (optionsLoaded.value) {
      optionsItems.value = optionsItems.value.map((item) =>
        item.id === exceptId ? item : { ...item, is_default: false },
      );
    }
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

    if (optionsLoaded.value) setOptionItem(fiscalYear);
  }

  function removeItem(id) {
    items.value = items.value.filter((item) => item.id !== id);
    allItems.value = allItems.value.filter((item) => item.id !== id);
    meta.value.total = Math.max(0, meta.value.total - 1);
    if (optionsLoaded.value) removeOptionItem(id);
  }

  async function fetchList(page = 1, force = false) {
    const tenantId = useCookie("nf_tenant").value?.id ?? null;
    if (loadedTenant.value && loadedTenant.value !== tenantId) {
      allItems.value = [];
      allLoaded.value = false;
      loadedTenant.value = null;
      clearOptionsCache();
    }

    const hasFilters = !!(
      filters.value.search ||
      filters.value.status ||
      (filters.value.is_default !== null && filters.value.is_default !== "") ||
      filters.value.trashed
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
      if (filters.value.trashed) params.trashed = filters.value.trashed;

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

  async function fetchAll(force = false) {
    const tenantId = useCookie("nf_tenant").value?.id ?? null;

    if (optionsTenant.value && optionsTenant.value !== tenantId) {
      clearOptionsCache();
    }

    if (!force && optionsLoaded.value && optionsTenant.value === tenantId) {
      return { items: optionsItems.value, error: null };
    }

    if (!force && optionsPromise) return optionsPromise;

    optionsPromise = (async () => {
      const collected = [];
      let page = 1;
      let lastPage = 1;

      do {
        const result = await fetchApi("/fiscal-years", {
          tenant: true,
          params: { page, per_page: '*' },
          silent: true,
        });

        if (result.error) {
          return { items: [], error: result.error };
        }

        const data = unwrap(result.data) || {};
        const fetched = data.items?.data || data.items || [];
        collected.push(...fetched);
        lastPage = Number(data.meta?.last_page) || 1;
        page += 1;
      } while (page <= lastPage);

      optionsItems.value = collected;
      optionsLoaded.value = true;
      optionsTenant.value = tenantId;

      return { items: optionsItems.value, error: null };
    })().finally(() => {
      optionsPromise = null;
    });

    return optionsPromise;
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

  async function restore(id) {
    const result = await fetchApi(`/fiscal-years/${id}/restore`, {
      tenant: true,
      method: "PATCH",
    });
    const fiscalYear = result.error ? null : unwrap(result.data);
    if (fiscalYear) {
      if (filters.value.trashed === "only") {
        removeItem(id);
      } else {
        setItem(fiscalYear);
      }
    }
    return { fiscalYear, error: result.error };
  }

  async function forceDestroy(id) {
    saving.value = true;
    try {
      const result = await fetchApi(`/fiscal-years/${id}/force`, {
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
    optionsItems,
    optionsLoaded,
    meta,
    filters,
    loading,
    saving,
    fetchList,
    fetchAll,
    create,
    update,
    open,
    close,
    archive,
    setDefault,
    destroy,
    restore,
    forceDestroy,
    setFilters,
  };
});
