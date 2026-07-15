import { defineStore } from "pinia";
import { useApi } from "@/composables/useApi";

function unwrap(payload) {
  return payload?.data ?? payload ?? null;
}

export const useDepartmentsStore = defineStore("departments", () => {
  const { fetchApi } = useApi();

  const allItems = ref([]);
  const allLoaded = ref(false);
  const loadedTenant = ref(null);

  const items = ref([]);
  const treeItems = ref([]);
  const meta = ref({ current_page: 1, per_page: 15, last_page: 1, total: 0 });
  const filters = ref({
    search: "",
    status: null,
    branch_id: null,
    parent_id: null,
    per_page: 15,
  });
  const loading = ref(false);
  const treeLoading = ref(false);
  const saving = ref(false);

  function setItem(department) {
    const i = items.value.findIndex((d) => d.id === department.id);
    if (i === -1) {
      items.value.unshift(department);
      meta.value.total += 1;
    } else {
      items.value[i] = department;
    }

    const j = allItems.value.findIndex((d) => d.id === department.id);
    if (j === -1) allItems.value.unshift(department);
    else allItems.value[j] = department;
  }

  function removeItem(id) {
    items.value = items.value.filter((d) => d.id !== id);
    allItems.value = allItems.value.filter((d) => d.id !== id);
    meta.value.total = Math.max(0, meta.value.total - 1);
  }

  async function fetchList(page = 1, force = false) {
    const tenantId = useCookie("nf_tenant").value?.id ?? null;
    if (loadedTenant.value && loadedTenant.value !== tenantId) {
      allItems.value = [];
      allLoaded.value = false;
      loadedTenant.value = null;
      treeItems.value = [];
    }

    const hasFilters = !!(
      filters.value.search ||
      filters.value.status ||
      filters.value.branch_id ||
      filters.value.parent_id
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
      if (filters.value.branch_id) params.branch_id = filters.value.branch_id;
      if (filters.value.parent_id) params.parent_id = filters.value.parent_id;

      const result = await fetchApi("/departments", { tenant: true, params });
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

  async function fetchTree(forceFilters = null) {
    treeLoading.value = true;
    try {
      const source = forceFilters || filters.value;
      const params = {};
      if (source.search) params.search = source.search;
      if (source.status) params.status = source.status;
      if (source.branch_id) params.branch_id = source.branch_id;

      const result = await fetchApi("/departments/tree", { tenant: true, params });
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
    const result = await fetchApi(`/departments/${id}`, { tenant: true });
    const department = result.error ? null : unwrap(result.data);
    if (department) setItem(department);
    return { department, error: result.error };
  }

  async function create(payload) {
    saving.value = true;
    try {
      const result = await fetchApi("/departments", {
        tenant: true,
        method: "POST",
        body: payload,
      });
      const department = result.error ? null : unwrap(result.data);
      if (department) setItem(department);
      return { department, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function update(id, payload) {
    saving.value = true;
    try {
      const result = await fetchApi(`/departments/${id}`, {
        tenant: true,
        method: "PUT",
        body: payload,
      });
      const department = result.error ? null : unwrap(result.data);
      if (department) setItem(department);
      return { department, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function activate(id) {
    const result = await fetchApi(`/departments/${id}/activate`, {
      tenant: true,
      method: "PATCH",
    });
    const department = result.error ? null : unwrap(result.data);
    if (department) setItem(department);
    return { department, error: result.error };
  }

  async function deactivate(id) {
    const result = await fetchApi(`/departments/${id}/deactivate`, {
      tenant: true,
      method: "PATCH",
    });
    const department = result.error ? null : unwrap(result.data);
    if (department) setItem(department);
    return { department, error: result.error };
  }

  async function destroy(id) {
    saving.value = true;
    try {
      const result = await fetchApi(`/departments/${id}`, {
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
    treeItems,
    meta,
    filters,
    loading,
    treeLoading,
    saving,
    fetchList,
    fetchTree,
    show,
    create,
    update,
    activate,
    deactivate,
    destroy,
    setFilters,
  };
});
