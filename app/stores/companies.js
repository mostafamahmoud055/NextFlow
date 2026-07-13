import { defineStore } from "pinia";
import { useApi } from "@/composables/useApi";
import { useAuthStore } from "@/stores/auth";

function unwrap(payload) {
  return payload?.data ?? payload ?? null;
}

function toBody(payload, logoFile = null) {
  if (!logoFile) return payload;

  const body = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value != null && value !== "") body.append(key, value);
  });
  body.append("logo", logoFile);
  return body;
}

export const useCompaniesStore = defineStore("companies", () => {
  const { fetchApi } = useApi();
  const auth = useAuthStore();

  const allItems = ref([]);
  const allLoaded = ref(false);

  const items = ref([]);
  const meta = ref({ current_page: 1, per_page: 15, last_page: 1, total: 0 });
  const filters = ref({ search: "", status: null, per_page: 15 });
  const loading = ref(false);
  const saving = ref(false);

  function setItem(company) {
    const i = items.value.findIndex((c) => c.uuid === company.uuid);
    if (i === -1) {
      items.value.unshift(company);
      meta.value.total += 1;
    } else {
      items.value[i] = company;
    }

    const j = allItems.value.findIndex((c) => c.uuid === company.uuid);
    if (j === -1) allItems.value.unshift(company);
    else allItems.value[j] = company;

    auth.upsertCompany(company);
  }

  function removeItem(uuid) {
    items.value = items.value.filter((c) => c.uuid !== uuid);
    allItems.value = allItems.value.filter((c) => c.uuid !== uuid);
    meta.value.total = Math.max(0, meta.value.total - 1);
    auth.removeCompany(uuid);
  }

  async function fetchList(page = 1, force = false) {
    const hasFilters = !!(filters.value.search || filters.value.status);

    if (!hasFilters && allLoaded.value && !force) {
      items.value = allItems.value;
      return { error: null };
    }

    loading.value = true;
    try {
      const params = { page, per_page: filters.value.per_page };
      if (filters.value.search) params.search = filters.value.search;
      if (filters.value.status) params.status = filters.value.status;

      const result = await fetchApi("/companies", { params });
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
      }

      return result;
    } finally {
      loading.value = false;
    }
  }

  async function create(payload, logoFile = null) {
    saving.value = true;
    try {
      const result = await fetchApi("/companies", {
        method: "POST",
        body: toBody(payload, logoFile),
      });
      const company = result.error ? null : unwrap(result.data);
      if (company) setItem(company);
      return { company, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function update(uuid, payload, logoFile = null) {
    saving.value = true;
    try {
      const result = await fetchApi(`/companies/${uuid}`, {
        method: "PATCH",
        body: toBody(payload, logoFile),
      });
      const company = result.error ? null : unwrap(result.data);
      if (company) setItem(company);
      return { company, error: result.error };
    } finally {
      saving.value = false;
    }
  }

  async function activate(uuid) {
    const result = await fetchApi(`/companies/${uuid}/activate`, { method: "PATCH" });
    const company = result.error ? null : unwrap(result.data);
    if (company) setItem(company);
    return { company, error: result.error };
  }

  async function deactivate(uuid) {
    const result = await fetchApi(`/companies/${uuid}/deactivate`, { method: "PATCH" });
    const company = result.error ? null : unwrap(result.data);
    if (company) setItem(company);
    return { company, error: result.error };
  }

  async function destroy(uuid) {
    saving.value = true;
    try {
      const result = await fetchApi(`/companies/${uuid}`, { method: "DELETE" });
      if (!result.error) removeItem(uuid);
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
    setItem,
    fetchList,
    create,
    update,
    activate,
    deactivate,
    destroy,
    setFilters,
  };
});
