<template>
  <v-dialog
    :model-value="modelValue"
    max-width="640"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
        <span class="text-h6 font-weight-bold">
          {{ isEdit ? t('fiscalYear.editTitle') : t('fiscalYear.createTitle') }}
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
                v-model="form.start_date"
                :label="t('fiscalYear.startDate')"
                type="date"
                :error-messages="fieldErrors.start_date"
                :rules="[requiredRule]"
                :disabled="isClosed"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.end_date"
                :label="t('fiscalYear.endDate')"
                type="date"
                :error-messages="fieldErrors.end_date"
                :rules="[requiredRule]"
                :disabled="isClosed"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="form.status"
                :items="statusItems"
                item-title="title"
                item-value="value"
                :label="t('fiscalYear.status')"
                :error-messages="fieldErrors.status"
                :disabled="isClosed"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6" class="d-flex align-center">
              <v-checkbox
                v-model="form.is_default"
                :label="t('fiscalYear.isDefault')"
                :error-messages="fieldErrors.is_default"
                :disabled="isClosed"
                hide-details
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.notes"
                :label="t('fiscalYear.notes')"
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
          {{ isEdit ? t('buttons.save') : t('fiscalYear.create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {
  FISCAL_YEAR_STATUSES,
  emptyFiscalYearForm,
  fiscalYearToForm,
} from "~/utils/fiscalYearConstants";
import { enumValue } from "~/utils/enumValue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  fiscalYear: { type: Object, default: null },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const { t } = useAppLocale();
const formRef = ref(null);
const form = reactive(emptyFiscalYearForm());
const fieldErrors = reactive({});

const isEdit = computed(() => Boolean(props.fiscalYear?.id));
const isClosed = computed(() => enumValue(props.fiscalYear?.status) === "closed");

const statusItems = computed(() =>
  FISCAL_YEAR_STATUSES.map((item) => ({
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
    props.fiscalYear ? fiscalYearToForm(props.fiscalYear) : emptyFiscalYearForm(),
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

  const payload = isClosed.value
    ? { notes: form.notes }
    : cleanPayload({ ...form });

  emit("submit", { payload, applyServerErrors });
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) hydrate();
  },
);
</script>
