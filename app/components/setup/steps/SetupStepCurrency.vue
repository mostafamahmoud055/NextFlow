<template>
  <v-form @submit.prevent="submit">
    <v-select
      v-model="form.base_currency"
      :items="currencyOptions"
      :label="t('setup.currency')"
      :error-messages="errors.base_currency"
      item-title="title"
      item-value="value"
      class="mb-2"
    />
    <v-select
      v-model="form.timezone"
      :items="timezoneOptions"
      :label="t('setup.timezone')"
      :error-messages="errors.timezone"
      item-title="title"
      item-value="value"
      class="mb-4"
    />

    <v-btn type="submit" color="primary" :loading="saving" class="text-none">
      {{ t('setup.saveContinue') }}
    </v-btn>
  </v-form>
</template>

<script setup>
import { GEO_CURRENCIES, GEO_TIMEZONES } from "@/data/geo/currencies";
import {
  hasErrors,
  validateCurrencyForm,
} from "@/utils/validation/SetupValidation";

const props = defineProps({
  draft: { type: Object, default: null },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["save"]);
const { locale, t } = useAppLocale();

const errors = ref({});

const currencyOptions = computed(() =>
  GEO_CURRENCIES.map((currency) => ({
    value: currency.code,
    title: locale.value === "ar"
      ? `${currency.nameAr} (${currency.code})`
      : `${currency.nameEn} (${currency.code})`,
  })),
);

const timezoneOptions = computed(() =>
  GEO_TIMEZONES.map((timezone) => ({
    value: timezone.value,
    title: locale.value === "ar" ? timezone.nameAr : timezone.nameEn,
  })),
);

const form = reactive({
  base_currency: "EGP",
  timezone: "Africa/Cairo",
});

watch(
  () => props.draft,
  (draft) => {
    if (!draft) return;

    if (draft.base_currency) {
      form.base_currency = typeof draft.base_currency === "object"
        ? draft.base_currency.value
        : draft.base_currency;
    }

    if (draft.timezone) {
      form.timezone = typeof draft.timezone === "object"
        ? draft.timezone.value
        : draft.timezone;
    }
  },
  { immediate: true },
);

function submit() {
  errors.value = validateCurrencyForm(form, t);
  if (hasErrors(errors.value)) return;

  emit("save", { ...form });
}
</script>
