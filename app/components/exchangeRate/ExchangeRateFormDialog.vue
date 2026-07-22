<template>
  <v-dialog
    :model-value="modelValue"
    max-width="720"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="exchange-rate-form-card" rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
        <span class="text-h6 font-weight-bold">
          {{ isEdit ? t('exchangeRate.editTitle') : t('exchangeRate.createTitle') }}
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
        <p v-if="isEdit" class="text-body-2 text-medium-emphasis mb-4">
          {{ t('exchangeRate.editHint') }}
        </p>

        <v-form ref="formRef" @submit.prevent="submit">
          <v-row density="comfortable">
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.currency_id"
                :items="currencyFilterItems"
                item-title="title"
                item-value="value"
                :label="t('exchangeRate.currency')"
                :disabled="isEdit"
                :loading="currenciesLoading"
                :error-messages="fieldErrors.currency_id"
                :rules="isEdit ? [] : [requiredRule]"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.rate"
                :label="t('exchangeRate.rate')"
                type="number"
                min="0.000001"
                step="any"
                :disabled="isEdit"
                :error-messages="fieldErrors.rate"
                :rules="isEdit ? [] : [requiredRule, rateRule]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="form.rate_type"
                :items="typeItems"
                item-title="title"
                item-value="value"
                :label="t('exchangeRate.rateType')"
                :disabled="isEdit"
                :error-messages="fieldErrors.rate_type"
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
                :label="t('exchangeRate.status')"
                :error-messages="fieldErrors.status"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.effective_date"
                :label="t('exchangeRate.effectiveDate')"
                type="date"
                :disabled="isEdit"
                :error-messages="fieldErrors.effective_date"
                :rules="isEdit ? [] : [requiredRule]"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.expiry_date"
                :label="t('exchangeRate.expiryDate')"
                type="date"
                clearable
                :error-messages="fieldErrors.expiry_date"
                hide-details="auto"
              />
            </v-col>

            <v-col v-if="isEdit" cols="12">
              <v-checkbox
                v-model="form.clear_expiry"
                :label="t('exchangeRate.clearExpiry')"
                hide-details
                density="compact"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.notes"
                :label="t('exchangeRate.notes')"
                :error-messages="fieldErrors.notes"
                rows="2"
                auto-grow
                variant="outlined"
                hide-details="auto"
              />
            </v-col>

            <v-col v-if="!isEdit" cols="12">
              <v-checkbox
                v-model="form.confirm_impact"
                :label="t('exchangeRate.confirmImpact')"
                hide-details
                density="compact"
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
          {{ isEdit ? t('buttons.save') : t('exchangeRate.create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {
  EXCHANGE_RATE_STATUSES,
  EXCHANGE_RATE_TYPES,
  currencyLabel,
  emptyExchangeRateForm,
  exchangeRateToForm,
} from "~/utils/exchangeRateConstants";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  exchangeRate: { type: Object, default: null },
  currencyOptions: { type: Array, default: () => [] },
  baseCurrencyId: { type: [Number, String], default: null },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const { t, locale } = useAppLocale();
const currenciesStore = useCurrenciesStore();

const formRef = ref(null);
const form = reactive(emptyExchangeRateForm());
const fieldErrors = reactive({});
const currenciesLoading = ref(false);
const localCurrencies = ref([]);

const isEdit = computed(() => Boolean(props.exchangeRate?.id));

const statusItems = computed(() =>
  EXCHANGE_RATE_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const typeItems = computed(() =>
  EXCHANGE_RATE_TYPES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const currencyItems = computed(() => {
  const source =
    props.currencyOptions.length > 0
      ? props.currencyOptions
      : localCurrencies.value;

  return source
    .map((row) => row.currency || row)
    .filter((currency) => {
      if (!currency?.id) return false;
      if (props.baseCurrencyId && Number(currency.id) === Number(props.baseCurrencyId)) {
        return false;
      }
      return true;
    })
    .map((currency) => ({
      value: currency.id,
      title: currencyLabel(currency, locale.value),
    }));
});

const requiredRule = (value) => {
  if (value == null || String(value).trim() === "") return t("forms.required");
  return true;
};

const rateRule = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return t("exchangeRate.rateMustBePositive");
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
    props.exchangeRate
      ? exchangeRateToForm(props.exchangeRate)
      : emptyExchangeRateForm(),
  );
}

async function loadCurrencies() {
  if (props.currencyOptions.length) return;
  currenciesLoading.value = true;
  try {
    await currenciesStore.fetchList();
    localCurrencies.value = currenciesStore.items;
  } finally {
    currenciesLoading.value = false;
  }
}

function close() {
  emit("update:modelValue", false);
}

const currencyFilterItems = computed(() =>
  currenciesStore.items
    .map((row) => row.currency || row)
    .filter((currency) => currency?.id)
    .map((currency) => ({
      value: currency.id,
      title: currencyLabel(currency, locale.value),
    })),
);


function cleanPayload() {
  if (isEdit.value) {
    const payload = {
      status: form.status || "active",
      notes: form.notes?.trim() || null,
    };
    if (form.clear_expiry) payload.clear_expiry = true;
    else if (form.expiry_date) payload.expiry_date = form.expiry_date;
    return payload;
  }

  return {
    currency_id: form.currency_id,
    rate: form.rate,
    rate_type: form.rate_type || "average",
    effective_date: form.effective_date,
    expiry_date: form.expiry_date || null,
    status: form.status || "active",
    notes: form.notes?.trim() || null,
    confirm_impact: Boolean(form.confirm_impact),
  };
}

async function submit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  emit("submit", {
    payload: cleanPayload(),
    applyServerErrors,
  });
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    hydrate();
    loadCurrencies();
  },
);

defineExpose({ applyServerErrors });
</script>

<style scoped>
.exchange-rate-form-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
</style>
