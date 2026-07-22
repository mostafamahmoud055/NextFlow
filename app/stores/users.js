import { defineStore } from "pinia";
import { useApi } from "@/composables/useApi";
import { useSnackbar } from "~/composables/useSnackbar";

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

export const useUsersStore = defineStore("users", () => {
  const { fetchApi } = useApi();

  const allItems = ref([]);
  const allLoaded = ref(false);
  const loadedCompanyId = ref(null);

  const optionsItems = ref([]);
  const optionsLoaded = ref(false);
  const optionsCompanyId = ref(null);
  let optionsPromise = null;

  const items = ref([]);
  const meta = ref({ current_page: 1, per_page: 15, last_page: 1, total: 0 });
  const filters = ref({
    search: "",
    status: null,
    login_status: null,
    trashed: null,
    per_page: 15,
  });
  const loading = ref(false);
  const saving = ref(false);

  const activityItems = ref([]);
  const activityMeta = ref({
    current_page: 1,
    per_page: 15,
    last_page: 1,
    total: 0,
  });
  const activityLoading = ref(false);

  function clearOptionsCache() {
    optionsItems.value = [];
    optionsLoaded.value = false;
    optionsCompanyId.value = null;
    optionsPromise = null;
  }

  function setOptionItem(user) {
    const i = optionsItems.value.findIndex((u) => u.id === user.id);
    if (i === -1) {
      optionsItems.value = [user, ...optionsItems.value];
    } else {
      const next = [...optionsItems.value];
      next[i] = user;
      optionsItems.value = next;
    }
  }

  function removeOptionItem(id) {
    optionsItems.value = optionsItems.value.filter((u) => u.id !== id);
  }

  function ensureCompanyCache() {
    const companyId = companyNumericId();
    if (loadedCompanyId.value !== companyId) {
      allItems.value = [];
      allLoaded.value = false;
      items.value = [];
      loadedCompanyId.value = companyId;
      clearOptionsCache();
    }
    return companyId;
  }

  function setItem(user) {
    const i = items.value.findIndex((u) => u.id === user.id);
    if (i === -1) {
      items.value.unshift(user);
      meta.value.total += 1;
    } else {
      items.value[i] = user;
    }

    const j = allItems.value.findIndex((u) => u.id === user.id);
    if (j === -1) allItems.value.unshift(user);
    else allItems.value[j] = user;

    if (optionsLoaded.value) setOptionItem(user);
  }

  function removeItem(id) {
    items.value = items.value.filter((u) => u.id !== id);
    allItems.value = allItems.value.filter((u) => u.id !== id);
    meta.value.total = Math.max(0, meta.value.total - 1);
    if (optionsLoaded.value) removeOptionItem(id);
  }

  async function fetchList(page = 1, force = false) {
    if (!ensureCompanyCache()) {
      items.value = [];
      return { error: noCompanyError() };
    }

    const hasFilters = !!(
      filters.value.search ||
      filters.value.status ||
      filters.value.login_status ||
      filters.value.trashed
    );

    if (!hasFilters && allLoaded.value && !force && page === 1) {
      items.value = allItems.value;
      return { error: null };
    }

    loading.value = true;
    try {
      const params = { page, per_page: filters.value.per_page };
      if (filters.value.search) params.search = filters.value.search;
      if (filters.value.status) params.status = filters.value.status;
      if (filters.value.login_status) params.login_status = filters.value.login_status;
      if (filters.value.trashed) params.trashed = filters.value.trashed;

      const result = await fetchApi("/users", { params });
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

  async function fetchAll(force = false) {
    const companyId = companyNumericId();
    if (!companyId) {
      clearOptionsCache();
      return { items: [], error: noCompanyError() };
    }

    if (optionsCompanyId.value && optionsCompanyId.value !== companyId) {
      clearOptionsCache();
    }

    if (!force && optionsLoaded.value && optionsCompanyId.value === companyId) {
      return { items: optionsItems.value, error: null };
    }

    if (!force && optionsPromise) return optionsPromise;

    optionsPromise = (async () => {
      const collected = [];
      let page = 1;
      let lastPage = 1;

      do {
        const result = await fetchApi("/users", {
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
      optionsCompanyId.value = companyId;

      return { items: optionsItems.value, error: null };
    })().finally(() => {
      optionsPromise = null;
    });

    return optionsPromise;
  }

  async function fetchOne(id, options = {}) {
    const result = await fetchApi(`/users/${id}`, options);
    const user = result.error ? null : unwrap(result.data);
    if (user) setItem(user);
    return { user, error: result.error };
  }

  async function create(payload) {
    const companyId = companyNumericId();
    if (!companyId) return { user: null, error: noCompanyError() };

    saving.value = true;
    try {
      const result = await fetchApi("/users", {
        method: "POST",
        body: { ...payload, company_id: companyId },
      });
      const user = result.error ? null : unwrap(result.data);
      if (user) setItem(user);
      return { user, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function update(id, payload) {
    if (!companyNumericId()) return { user: null, error: noCompanyError() };

    saving.value = true;
    try {
      const result = await fetchApi(`/users/${id}`, {
        method: "PUT",
        body: payload,
      });
      const user = result.error ? null : unwrap(result.data);
      if (user) setItem(user);
      return { user, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function destroy(id) {
    if (!companyNumericId()) return { error: noCompanyError() };

    saving.value = true;
    try {
      const result = await fetchApi(`/users/${id}`, { method: "DELETE" });
      if (!result.error) removeItem(id);
      return { error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function restore(id) {
    if (!companyNumericId()) return { user: null, error: noCompanyError() };

    const result = await fetchApi(`/users/${id}/restore`, { method: "PATCH" });
    const user = result.error ? null : unwrap(result.data);
    if (user) {
      if (filters.value.trashed === "only") {
        removeItem(id);
      } else {
        setItem(user);
      }
    }
    return { user, error: result.error };
  }

  async function forceDestroy(id) {
    if (!companyNumericId()) return { error: noCompanyError() };

    saving.value = true;
    try {
      const result = await fetchApi(`/users/${id}/force`, {
        method: "DELETE",
      });
      if (!result.error) removeItem(id);
      return { error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function activate(id) {
    if (!companyNumericId()) return { user: null, error: noCompanyError() };

    const result = await fetchApi(`/users/${id}/activate`, { method: "POST" });
    const user = result.error ? null : unwrap(result.data);
    if (user) setItem(user);
    return { user, error: result.error };
  }

  async function deactivate(id) {
    if (!companyNumericId()) return { user: null, error: noCompanyError() };

    const result = await fetchApi(`/users/${id}/deactivate`, { method: "POST" });
    const user = result.error ? null : unwrap(result.data);
    if (user) setItem(user);
    return { user, error: result.error };
  }

  async function lock(id) {
    const result = await fetchApi(`/users/${id}/lock`, { method: "POST" });
    const user = result.error ? null : unwrap(result.data);
    if (user) setItem(user);
    return { user, error: result.error };
  }

  async function unlock(id) {
    const result = await fetchApi(`/users/${id}/unlock`, { method: "POST" });
    const user = result.error ? null : unwrap(result.data);
    if (user) setItem(user);
    return { user, error: result.error };
  }

  async function assignRoles(id, roles) {
    saving.value = true;
    try {
      const result = await fetchApi(`/users/${id}/roles`, {
        method: "POST",
        body: { roles },
      });
      const user = result.error ? null : unwrap(result.data);
      if (user) setItem(user);
      return { user, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function resetPassword(id, payload) {
    saving.value = true;
    try {
      const result = await fetchApi(`/users/${id}/reset-password`, {
        method: "POST",
        body: payload,
      });
      const user = result.error ? null : unwrap(result.data);
      if (user) setItem(user);
      return { user, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function fetchActivity(id, page = 1) {
    activityLoading.value = true;
    try {
      const result = await fetchApi(`/users/${id}/activity`, {
        params: { page, per_page: 15 },
      });
      if (result.error) {
        activityItems.value = [];
        return result;
      }

      const data = unwrap(result.data) || {};
      activityItems.value = data.items?.data || data.items || [];
      activityMeta.value = data.meta || activityMeta.value;
      return result;
    } finally {
      activityLoading.value = false;
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
    activityItems,
    activityMeta,
    activityLoading,
    fetchList,
    fetchAll,
    fetchOne,
    create,
    update,
    destroy,
    restore,
    forceDestroy,
    activate,
    deactivate,
    lock,
    unlock,
    assignRoles,
    resetPassword,
    fetchActivity,
    setFilters,
  };
});
