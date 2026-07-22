<template>
  <v-dialog
    :model-value="modelValue"
    max-width="680"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
        <span class="text-h6 font-weight-bold">
          {{ isEdit ? t('accountingPeriod.editTitle') : t('accountingPeriod.createTitle') }}
        </span>
        <v-btn icon variant="text" size="small" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-6 pt-2">
        <v-form ref="formRef" @submit.prevent="submit">
          <v-row density="comfortable">

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.name_en"
                :label="t('accountingPeriod.nameEn')"
                :error-messages="fieldErrors.name_en"
                :rules="[requiredRule]"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.name_ar"
                :label="t('accountingPeriod.nameAr')"
                :error-messages="fieldErrors.name_ar"
                :rules="[requiredRule]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="form.fiscal_year_id"
                :items="fiscalYearItems"
                item-title="title"
                item-value="value"
                :label="t('accountingPeriod.fiscalYear')"
                :error-messages="fieldErrors.fiscal_year_id"
                :rules="[requiredRule]"
                :disabled="isEdit || isArchived"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.status"
                :items="statusItems"
                item-title="title"
                item-value="value"
                :label="t('accountingPeriod.status')"
                :error-messages="fieldErrors.status"
                :disabled="isArchived"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.start_date"
                :label="t('accountingPeriod.startDate')"
                type="date"
                :error-messages="fieldErrors.start_date"
                :rules="[requiredRule]"
                :disabled="isArchived"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.end_date"
                :label="t('accountingPeriod.endDate')"
                type="date"
                :error-messages="fieldErrors.end_date"
                :rules="[requiredRule]"
                :disabled="isArchived"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" class="d-flex align-center">
              <v-checkbox
                v-model="form.is_closing_period"
                :label="t('accountingPeriod.closingPeriod')"
                :error-messages="fieldErrors.is_closing_period"
                :disabled="isArchived"
                hide-details
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.notes"
                :label="t('accountingPeriod.notes')"
                :error-messages="fieldErrors.notes"
                rows="3"
                auto-grow
                hide-details="auto"
                variant="outlined"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn variant="text" class="text-none" @click="close">
          {{ t('buttons.cancel') }}
        </v-btn>
        <v-btn color="primary" class="text-none" :loading="saving" @click="submit">
          {{ isEdit ? t('buttons.save') : t('accountingPeriod.create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {
  ACCOUNTING_PERIOD_STATUSES,
  emptyAccountingPeriodForm,
  accountingPeriodToForm,
} from "~/utils/accountingPeriodConstants";
import { enumValue } from "~/utils/enumValue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  period: { type: Object, default: null },
  fiscalYearItems: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const { t } = useAppLocale();
const formRef = ref(null);
const form = reactive(emptyAccountingPeriodForm());
const fieldErrors = reactive({});

const isEdit = computed(() => Boolean(props.period?.id));
const isArchived = computed(
  () => enumValue(props.period?.status) === "archived",
);

const statusItems = computed(() =>
  ACCOUNTING_PERIOD_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

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
  Object.assign(
    form,
    props.period
      ? accountingPeriodToForm(props.period)
      : emptyAccountingPeriodForm(),
  );
}

function close() {
  emit("update:modelValue", false);
}

function cleanPayload(payload) {
  const cleaned = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (typeof value === "string" && value.trim() === "") return;
    cleaned[key] = typeof value === "string" ? value.trim() : value;
  });
  return cleaned;
}

async function submit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  const base = {
    name_en: form.name_en,
    name_ar: form.name_ar,
    start_date: form.start_date,
    end_date: form.end_date,
    status: form.status,
    is_closing_period: form.is_closing_period,
    notes: form.notes,
  };

  base.fiscal_year_id = form.fiscal_year_id;

  emit("submit", { payload: cleanPayload(base), applyServerErrors });
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) hydrate();
  },
);
</script>
