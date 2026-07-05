<template>
  <div>
    <section v-if="!auth.hasTenant" class="install-panel">
      <AuthHeader
        :title="t('setup.installTitle')"
        :subtitle="t('setup.installSubtitle')"
      />

      <v-form @submit.prevent="handleInstall">
        <v-text-field
          v-model="installForm.name_en"
          :label="t('setup.nameEn')"
          :error-messages="installErrors.name_en"
          class="mb-2"
        />
        <v-text-field
          v-model="installForm.name_ar"
          :label="t('setup.nameAr')"
          :error-messages="installErrors.name_ar"
          class="mb-4"
        />

        <v-btn
          type="submit"
          block
          color="primary"
          size="large"
          rounded="pill"
          :loading="installingSubmit"
          class="text-none"
        >
          {{ t('setup.createCompany') }}
        </v-btn>
      </v-form>
    </section>

    <section v-else class="setup-wizard">
      <div class="setup-wizard__header d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
        <div class="setup-wizard__header-text flex-grow-1 min-w-0">
          <h2 class="text-h6 font-weight-bold mb-1">{{ t('setup.title') }}</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ t('setup.subtitle') }}
          </p>
        </div>
        <v-chip
          class="setup-wizard__step-chip"
          color="primary"
          variant="tonal"
          size="small"
        >
          {{ stepLabel(currentStep) }}
        </v-chip>
      </div>

      <v-progress-linear
        :model-value="progress"
        color="primary"
        height="6"
        rounded
        class="mb-6"
      />

      <v-alert
        v-if="loadError"
        type="error"
        variant="tonal"
        class="mb-4"
      >
        {{ loadError }}
      </v-alert>

      <div v-if="setup.loading " class="d-flex justify-center py-10">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <template v-else>
        <v-btn
          v-if="canGoBack"
          variant="text"
          prepend-icon="mdi-arrow-left"
          class="text-none mb-4 px-2"
          @click="goBack"
        >
          {{ backLabel }}
        </v-btn>


        <SetupStepCompany
          v-if="currentStep === 'company'"
          :company="setup.company"
          :draft="drafts.company"
          :loading="companyLoading"
          :saving="setup.saving"
          @save="saveCurrentStep"
        />

        <SetupStepBranches
          v-else-if="currentStep === 'branches'"
          :draft="drafts.branches"
          :saving="setup.saving"
          @save="saveCurrentStep"
        />

        <SetupStepFiscalYear
          v-else-if="currentStep === 'fiscal_year'"
          :draft="drafts.fiscal_year"
          :saving="setup.saving"
          @save="saveCurrentStep"
        />

        <SetupStepCurrency
          v-else-if="currentStep === 'currency'"
          :draft="drafts.currency"
          :saving="setup.saving"
          @save="saveCurrentStep"
        />

        <SetupStepTaxes
          v-else-if="currentStep === 'taxes'"
          :draft="drafts.taxes"
          :saving="setup.saving"
          @save="saveCurrentStep"
        />

        <SetupStepUsers
          v-else-if="currentStep === 'users'"
          :draft="drafts.users"
          :saving="setup.saving"
          @save="saveCurrentStep"
        />

        <SetupStepPermissions
          v-else-if="currentStep === 'permissions'"
          :draft="drafts.permissions"
          :saving="setup.saving"
          @save="saveCurrentStep"
        />

        <SetupStepUserAccessOverview
          v-else-if="currentStep === 'user_access_overview'"
          :overview="setup.overview"
          :loading="overviewLoading"
          @continue="goToWarehouses"
        />

        <SetupStepWarehouses
          v-else-if="currentStep === 'warehouses'"
          :draft="drafts.warehouses"
          :saving="setup.saving"
          @save="saveCurrentStep"
        />

        <SetupStepFinish
          v-else-if="currentStep === 'finish'"
          :saving="setup.saving"
          @finish="handleFinish"
        />
      </template>
    </section>
  </div>
</template>

<script setup>
import { nextTick } from "vue";
import SetupStepCompany from "./steps/SetupStepCompany.vue";
import SetupStepBranches from "./steps/SetupStepBranches.vue";
import SetupStepFiscalYear from "./steps/SetupStepFiscalYear.vue";
import SetupStepCurrency from "./steps/SetupStepCurrency.vue";
import SetupStepTaxes from "./steps/SetupStepTaxes.vue";
import SetupStepUsers from "./steps/SetupStepUsers.vue";
import SetupStepPermissions from "./steps/SetupStepPermissions.vue";
import SetupStepUserAccessOverview from "./steps/SetupStepUserAccessOverview.vue";
import SetupStepWarehouses from "./steps/SetupStepWarehouses.vue";
import SetupStepFinish from "./steps/SetupStepFinish.vue";
import { SETUP_STEPS, previousStep, stepIndex } from "@/utils/setupSteps";
import {
  hasErrors,
  validateInstallForm,
} from "@/utils/validation/SetupValidation";

