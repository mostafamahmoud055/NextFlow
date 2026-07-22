import { defineStore } from "pinia";
import { useApi } from "@/composables/useApi";

function unwrap(payload) {
  return payload?.data ?? payload ?? null;
}

export const useWarehousesStore = defineStore("warehouses", () => {
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
  const filters = ref({
    search: "",
    status: null,
    type: null,
    branch_id: null,
    trashed: null,
    per_page: 15,
  });
  const loading = ref(false);
  const saving = ref(false);

  function clearOptionsCache() {
    optionsItems.value = [];
    optionsLoaded.value = false;
    optionsTenant.value = null;
    optionsPromise = null;
  }

  function setOptionItem(warehouse) {
    const i = optionsItems.value.findIndex((w) => w.id === warehouse.id);
    if (i === -1) {
      optionsItems.value = [warehouse, ...optionsItems.value];
    } else {
      const next = [...optionsItems.value];
      next[i] = warehouse;
      optionsItems.value = next;
    }
  }

  function removeOptionItem(id) {
    optionsItems.value = optionsItems.value.filter((w) => w.id !== id);
  }

  function setItem(warehouse) {
    const i = items.value.findIndex((w) => w.id === warehouse.id);
    if (i === -1) {
      items.value.unshift(warehouse);
      meta.value.total += 1;
    } else {
      items.value[i] = warehouse;
    }

    const j = allItems.value.findIndex((w) => w.id === warehouse.id);
    if (j === -1) allItems.value.unshift(warehouse);
    else allItems.value[j] = warehouse;

    if (optionsLoaded.value) setOptionItem(warehouse);
  }

  function removeItem(id) {
    items.value = items.value.filter((w) => w.id !== id);
    allItems.value = allItems.value.filter((w) => w.id !== id);
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
      filters.value.type ||
      filters.value.branch_id ||
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
      if (filters.value.type) params.type = filters.value.type;
      if (filters.value.branch_id) params.branch_id = filters.value.branch_id;
      if (filters.value.trashed) params.trashed = filters.value.trashed;

      const result = await fetchApi("/warehouses", { tenant: true, params });
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
        const result = await fetchApi("/warehouses", {
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

  async function show(id) {
    const result = await fetchApi(`/warehouses/${id}`, { tenant: true });
    const warehouse = result.error ? null : unwrap(result.data);
    if (warehouse) setItem(warehouse);
    return { warehouse, error: result.error };
  }

  async function create(payload) {
    saving.value = true;
    try {
      const result = await fetchApi("/warehouses", {
        tenant: true,
        method: "POST",
        body: payload,
      });
      const warehouse = result.error ? null : unwrap(result.data);
      if (warehouse) setItem(warehouse);
      return { warehouse, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function update(id, payload) {
    saving.value = true;
    try {
      const result = await fetchApi(`/warehouses/${id}`, {
        tenant: true,
        method: "PUT",
        body: payload,
      });
      const warehouse = result.error ? null : unwrap(result.data);
      if (warehouse) setItem(warehouse);
      return { warehouse, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function activate(id) {
    const result = await fetchApi(`/warehouses/${id}/activate`, {
      tenant: true,
      method: "PATCH",
    });
    const warehouse = result.error ? null : unwrap(result.data);
    if (warehouse) setItem(warehouse);
    return { warehouse, error: result.error };
  }

  async function deactivate(id) {
    const result = await fetchApi(`/warehouses/${id}/deactivate`, {
      tenant: true,
      method: "PATCH",
    });
    const warehouse = result.error ? null : unwrap(result.data);
    if (warehouse) setItem(warehouse);
    return { warehouse, error: result.error };
  }

  async function assignBranch(id, branchId) {
    saving.value = true;
    try {
      const result = await fetchApi(`/warehouses/${id}/assign-branch`, {
        tenant: true,
        method: "PATCH",
        body: { branch_id: branchId },
      });
      const warehouse = result.error ? null : unwrap(result.data);
      if (warehouse) setItem(warehouse);
      return { warehouse, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function assignManager(id, managerId) {
    saving.value = true;
    try {
      const result = await fetchApi(`/warehouses/${id}/assign-manager`, {
        tenant: true,
        method: "PATCH",
        body: { manager_id: managerId },
      });
      const warehouse = result.error ? null : unwrap(result.data);
      if (warehouse) setItem(warehouse);
      return { warehouse, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function destroy(id) {
    saving.value = true;
    try {
      const result = await fetchApi(`/warehouses/${id}`, {
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
    const result = await fetchApi(`/warehouses/${id}/restore`, {
      tenant: true,
      method: "PATCH",
    });
    const warehouse = result.error ? null : unwrap(result.data);
    if (warehouse) {
      if (filters.value.trashed === "only") {
        removeItem(id);
      } else {
        setItem(warehouse);
      }
    }
    return { warehouse, error: result.error };
  }

  async function forceDestroy(id) {
    saving.value = true;
    try {
      const result = await fetchApi(`/warehouses/${id}/force`, {
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
    show,
    create,
    update,
    activate,
    deactivate,
    assignBranch,
    assignManager,
    destroy,
    restore,
    forceDestroy,
    setFilters,
  };
});
