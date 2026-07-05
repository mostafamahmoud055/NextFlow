<template>
  <v-form @submit.prevent="submit">
    <v-alert
      v-if="listError(errors, 'branches').length"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-4"
    >
      {{ listError(errors, 'branches')[0] }}
    </v-alert>

    <v-expansion-panels v-model="openPanel" class="m-4">
      <v-expansion-panel
        v-for="(branch, index) in form.branches"
        :key="index"
      >
        <v-expansion-panel-title>
          {{ panelTitle(index, branch) }}
        </v-expansion-panel-title>

        <v-expansion-panel-text>

          <v-text-field
            v-model="branch.name_en"
            :label="t('setup.nameEn')"
            :error-messages="itemError(errors, index, 'name_en')"
            class="mb-2"
          />
          <v-text-field
            v-model="branch.name_ar"
            :label="t('setup.nameAr')"
            :error-messages="itemError(errors, index, 'name_ar')"
            class="mb-2"
          />
          <v-select
            v-model="branch.type"
            :items="branchTypeOptions"
            :label="t('setup.branchType')"
            :error-messages="itemError(errors, index, 'type')"
            item-title="title"
            item-value="value"
            class="mb-2"
          />

          <v-btn
            v-if="form.branches.length > 1"
            variant="text"
            color="error"
            class="text-none px-0"
            @click="removeBranch(index)"
          >
            {{ t('setup.remove') }}
          </v-btn>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div class="d-flex flex-wrap ga-2 mt-4">
      <v-btn variant="outlined" class="text-none" @click="addBranch">
        {{ t('setup.addMore') }}
      </v-btn>
      <v-btn type="submit" color="primary" :loading="saving" class="text-none">
        {{ t('setup.saveContinue') }}
      </v-btn>
    </div>
  </v-form>
</template>

<script setup>
import { itemError, listError } from "@/utils/setup/arrayFieldErrors";
import { createBranch } from "@/utils/setup/setupDefaults";
import {
  hasErrors,
  SETUP_BRANCH_TYPES,
  validateBranchesForm,
} from "@/utils/validation/SetupValidation";

const props = defineProps({
  draft: { type: Object, default: null },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["save"]);
const { t } = useAppLocale();

const errors = ref({});
const openPanel = ref(0);

const branchTypeOptions = computed(() =>
  SETUP_BRANCH_TYPES.map((value) => ({
    value,
    title: t(`setup.branchTypes.${value}`),
  })),
);

const form = reactive({
  branches: [createBranch(0)],
});

function panelTitle(index, branch) {
  const label =  branch.name_en || branch.name_ar;

  return label
    ? t("setup.branchNumberNamed", { n: index + 1, name: label })
    : t("setup.branchNumber", { n: index + 1 });
}

function applyDraft(draft) {
  if (Array.isArray(draft?.branches) && draft.branches.length) {
    form.branches = draft.branches.map((branch) => ({ ...branch }));
    openPanel.value = 0;
    return;
  }

  form.branches = [createBranch(0)];
  openPanel.value = 0;
}

watch(() => props.draft, applyDraft, { immediate: true });

function addBranch() {
  form.branches.push(createBranch(form.branches.length));
  openPanel.value = form.branches.length - 1;
}

function removeBranch(index) {
  form.branches.splice(index, 1);
  if (openPanel.value === index) {
    openPanel.value = Math.max(0, index - 1);
  } else if (openPanel.value > index) {
    openPanel.value--;
  }
}

function submit() {
  errors.value = validateBranchesForm(form.branches, t);
  if (hasErrors(errors.value)) return;

  emit("save", {
    branches: form.branches.map((branch) => ({ ...branch })),
  });
}
</script>