const { t } = useAppLocale();
const auth = useAuthStore();
const setup = useSetupStore();
const { fetchApi } = useApi();

const loadError = ref("");
const overviewLoading = ref(false);
const companyLoading = ref(false);
const installingSubmit = ref(false);
const displayStep = ref(null);
const installErrors = ref({});

const installForm = reactive({
  name_en: "",
  name_ar: "",
});

const currentStep = computed(() => displayStep.value ?? setup.currentStep);
const drafts = computed(() => setup.drafts);
const canGoBack = computed(() => stepIndex(currentStep.value) > 0);

const backLabel = computed(() => {
  const prev = previousStep(currentStep.value);

  return prev ? t("setup.backTo", { step: stepLabel(prev) }) : t("setup.back");
});
const progress = computed(() => {
  const index = stepIndex(currentStep.value);
  if (index < 0) return 0;
  return Math.round(((index + 1) / SETUP_STEPS.length) * 100);
});

function stepLabel(step) {
  return t(`setup.steps.${step}`, step);
}

async function loadWizard() {
  const tenantId = auth.tenantId;

  if (!tenantId) return;

  loadError.value = "";

  const result = await setup.ensureState();

  if (result?.error) {
    loadError.value = result.error.message;
    return;
  }

  const setupCompleted = auth.setupCompleted;

  if (setupCompleted) {
    await navigateTo("/");
    return;
  }

  await loadStepData(currentStep.value);
}

async function loadStepData(step) {
  if (step === "user_access_overview") {
    await loadOverview();
    return;
  }



  if (step === "company" && !setup.company) {
    await loadCompanyStep();
  }
}

async function loadCompanyStep() {
  companyLoading.value = true;
  try {
    await setup.fetchCompany();
  } finally {
    companyLoading.value = false;
  }
}

async function loadOverview() {
  overviewLoading.value = true;
  await setup.fetchUserAccessOverview();
  overviewLoading.value = false;
}

async function saveCurrentStep(payload) {
  const step = currentStep.value;
  const result = await setup.saveStep(step, payload);

  if (result.error) return;

  displayStep.value = null;

  if (setup.currentStep === "user_access_overview") {
    await loadOverview();
  }
}

function goToWarehouses() {
  displayStep.value = "warehouses";
}

function goBack() {
  const prev = previousStep(currentStep.value);

  if (!prev) return;

  displayStep.value = prev;

  if (prev === "user_access_overview" && !setup.overview) {
    loadOverview();
  }
}

async function handleFinish() {
  const result = await setup.finish();

  if (result.error) return;

  auth.patchContext({ setup_completed: true });
  await navigateTo("/");
}

async function handleInstall() {
  installErrors.value = validateInstallForm(installForm, t);
  if (hasErrors(installErrors.value)) return;

  installingSubmit.value = true;

  const result = await fetchApi("/onboarding/company", {
    method: "POST",
    body: installForm,
  });

  installingSubmit.value = false;

  if (result.error) return;

  const payload = result.data?.data ?? result.data ?? {};
  const company = payload.company;

  if (company?.uuid) {
    await auth.setTenant(company);
    await auth.fetchContext();
    setup.setCompanyFromApi(company);
    auth.patchContext({ setup_completed: false });
  }

  await nextTick();
  await loadWizard();
}

onMounted(loadWizard);

watch(currentStep, async (step, prev) => {
  if (step === prev) return;
  await loadStepData(step);
});
</script>

<style scoped>
.setup-wizard {
  width: 100%;
  max-width: 100%;
  overflow-x: clip;
}

.setup-wizard__header {
  row-gap: 12px;
}

.setup-wizard__step-chip {
  max-width: 100%;
  height: auto;
  min-height: 32px;
  align-self: flex-start;
}

.setup-wizard__step-chip :deep(.v-chip__content) {
  white-space: normal;
  overflow-wrap: anywhere;
  text-align: start;
}

.install-panel {
  max-width: 520px;
  margin: 0 auto;
}

@media (min-width: 769px) and (max-width: 1023px) {
  .setup-wizard__header {
    align-items: flex-start;
  }

  .setup-wizard__step-chip {
    flex: 1 1 auto;
    max-width: 100%;
  }
}

@media (min-width: 1024px) {
  .setup-wizard {
    margin-inline: auto;
  }

  .setup-wizard__header {
    align-items: center;
  }

  .setup-wizard__step-chip {
    flex: 0 1 auto;
    max-width: min(240px, 40%);
  }
}
</style>
