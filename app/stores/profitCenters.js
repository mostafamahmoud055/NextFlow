import { defineStore } from "pinia";
import { useApi } from "@/composables/useApi";

function unwrap(payload) {
  return payload?.data ?? payload ?? null;
}

export const useProfitCentersStore = defineStore("profitCenters", () => {
  const { fetchApi } = useApi();

  const allItems = ref([]);
  const allLoaded = ref(false);
  const loadedTenant = ref(null);

  const optionsItems = ref([]);
  const optionsLoaded = ref(false);
  const optionsTenant = ref(null);
  let optionsPromise = null;

  const items = ref([]);
  const treeItems = ref([]);
  const meta = ref({ current_page: 1, per_page: 15, last_page: 1, total: 0 });
  const filters = ref({
    search: "",
    status: null,
    branch_id: null,
    department_id: null,
    product_category_id: null,
    parent_id: null,
    trashed: null,
    per_page: 15,
  });
  const loading = ref(false);
  const treeLoading = ref(false);
  const saving = ref(false);

  function clearOptionsCache() {
    optionsItems.value = [];
    optionsLoaded.value = false;
    optionsTenant.value = null;
    optionsPromise = null;
  }

  function setOptionItem(profitCenter) {
    const i = optionsItems.value.findIndex((p) => p.id === profitCenter.id);
    if (i === -1) {
      optionsItems.value = [profitCenter, ...optionsItems.value];
    } else {
      const next = [...optionsItems.value];
      next[i] = profitCenter;
      optionsItems.value = next;
    }
  }

  function removeOptionItem(id) {
    optionsItems.value = optionsItems.value.filter((p) => p.id !== id);
  }

  function setItem(profitCenter) {
    const i = items.value.findIndex((p) => p.id === profitCenter.id);
    if (i === -1) {
      items.value.unshift(profitCenter);
      meta.value.total += 1;
    } else {
      items.value[i] = profitCenter;
    }

    const j = allItems.value.findIndex((p) => p.id === profitCenter.id);
    if (j === -1) allItems.value.unshift(profitCenter);
    else allItems.value[j] = profitCenter;

    if (optionsLoaded.value) setOptionItem(profitCenter);
  }

  function removeItem(id) {
    items.value = items.value.filter((p) => p.id !== id);
    allItems.value = allItems.value.filter((p) => p.id !== id);
    meta.value.total = Math.max(0, meta.value.total - 1);
    if (optionsLoaded.value) removeOptionItem(id);
  }

  async function fetchList(page = 1, force = false) {
    const tenantId = useCookie("nf_tenant").value?.id ?? null;
    if (loadedTenant.value && loadedTenant.value !== tenantId) {
      allItems.value = [];
      allLoaded.value = false;
      loadedTenant.value = null;
      treeItems.value = [];
      clearOptionsCache();
    }

    const hasFilters = !!(
      filters.value.search ||
      filters.value.status ||
      filters.value.branch_id ||
      filters.value.department_id ||
      filters.value.product_category_id ||
      filters.value.parent_id ||
      filters.value.trashed
    );

    if (
      !hasFilters &&
      allLoaded.value &&
      !force &&
      loadedTenant.value === tenantId
    ) {
      items.value = allItems.value;
      return { error: null };
    }

    loading.value = true;
    try {
      const params = { page, per_page: filters.value.per_page };
      if (filters.value.search) params.search = filters.value.search;
      if (filters.value.status) params.status = filters.value.status;
      if (filters.value.branch_id) params.branch_id = filters.value.branch_id;
      if (filters.value.department_id) {
        params.department_id = filters.value.department_id;
      }
      if (filters.value.product_category_id) {
        params.product_category_id = filters.value.product_category_id;
      }
      if (filters.value.parent_id) params.parent_id = filters.value.parent_id;
      if (filters.value.trashed) params.trashed = filters.value.trashed;

      const result = await fetchApi("/profit-centers", { tenant: true, params });
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
        const result = await fetchApi("/profit-centers", {
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

  async function fetchTree(forceFilters = null) {
    treeLoading.value = true;
    try {
      const source = forceFilters || filters.value;
      const params = {};
      if (source.search) params.search = source.search;
      if (source.status) params.status = source.status;
      if (source.branch_id) params.branch_id = source.branch_id;
      if (source.department_id) params.department_id = source.department_id;
      if (source.product_category_id) {
        params.product_category_id = source.product_category_id;
      }

      const result = await fetchApi("/profit-centers/tree", {
        tenant: true,
        params,
      });
      if (result.error) {
        treeItems.value = [];
        return result;
      }

      const data = unwrap(result.data) || {};
      treeItems.value = data.items || [];
      return result;
    } finally {
      treeLoading.value = false;
    }
  }

  async function show(id) {
    const result = await fetchApi(`/profit-centers/${id}`, { tenant: true });
    const profitCenter = result.error ? null : unwrap(result.data);
    if (profitCenter) setItem(profitCenter);
    return { profitCenter, error: result.error };
  }

  async function create(payload) {
    saving.value = true;
    try {
      const result = await fetchApi("/profit-centers", {
        tenant: true,
        method: "POST",
        body: payload,
      });
      const profitCenter = result.error ? null : unwrap(result.data);
      if (profitCenter) setItem(profitCenter);
      return { profitCenter, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function update(id, payload) {
    saving.value = true;
    try {
      const result = await fetchApi(`/profit-centers/${id}`, {
        tenant: true,
        method: "PUT",
        body: payload,
      });
      const profitCenter = result.error ? null : unwrap(result.data);
      if (profitCenter) setItem(profitCenter);
      return { profitCenter, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function activate(id) {
    const result = await fetchApi(`/profit-centers/${id}/activate`, {
      tenant: true,
      method: "PATCH",
    });
    const profitCenter = result.error ? null : unwrap(result.data);
    if (profitCenter) setItem(profitCenter);
    return { profitCenter, error: result.error };
  }

  async function deactivate(id) {
    const result = await fetchApi(`/profit-centers/${id}/deactivate`, {
      tenant: true,
      method: "PATCH",
    });
    const profitCenter = result.error ? null : unwrap(result.data);
    if (profitCenter) setItem(profitCenter);
    return { profitCenter, error: result.error };
  }

  async function destroy(id) {
    saving.value = true;
    try {
      const result = await fetchApi(`/profit-centers/${id}`, {
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
    const result = await fetchApi(`/profit-centers/${id}/restore`, {
      tenant: true,
      method: "PATCH",
    });
    const profitCenter = result.error ? null : unwrap(result.data);
    if (profitCenter) {
      if (filters.value.trashed === "only") {
        removeItem(id);
      } else {
        setItem(profitCenter);
      }
    }
    return { profitCenter, error: result.error };
  }

  async function forceDestroy(id) {
    saving.value = true;
    try {
      const result = await fetchApi(`/profit-centers/${id}/force`, {
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
    treeItems,
    meta,
    filters,
    loading,
    treeLoading,
    saving,
    fetchList,
    fetchAll,
    fetchTree,
    show,
    create,
    update,
    activate,
    deactivate,
    destroy,
    restore,
    forceDestroy,
    setFilters,
  };
});
