<template>
  <v-dialog
    :model-value="modelValue"
    max-width="480"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
        <span class="text-h6 font-weight-bold">
          {{ t('accountingPeriod.generateTitle') }}
        </span>
        <v-btn icon variant="text" size="small" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-6 pt-2">
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ t('accountingPeriod.generateHint') }}
        </p>
        <v-form ref="formRef" @submit.prevent="submit">
          <v-select
            v-model="form.fiscal_year_id"
            :items="fiscalYearItems"
            item-title="title"
            item-value="value"
            :label="t('accountingPeriod.fiscalYear')"
            :error-messages="fieldErrors.fiscal_year_id"
            :rules="[requiredRule]"
            variant="outlined"
            hide-details="auto"
            class="mb-3"
          />
          <v-checkbox
            v-model="form.include_closing_period"
            :label="t('accountingPeriod.includeClosingPeriod')"
            :error-messages="fieldErrors.include_closing_period"
            hide-details
          />
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn variant="text" class="text-none" @click="close">
          {{ t('buttons.cancel') }}
        </v-btn>
        <v-btn color="primary" class="text-none" :loading="saving" @click="submit">
          {{ t('accountingPeriod.generate') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  fiscalYearItems: { type: Array, default: () => [] },
  defaultFiscalYearId: { type: [Number, String], default: null },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const { t } = useAppLocale();
const formRef = ref(null);
const form = reactive({
  fiscal_year_id: null,
  include_closing_period: false,
});
const fieldErrors = reactive({});

const requiredRule = (value) => {
  if (value == null || String(value).trim() === "") return t("forms.required");
  return true;
};

function resetErrors() {
  Object.keys(fieldErrors).forEach((key) => delete fieldErrors[key]);
}

function applyServerErrors(errors) {
  resetErrors();
  if (!errors || typeof errors !== "object") return;
  Object.entries(errors).forEach(([key, value]) => {
    fieldErrors[key] = Array.isArray(value) ? value : [String(value)];
  });
}

function hydrate() {
  resetErrors();
  form.fiscal_year_id = props.defaultFiscalYearId || null;
  form.include_closing_period = false;
}

function close() {
  emit("update:modelValue", false);
}

async function submit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  emit("submit", {
    payload: {
      fiscal_year_id: form.fiscal_year_id,
      include_closing_period: form.include_closing_period,
    },
    applyServerErrors,
  });
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) hydrate();
  },
);
</script>
