<template>
  <v-form @submit.prevent="submit">
    <v-skeleton-loader v-if="loading" type="article" />

    <template v-else>
      <v-text-field v-model="form.name_en" :label="t('setup.nameEn')" :error-messages="errors.name_en" class="mb-2" />
      <v-text-field v-model="form.name_ar" :label="t('setup.nameAr')" :error-messages="errors.name_ar" class="mb-2" />
      <v-text-field v-model="form.commercial_name" :label="t('setup.commercialName')" class="mb-2" />
      <v-text-field v-model="form.phone" :label="t('setup.phone')" class="mb-2" />
      <v-text-field v-model="form.email" :label="t('auth.email')" type="email" :error-messages="errors.email" class="mb-2" />
      <v-autocomplete
        v-model="form.country"
        :items="countryOptions"
        :label="t('setup.country')"
        :error-messages="errors.country"
        item-title="label"
        item-value="code"
        clearable
        class="mb-2 cursor-pointer"
        @update:model-value="onCountryChange"
      />
      <v-autocomplete
        v-model="form.city"
        :items="citiesForCountry"
        :label="t('setup.city')"
        :error-messages="errors.city"
        :disabled="!form.country"
        item-title="label"
        item-value="code"
        clearable
        class="mb-4 cursor-pointer"
      />

      <p class="text-body-2 text-medium-emphasis mb-4">
        {{ t('setup.companyConfigureHint') }}
      </p>

      <v-btn type="submit" color="primary" :loading="saving" class="text-none">
        {{ t('setup.saveContinue') }}
      </v-btn>
    </template>
  </v-form>
</template>

<script setup>
import {
  hasErrors,
  validateCompanyForm,
} from "@/utils/validation/SetupValidation";
import { normalizeCompanyForm } from "@/utils/setupCompany";

const props = defineProps({
  company: { type: Object, default: null },
  draft: { type: Object, default: null },
  saving: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["save"]);
const { t } = useAppLocale();
const {
  countryOptions,
  cityOptions,
  resolveCountryCode,
  resolveCityCode,
  getCountryLabel,
  getCityLabel,
} = useGeo();

const errors = ref({});

const form = reactive({
  name_en: "",
  name_ar: "",
  commercial_name: "",
  phone: "",
  email: "",
  country: "",
  city: "",
});

const citiesForCountry = cityOptions(computed(() => form.country));

function onCountryChange() {
  if (!form.city) return;

  const resolved = resolveCityCode(form.country, form.city);
  const exists = citiesForCountry.value.some((city) => city.code === resolved);

  if (!exists) {
    form.city = "";
  }
}

function applyCompanyData(source, { merge = false } = {}) {
  const normalized = normalizeCompanyForm(source);
  if (!normalized) return;

  const countryCode = resolveCountryCode(normalized.country);
  const cityCode = countryCode
    ? resolveCityCode(countryCode, normalized.city)
    : normalized.city;

  const mapped = {
    ...normalized,
    country: countryCode,
    city: cityCode,
  };

  if (merge) {
    for (const [key, value] of Object.entries(mapped)) {
      if (value !== "" || !form[key]) {
        form[key] = value;
      }
    }
    return;
  }

  Object.assign(form, mapped);
}

watch(
  () => props.company,
  (value) => applyCompanyData(value),
  { immediate: true },
);

watch(
  () => props.draft,
  (draft) => {
    if (!draft || !Object.keys(draft).length) return;
    applyCompanyData(draft, { merge: true });
  },
  { immediate: true },
);

function submit() {
  errors.value = validateCompanyForm(form, t);
  if (hasErrors(errors.value)) return;

  emit("save", {
    ...form,
    country: form.country ? getCountryLabel(form.country) : "",
    city: form.country && form.city
      ? getCityLabel(form.country, form.city)
      : form.city,
  });
}
</script>
