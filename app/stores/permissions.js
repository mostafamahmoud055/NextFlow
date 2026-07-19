import { defineStore } from "pinia";
import { useApi } from "@/composables/useApi";
import { permissionKey } from "@/utils/permissionConstants";

function unwrap(payload) {
  return payload?.data ?? payload ?? null;
}

function collectKeysFromGroups(groups) {
  const keys = [];
  for (const perms of Object.values(groups || {})) {
    for (const permission of perms || []) {
      const key = permissionKey(permission);
      if (key) keys.push(key);
    }
  }
  return keys;
}

export const usePermissionsStore = defineStore("permissions", () => {
  const { fetchApi } = useApi();

  const allItems = ref([]);
  const allLoaded = ref(false);
  const listCacheKey = ref("");
  const loadedCompanyId = ref(null);

  const items = ref([]);
  const groups = ref({});
  const groupsLoaded = ref(false);
  const groupsCacheKey = ref("");
  const inactiveKeys = ref([]);
  const inactiveLoaded = ref(false);
  const meta = ref({ current_page: 1, per_page: 15, last_page: 1, total: 0 });
  const filters = ref({
    search: "",
    module: null,
    action_type: null,
    is_active: null,
    per_page: 15,
  });
  const loading = ref(false);
  const saving = ref(false);

  let inactivePromise = null;

  function companyNumericId() {
    return useCookie("nf_tenant").value?.company_id ?? null;
  }

  function ensureCompanyCache() {
    const companyId = companyNumericId();
    if (loadedCompanyId.value !== companyId) {
      allItems.value = [];
      allLoaded.value = false;
      listCacheKey.value = "";
      items.value = [];
      groups.value = {};
      groupsLoaded.value = false;
      groupsCacheKey.value = "";
      inactiveKeys.value = [];
      inactiveLoaded.value = false;
      inactivePromise = null;
      loadedCompanyId.value = companyId;
    }
    return companyId;
  }

  function markInactive(permission) {
    const key = permissionKey(permission);
    if (!key) return;
    if (!inactiveKeys.value.includes(key)) {
      inactiveKeys.value = [...inactiveKeys.value, key];
    }
  }

  function markActive(permission) {
    const key = permissionKey(permission);
    if (!key) return;
    inactiveKeys.value = inactiveKeys.value.filter((item) => item !== key);
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

  function resolveListFilters() {
    return {
      search: filters.value.search || "",
      module: filters.value.module || null,
      action_type: filters.value.action_type || null,
      is_active:
        filters.value.is_active !== null && filters.value.is_active !== ""
          ? filters.value.is_active
          : null,
      per_page: filters.value.per_page,
    };
  }

  function listKey(page) {
    return JSON.stringify({ page, ...resolveListFilters() });
  }

  function resolveGroupFilters(override = null) {
    if (override) {
      return {
        module: override.module || null,
        is_active:
          override.is_active !== null && override.is_active !== undefined
            ? override.is_active
            : null,
      };
    }

    return {
      module: filters.value.module || null,
      is_active:
        filters.value.is_active !== null && filters.value.is_active !== ""
          ? filters.value.is_active
          : null,
    };
  }

  function groupsKey(override = null) {
    return JSON.stringify(resolveGroupFilters(override));
  }

  function invalidateList() {
    allLoaded.value = false;
    listCacheKey.value = "";
  }

  function invalidateGroups() {
    groupsLoaded.value = false;
    groupsCacheKey.value = "";
  }

  function setItem(permission) {
    const i = items.value.findIndex((p) => p.id === permission.id);
    if (i === -1) {
      items.value.unshift(permission);
      meta.value.total += 1;
    } else {
      items.value[i] = permission;
    }

    const j = allItems.value.findIndex((p) => p.id === permission.id);
    if (j === -1) allItems.value.unshift(permission);
    else allItems.value[j] = permission;
  }

  async function fetchList(page = 1, force = false) {
    if (!ensureCompanyCache()) {
      items.value = [];
      return { error: noCompanyError() };
    }

    const key = listKey(page);

    if (!force && allLoaded.value && listCacheKey.value === key) {
      return { error: null };
    }

    loading.value = true;
    try {
      const resolved = resolveListFilters();
      const params = { page, per_page: resolved.per_page };
      if (resolved.search) params.search = resolved.search;
      if (resolved.module) params.module = resolved.module;
      if (resolved.action_type) params.action_type = resolved.action_type;
      if (resolved.is_active !== null) params.is_active = resolved.is_active;

      const result = await fetchApi("/permissions", { params });
      if (result.error) {
        items.value = [];
        invalidateList();
        return result;
      }

      const data = unwrap(result.data) || {};
      const fetched = data.items?.data || data.items || [];

      items.value = fetched;
      meta.value = {
        current_page: Number(data.meta?.current_page) || page,
        per_page: Number(data.meta?.per_page) || resolved.per_page,
        last_page: Number(data.meta?.last_page) || 1,
        total: Number(data.meta?.total) || fetched.length,
      };

      allItems.value = fetched;
      allLoaded.value = true;
      listCacheKey.value = key;

      return result;
    } finally {
      loading.value = false;
    }
  }

  async function fetchGrouped(force = false, filterOverride = null) {
    if (!ensureCompanyCache()) {
      groups.value = {};
      return { error: noCompanyError() };
    }

    const resolved = resolveGroupFilters(filterOverride);
    const key = groupsKey(filterOverride);

    if (!force && groupsLoaded.value && groupsCacheKey.value === key) {
      return { error: null };
    }

    loading.value = true;
    try {
      const body = {};
      if (resolved.module) body.module = resolved.module;
      if (resolved.is_active !== null && resolved.is_active !== "") {
        body.is_active = resolved.is_active;
      }

      const result = await fetchApi("/permissions/group", {
        method: "POST",
        body,
      });
      if (result.error) {
        groups.value = {};
        invalidateGroups();
        return result;
      }

      const data = unwrap(result.data) || {};
      groups.value = data.groups || {};
      groupsLoaded.value = true;
      groupsCacheKey.value = key;
      return result;
    } finally {
      loading.value = false;
    }
  }

  async function fetchInactiveKeys(force = false) {
    if (!ensureCompanyCache()) {
      inactiveKeys.value = [];
      inactiveLoaded.value = true;
      return { error: null };
    }

    if (!force && inactiveLoaded.value) {
      return { error: null };
    }

    if (!force && inactivePromise) return inactivePromise;

    inactivePromise = (async () => {
      const result = await fetchApi("/permissions/group", {
        method: "POST",
        body: { is_active: false },
        silent: true,
      });

      if (result.error) {
        inactiveLoaded.value = false;
        return result;
      }

      const data = unwrap(result.data) || {};
      inactiveKeys.value = collectKeysFromGroups(data.groups || {});
      inactiveLoaded.value = true;
      return result;
    })().finally(() => {
      inactivePromise = null;
    });

    return inactivePromise;
  }

  async function activate(id) {
    if (!companyNumericId()) return { permission: null, error: noCompanyError() };

    const result = await fetchApi(`/permissions/${id}/activate`, {
      method: "POST",
    });
    const permission = result.error ? null : unwrap(result.data);
    if (permission) {
      setItem(permission);
      markActive(permission);
      invalidateGroups();
    }
    return { permission, error: result.error };
  }

  async function deactivate(id) {
    if (!companyNumericId()) return { permission: null, error: noCompanyError() };

    const result = await fetchApi(`/permissions/${id}/deactivate`, {
      method: "POST",
    });
    const permission = result.error ? null : unwrap(result.data);
    if (permission) {
      setItem(permission);
      markInactive(permission);
      invalidateGroups();
    }
    return { permission, error: result.error };
  }

  async function fetchUsage(id) {
    if (!companyNumericId()) return { usage: null, error: noCompanyError() };

    const result = await fetchApi(`/permissions/${id}/usage`);
    if (result.error) return { usage: null, error: result.error };
    return { usage: unwrap(result.data), error: null };
  }

  async function assignToRole(id, roleId) {
    if (!companyNumericId()) return { role: null, error: noCompanyError() };

    saving.value = true;
    try {
      const result = await fetchApi(`/permissions/${id}/assign-role`, {
        method: "POST",
        body: { role_id: roleId },
      });
      const role = result.error ? null : unwrap(result.data);
      return { role, error: result.error };
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
    groups,
    groupsLoaded,
    inactiveKeys,
    inactiveLoaded,
    meta,
    filters,
    loading,
    saving,
    fetchList,
    fetchGrouped,
    fetchInactiveKeys,
    activate,
    deactivate,
    fetchUsage,
    assignToRole,
    setFilters,
  };
});
