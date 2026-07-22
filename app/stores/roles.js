import { defineStore } from "pinia";
import { useApi } from "@/composables/useApi";

function unwrap(payload) {
  return payload?.data ?? payload ?? null;
}

function companyNumericId() {
  return useCookie("nf_tenant").value?.company_id ?? null;
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

export const useRolesStore = defineStore("roles", () => {
  const { fetchApi } = useApi();

  const allItems = ref([]);
  const allLoaded = ref(false);
  const loadedCompanyId = ref(null);

  const items = ref([]);
  const meta = ref({ current_page: 1, per_page: 15, last_page: 1, total: 0 });
  const filters = ref({ search: "", is_active: null, trashed: null, per_page: 15 });
  const loading = ref(false);
  const saving = ref(false);

  const roleOptions = ref([]);
  const roleOptionsLoaded = ref(false);
  const roleOptionsCompanyId = ref(null);
  let roleOptionsPromise = null;

  const userOptions = ref([]);

  function clearRoleOptionsCache() {
    roleOptions.value = [];
    roleOptionsLoaded.value = false;
    roleOptionsCompanyId.value = null;
    roleOptionsPromise = null;
  }

  function setRoleOptionItem(role) {
    if (!role?.id) return;
    const option = {
      id: role.id,
      name: role.display_name || role.name,
      name_ar: role.name_ar,
      name_en: role.name_en,
      code: role.role_code ?? role.name,
      branch_scope: role.branch_scope ?? [],
    };
    const i = roleOptions.value.findIndex((r) => r.id === role.id);
    if (i === -1) {
      roleOptions.value = [option, ...roleOptions.value];
    } else {
      const next = [...roleOptions.value];
      next[i] = { ...next[i], ...option };
      roleOptions.value = next;
    }
  }

  function removeRoleOptionItem(id) {
    roleOptions.value = roleOptions.value.filter((r) => r.id !== id);
  }

  function ensureCompanyCache() {
    const companyId = companyNumericId();
    if (loadedCompanyId.value !== companyId) {
      allItems.value = [];
      allLoaded.value = false;
      items.value = [];
      loadedCompanyId.value = companyId;
      clearRoleOptionsCache();
      userOptions.value = [];
    }
    return companyId;
  }

  function setItem(role) {
    const i = items.value.findIndex((r) => r.id === role.id);
    if (i === -1) {
      items.value.unshift(role);
      meta.value.total += 1;
    } else {
      items.value[i] = role;
    }

    const j = allItems.value.findIndex((r) => r.id === role.id);
    if (j === -1) allItems.value.unshift(role);
    else allItems.value[j] = role;

    if (roleOptionsLoaded.value) {
      if (role.is_active === false) removeRoleOptionItem(role.id);
      else setRoleOptionItem(role);
    }
  }

  function removeItem(id) {
    items.value = items.value.filter((r) => r.id !== id);
    allItems.value = allItems.value.filter((r) => r.id !== id);
    meta.value.total = Math.max(0, meta.value.total - 1);
    if (roleOptionsLoaded.value) removeRoleOptionItem(id);
  }

  async function fetchList(page = 1, force = false) {
    const companyId = ensureCompanyCache();
    if (!companyId) {
      items.value = [];
      return { error: noCompanyError() };
    }

    const hasFilters = !!(filters.value.search || filters.value.is_active !== null || filters.value.trashed);

    if (!hasFilters && allLoaded.value && !force && page === 1) {
      items.value = allItems.value;
      return { error: null };
    }

    loading.value = true;
    try {
      const params = { page, per_page: filters.value.per_page };
      if (filters.value.search) params.search = filters.value.search;
      if (filters.value.is_active !== null && filters.value.is_active !== "") {
        params.is_active = filters.value.is_active;
      }
      if (filters.value.trashed) params.trashed = filters.value.trashed;

      const result = await fetchApi("/roles", { params });
      if (result.error) {
        items.value = [];
        return result;
      }

      const data = unwrap(result.data) || {};
      const fetched = data.items?.data || data.items || [];

      items.value = fetched;
      meta.value = data.meta || meta.value;

      if (!hasFilters && page === 1) {
        allItems.value = fetched;
        allLoaded.value = true;
      }

      return result;
    } finally {
      loading.value = false;
    }
  }

  async function fetchRoleOptions(force = false) {
    const companyId = companyNumericId();
    if (!companyId) {
      clearRoleOptionsCache();
      return { items: [], error: noCompanyError() };
    }

    if (roleOptionsCompanyId.value && roleOptionsCompanyId.value !== companyId) {
      clearRoleOptionsCache();
    }

    if (
      !force &&
      roleOptionsLoaded.value &&
      roleOptionsCompanyId.value === companyId
    ) {
      return { items: roleOptions.value, error: null };
    }

    if (!force && roleOptionsPromise) return roleOptionsPromise;

    roleOptionsPromise = (async () => {
      const result = await fetchApi("/roles/options", { silent: true });
      if (result.error) {
        return { items: [], error: result.error };
      }

      const data = unwrap(result.data);
      roleOptions.value = Array.isArray(data)
        ? data
        : data?.items?.data || data?.items || [];
      roleOptionsLoaded.value = true;
      roleOptionsCompanyId.value = companyId;

      return { items: roleOptions.value, error: null };
    })().finally(() => {
      roleOptionsPromise = null;
    });

    return roleOptionsPromise;
  }

  async function fetchOne(id) {
    const companyId = ensureCompanyCache();
    if (!companyId) return { role: null, error: noCompanyError() };

    const result = await fetchApi(`/roles/${id}`);
    const role = result.error ? null : unwrap(result.data);
    if (role) setItem(role);
    return { role, error: result.error };
  }

  async function create(payload) {
    const companyId = companyNumericId();
    if (!companyId) return { role: null, error: noCompanyError() };

    saving.value = true;
    try {
      const result = await fetchApi("/roles", {
        method: "POST",
        body: { ...payload, company_id: companyId },
      });
      const role = result.error ? null : unwrap(result.data);
      if (role) setItem(role);
      return { role, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function update(id, payload) {
    if (!companyNumericId()) return { role: null, error: noCompanyError() };

    saving.value = true;
    try {
      const result = await fetchApi(`/roles/${id}`, {
        method: "PUT",
        body: payload,
      });
      const role = result.error ? null : unwrap(result.data);
      if (role) setItem(role);
      return { role, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function destroy(id) {
    if (!companyNumericId()) return { error: noCompanyError() };

    saving.value = true;
    try {
      const result = await fetchApi(`/roles/${id}`, { method: "DELETE" });
      if (!result.error) removeItem(id);
      return { error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function restore(id) {
    if (!companyNumericId()) return { role: null, error: noCompanyError() };

    const result = await fetchApi(`/roles/${id}/restore`, { method: "PATCH" });
    const role = result.error ? null : unwrap(result.data);
    if (role) {
      if (filters.value.trashed === "only") {
        removeItem(id);
      } else {
        setItem(role);
      }
    }
    return { role, error: result.error };
  }

  async function forceDestroy(id) {
    if (!companyNumericId()) return { error: noCompanyError() };

    saving.value = true;
    try {
      const result = await fetchApi(`/roles/${id}/force`, {
        method: "DELETE",
      });
      if (!result.error) removeItem(id);
      return { error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function activate(id) {
    if (!companyNumericId()) return { role: null, error: noCompanyError() };

    const result = await fetchApi(`/roles/${id}/activate`, { method: "POST" });
    const role = result.error ? null : unwrap(result.data);
    if (role) setItem(role);
    return { role, error: result.error };
  }

  async function deactivate(id) {
    if (!companyNumericId()) return { role: null, error: noCompanyError() };

    const result = await fetchApi(`/roles/${id}/deactivate`, { method: "POST" });
    const role = result.error ? null : unwrap(result.data);
    if (role) setItem(role);
    return { role, error: result.error };
  }

  async function clone(id, payload = {}) {
    if (!companyNumericId()) return { role: null, error: noCompanyError() };

    saving.value = true;
    try {
      const result = await fetchApi(`/roles/${id}/clone`, {
        method: "POST",
        body: payload,
      });
      const role = result.error ? null : unwrap(result.data);
      if (role) setItem(role);
      return { role, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function assignPermissions(id, permissions) {
    if (!companyNumericId()) return { role: null, error: noCompanyError() };

    saving.value = true;
    try {
      const result = await fetchApi(`/roles/${id}/permissions`, {
        method: "POST",
        body: { permissions },
      });
      const role = result.error ? null : unwrap(result.data);
      if (role) setItem(role);
      return { role, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function assignUsers(id, users) {
    if (!companyNumericId()) return { role: null, error: noCompanyError() };

    saving.value = true;
    try {
      const result = await fetchApi(`/roles/${id}/users`, {
        method: "POST",
        body: { users },
      });
      const role = result.error ? null : unwrap(result.data);
      if (role) setItem(role);
      return { role, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function fetchUsage(id) {
    if (!companyNumericId()) return { usage: null, error: noCompanyError() };

    const result = await fetchApi(`/roles/${id}/usage`);
    if (result.error) return { usage: null, error: result.error };
    return { usage: unwrap(result.data), error: null };
  }

  async function fetchUserOptions(search = "") {
    if (!companyNumericId()) {
      userOptions.value = [];
      return { error: noCompanyError() };
    }

    const params = { per_page: 50 };
    if (search) params.search = search;

    const result = await fetchApi("/users", { params });
    if (result.error) {
      userOptions.value = [];
      return result;
    }

    const data = unwrap(result.data) || {};
    userOptions.value = data.items?.data || data.items || [];
    return result;
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
    roleOptions,
    userOptions,
    fetchList,
    fetchRoleOptions,
    fetchOne,
    create,
    update,
    destroy,
    restore,
    forceDestroy,
    activate,
    deactivate,
    clone,
    assignPermissions,
    assignUsers,
    fetchUsage,
    fetchUserOptions,
    setFilters,
  };
});
