import { defineStore } from "pinia";
import { useApi } from "@/composables/useApi";
import { normalizeCompanyForm } from "@/utils/setupCompany";
import { SETUP_STEP_ENDPOINTS, SETUP_STEP_METHODS } from "@/utils/setupSteps";

function unwrapData(payload) {
  return payload?.data ?? payload ?? {};
}

export const useSetupStore = defineStore("setup", () => {
  const { fetchApi } = useApi();

  const state = ref(null);
  const company = ref(null);
  const overview = ref(null);
  const branches = ref([]);
  const loading = ref(false);
  const saving = ref(false);
  const drafts = ref({});

  let statePromise = null;
  const currentStep = computed(() => state.value?.current_step || "company");
  const completedSteps = computed(() => state.value?.completed_steps ?? []);
  const isCompleted = computed(() => Boolean(state.value?.completed));

  /* --------------------------------------
   * STATE
   * ------------------------------------ */

  async function fetchState() {
    loading.value = true;

    try {
      const result = await fetchApi("/setup/state", {
        tenant: true,
        silent: true,
      });

      state.value = unwrapData(result.data);
      // Replace drafts with server truth to avoid stale client data.
      drafts.value = state.value?.drafts ?? {};
      return result;
    } finally {
      loading.value = false;
    }
  }

  /* --------------------------------------
   * COMPANY
   * ------------------------------------ */

  async function fetchCompany() {
    const auth = useAuthStore();
    const companyId = auth.tenantId;

    if (!companyId) {
      return { error: { message: "Missing tenant id" } };
    }

    const result = await fetchApi(`/companies/${companyId}`, {
      silent: true,
    });

    if (!result.error) {
      const raw = unwrapData(result.data);
      company.value = normalizeCompanyForm(raw?.company ?? raw);
    }

    return result;
  }

  function setCompanyFromApi(data) {
    company.value = normalizeCompanyForm(data);
  }

  /* --------------------------------------
   * STEP ACTIONS
   * ------------------------------------ */

  async function saveStep(step, body) {
    const path = SETUP_STEP_ENDPOINTS[step];

    if (!path) {
      return { error: { message: "Unsupported setup step" } };
    }

    saving.value = true;

    try {
      const result = await fetchApi(path, {
        tenant: true,
        method: SETUP_STEP_METHODS[step] ?? "POST",
        body,
      });

      if (!result.error) {
        const payload = unwrapData(result.data);
        const nextState = payload?.state ?? payload;
        const responseDrafts = payload?.drafts ?? nextState?.drafts ?? {};

        state.value = nextState;
        drafts.value = {
          ...drafts.value,
          ...responseDrafts,
          [step]: responseDrafts?.[step] ?? body,
        };

        if (Array.isArray(payload?.branches)) {
          branches.value = payload.branches;
        }
      }

      return result;
    } finally {
      saving.value = false;
    }
  }

  async function updateCompany(body) {
    return saveStep("company", body);
  }

  async function fetchUserAccessOverview() {
    const result = await fetchApi("/setup/user-access-overview", {
      tenant: true,
      silent: true,
    });

    overview.value = unwrapData(result.data);

    return result;
  }

  async function finish() {
    saving.value = true;

    try {
      const result = await fetchApi("/setup/finish", {
        tenant: true,
        method: "POST",
      });

      if (!result.error) {
        state.value = unwrapData(result.data);
        drafts.value = state.value?.drafts ?? {};
      }

      return result;
    } finally {
      saving.value = false;
    }
  }

  /* --------------------------------------
   * STATE PERSISTENCE
   * ------------------------------------ */

  /**
 * Returns the cached state unless `force` is true or no state has been
 * fetched yet. Multiple concurrent calls share the same in-flight request.
 */

  async function ensureState(force = false) {
    const auth = useAuthStore();

    if (!auth.tenantId) {
      return { error: { message: "No tenant" } };
    }



    // 🔄 allow refresh OR first load
    if (!force && state.value) {
      return { error: null };
    }

    if (statePromise) {
      return statePromise;
    }

    statePromise = fetchState().finally(() => {
      statePromise = null;
    });

    return statePromise;
  }

  /* --------------------------------------
   * RESET FIX 🔥
   * ------------------------------------ */

  function reset() {
    // ❌ don't blindly wipe state during active flow
    state.value = null;
    overview.value = null;
    branches.value = [];
    loading.value = false;
    saving.value = false;
    statePromise = null;
    drafts.value = {};

    // ⚠️ KEEP company if it exists to avoid UI freeze
    // company.value = null;  <-- removed intentionally
  }

  return {
    state,
    company,
    overview,
    branches,
    loading,
    saving,

    currentStep,
    completedSteps,
    drafts,
    isCompleted,

    fetchState,
    fetchCompany,
    setCompanyFromApi,
    saveStep,
    updateCompany,
    fetchUserAccessOverview,
    finish,
    ensureState,
    reset,
  };
});