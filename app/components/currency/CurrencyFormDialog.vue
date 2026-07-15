<template>
  <v-dialog
    :model-value="modelValue"
    max-width="560"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="currency-form-card" rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
        <span class="text-h6 font-weight-bold">
          {{ isEdit ? t('currency.editTitle') : t('currency.attachTitle') }}
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
            <v-col cols="12">
              <v-autocomplete
                v-if="!isEdit"
                v-model="form.currency_code"
                :items="catalogItems"
                item-title="title"
                item-value="value"
                :label="t('currency.code')"
                :error-messages="fieldErrors.currency_code"
                :rules="[requiredRule]"
                :custom-filter="catalogFilter"
                variant="outlined"
                hide-details="auto"
              />
              <v-text-field
                v-else
                :model-value="currencyLabel"
                :label="t('currency.code')"
                readonly
                variant="outlined"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.decimal_places"
                :label="t('currency.decimalPlaces')"
                type="number"
                min="0"
                max="8"
                :error-messages="fieldErrors.decimal_places"
                :rules="[requiredRule, decimalRule]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="form.rounding_mode"
                :items="roundingItems"
                item-title="title"
                item-value="value"
                :label="t('currency.roundingMode')"
                :error-messages="fieldErrors.rounding_mode"
                :rules="[requiredRule]"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12">
              <v-switch
                v-model="form.allow_rounding"
                :label="t('currency.allowRounding')"
                color="primary"
                hide-details="auto"
              />
            </v-col>

            <v-col v-if="!isEdit" cols="12">
              <v-switch
                v-model="form.is_base"
                :label="t('currency.setAsBase')"
                color="primary"
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
          {{ isEdit ? t('buttons.save') : t('currency.attach') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { GEO_CURRENCIES } from "@/data/geo";
import {
  ROUNDING_MODES,
  currencyToForm,
  emptyCurrencyForm,
} from "~/utils/currencyConstants";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  currency: {
    type: Object,
    default: null,
  },
  attachedCodes: {
    type: Array,
    default: () => [],
  },
  saving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const { t, locale } = useAppLocale();

const formRef = ref(null);
const form = reactive(emptyCurrencyForm());
const fieldErrors = reactive({});

const isEdit = computed(() => Boolean(props.currency?.id));

const attachedSet = computed(() => new Set(props.attachedCodes));

const catalogItems = computed(() =>
  GEO_CURRENCIES
    .filter((item) => !attachedSet.value.has(item.code))
    .map((item) => {
      const name = locale.value === "ar" ? item.nameAr : item.nameEn;
      return {
        value: item.code,
        title: `${item.code} — ${name} (${item.symbol})`,
        searchText: `${item.code} ${item.nameEn} ${item.nameAr} ${item.symbol}`.toLowerCase(),
      };
    }),
);

const roundingItems = computed(() =>
  ROUNDING_MODES.map((mode) => ({
    value: mode.value,
    title: t(mode.labelKey),
  })),
);

const currencyLabel = computed(() => {
  const currency = props.currency?.currency;
  if (!currency) return "";
  const name = locale.value === "ar" ? currency.name_ar : currency.name_en;
  return `${currency.code} — ${name} (${currency.symbol})`;
});

const requiredRule = (value) => {
  if (value == null || String(value).trim() === "") {
    return t("forms.required");
  }
  return true;
};

const decimalRule = (value) => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 8) {
    return t("currency.decimalPlacesInvalid");
  }
  return true;
};

function catalogFilter(_value, query, item) {
  const q = String(query || "").toLowerCase().trim();
  if (!q) return true;
  return String(item.raw?.searchText || item.title || "").includes(q);
}

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
  Object.assign(
    form,
    props.currency ? currencyToForm(props.currency) : emptyCurrencyForm(),
  );
}

function close() {
  emit("update:modelValue", false);
}

async function submit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  const payload = isEdit.value
    ? {
        decimal_places: Number(form.decimal_places),
        allow_rounding: Boolean(form.allow_rounding),
        rounding_mode: form.rounding_mode,
      }
    : {
        currency_code: form.currency_code,
        decimal_places: Number(form.decimal_places),
        allow_rounding: Boolean(form.allow_rounding),
        rounding_mode: form.rounding_mode,
        is_base: Boolean(form.is_base),
      };

  emit("submit", {
    payload,
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
.currency-form-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
</style>
