<template>
  <v-dialog
    :model-value="modelValue"
    max-width="760"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="tax-form-card" rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
        <span class="text-h6 font-weight-bold">
          {{ dialogTitle }}
        </span>
        <v-btn
          icon
          variant="text"
          size="small"
          :aria-label="t('buttons.cancel')"
          @click="close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-6 pt-2">
        <v-form ref="formRef" @submit.prevent="submit">
          <v-row density="comfortable">
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.name_en"
                :label="t('tax.nameEn')"
                :error-messages="fieldErrors.name_en"
                :rules="[requiredRule]"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.name_ar"
                :label="t('tax.nameAr')"
                :error-messages="fieldErrors.name_ar"
                :rules="[requiredRule]"
                hide-details="auto"
              />
            </v-col>
            
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.rate"
                :label="t('tax.rate')"
                type="number"
                min="0"
                step="0.01"
                :error-messages="fieldErrors.rate"
                :rules="[requiredRule, rateRule]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="form.type"
                :items="typeItems"
                item-title="title"
                item-value="value"
                :label="t('tax.type')"
                :error-messages="fieldErrors.type"
                :rules="[requiredRule]"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.method"
                :items="methodItems"
                item-title="title"
                item-value="value"
                :label="t('tax.method')"
                :error-messages="fieldErrors.method"
                :rules="[requiredRule]"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="form.scope"
                :items="scopeItems"
                item-title="title"
                item-value="value"
                :label="t('tax.scope')"
                :error-messages="fieldErrors.scope"
                :rules="[requiredRule]"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.calculation_level"
                :items="levelItems"
                item-title="title"
                item-value="value"
                :label="t('tax.calculationLevel')"
                :error-messages="fieldErrors.calculation_level"
                :rules="[requiredRule]"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.effective_date"
                :label="t('tax.effectiveDate')"
                type="date"
                :error-messages="fieldErrors.effective_date"
                :rules="[requiredRule]"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.expiry_date"
                :label="t('tax.expiryDate')"
                type="date"
                :error-messages="fieldErrors.expiry_date"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="form.status"
                :items="statusItems"
                item-title="title"
                item-value="value"
                :label="t('tax.status')"
                variant="outlined"
                :error-messages="fieldErrors.status"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.notes"
                :label="t('tax.notes')"
                :error-messages="fieldErrors.notes"
                rows="3"
                auto-grow
                variant="outlined"
                hide-details="auto"
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
        <v-btn
          color="primary"
          class="text-none"
          :loading="saving"
          @click="submit"
        >
          {{ submitLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {
  TAX_CALCULATION_LEVELS,
  TAX_METHODS,
  TAX_SCOPES,
  TAX_STATUSES,
  TAX_TYPES,
  emptyTaxForm,
  taxToForm,
} from "~/utils/taxConstants";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  tax: { type: Object, default: null },
  mode: {
    type: String,
    default: "create",
    validator: (value) => ["create", "edit", "version"].includes(value),
  },
  saving: { type: Boolean, default: false },
  canApprove: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const { t } = useAppLocale();

const formRef = ref(null);
const form = reactive(emptyTaxForm());
const fieldErrors = reactive({});

const isEdit = computed(() => props.mode === "edit");
const isVersion = computed(() => props.mode === "version");

const dialogTitle = computed(() => {
  if (props.mode === "version") return t("tax.createVersionTitle");
  if (props.mode === "edit") return t("tax.editTitle");
  return t("tax.createTitle");
});

const submitLabel = computed(() => {
  if (props.mode === "version") return t("tax.createVersion");
  if (props.mode === "edit") return t("buttons.save");
  return t("tax.create");
});

const statusItems = computed(() => {
  const items = TAX_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  }));

  if (isVersion.value && !props.canApprove) {
    return items.filter((item) => item.value === "inactive");
  }

  return items;
});

const typeItems = computed(() =>
  TAX_TYPES.map((item) => ({ value: item.value, title: t(item.labelKey) })),
);
const methodItems = computed(() =>
  TAX_METHODS.map((item) => ({ value: item.value, title: t(item.labelKey) })),
);
const scopeItems = computed(() =>
  TAX_SCOPES.map((item) => ({ value: item.value, title: t(item.labelKey) })),
);
const levelItems = computed(() =>
  TAX_CALCULATION_LEVELS.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const requiredRule = (value) => {
  if (value == null || String(value).trim() === "") {
    return t("forms.required");
  }
  return true;
};

const rateRule = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    return t("tax.rateInvalid");
  }
  return true;
};

function resetErrors() {
  Object.keys(fieldErrors).forEach((key) => {
    delete fieldErrors[key];
  });
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
  Object.assign(form, props.tax ? taxToForm(props.tax) : emptyTaxForm());

  if (isVersion.value) {
    form.status = "inactive";
    if (!form.effective_date) {
      form.effective_date = new Date().toISOString().slice(0, 10);
    }
  }
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

  if (cleaned.rate != null) cleaned.rate = Number(cleaned.rate);

  return cleaned;
}

async function submit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  emit("submit", {
    payload: cleanPayload({ ...form }),
    applyServerErrors,
  });
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) hydrate();
  },
);

defineExpose({ applyServerErrors });
</script>

<style scoped>
.tax-form-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
</style>
