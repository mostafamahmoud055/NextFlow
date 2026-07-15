<template>
  <v-dialog
    :model-value="modelValue"
    max-width="720"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="company-form-card" rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
        <span class="text-h6 font-weight-bold">
          {{ isEdit ? t('company.editTitle') : t('company.createTitle') }}
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
                :label="t('company.nameEn')"
                :error-messages="fieldErrors.name_en"
                :rules="[requiredRule]"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.name_ar"
                :label="t('company.nameAr')"
                :error-messages="fieldErrors.name_ar"
                :rules="[requiredRule]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.commercial_name"
                :label="t('company.commercialName')"
                :error-messages="fieldErrors.commercial_name"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.email"
                :label="t('company.email')"
                type="email"
                :error-messages="fieldErrors.email"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.phone"
                :label="t('company.phone')"
                :error-messages="fieldErrors.phone"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.website"
                :label="t('company.website')"
                :error-messages="fieldErrors.website"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.registration_number"
                :label="t('company.registrationNumber')"
                :error-messages="fieldErrors.registration_number"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.tax_number"
                :label="t('company.taxNumber')"
                :error-messages="fieldErrors.tax_number"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-autocomplete
                v-model="form.country"
                :items="countryOptions"
                item-title="label"
                item-value="code"
                :label="t('company.country')"
                :error-messages="fieldErrors.country"
                :rules="[requiredRule]"
                variant="outlined"
                clearable
                hide-details="auto"
                @update:model-value="onCountryChange"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-autocomplete
                v-model="form.city"
                :items="citySelectOptions"
                item-title="label"
                item-value="code"
                :label="t('company.city')"
                :error-messages="fieldErrors.city"
                :disabled="!form.country"
                :loading="citiesLoading"
                :rules="[requiredRule]"
                variant="outlined"
                clearable
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="8">
              <v-text-field
                v-model="form.address"
                :label="t('company.address')"
                :error-messages="fieldErrors.address"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.postal_code"
                :label="t('company.postalCode')"
                :error-messages="fieldErrors.postal_code"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12">
              <v-file-upload
                v-model="logoFiles"
                :label="t('company.logo')"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                prepend-icon=""
                prepend-inner-icon="mdi-image-outline"
                show-size
                clearable
                :error-messages="fieldErrors.logo"
                hide-details="auto"
                density="compact" 
                variant="compact"
              />
              <div
                v-if="isEdit && company?.logo_url && !logoFiles?.length"
                class="d-flex align-center ga-3 mt-3"
              >
                <v-avatar size="48" rounded="lg" color="surface-bright">
                  <v-img :src="company.logo_url" cover />
                </v-avatar>
                <span class="text-body-2 text-medium-emphasis">
                  {{ t('company.currentLogo') }}
                </span>
              </div>
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
          {{ isEdit ? t('buttons.save') : t('company.create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { companyToForm, emptyCompanyForm } from "~/utils/companyConstants";
import { getCountryByCode } from "@/data/geo";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  company: {
    type: Object,
    default: null,
  },
  saving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const { t, locale } = useAppLocale();
const {
  countryOptions,
  cityOptions,
  resolveCountryCode,
  resolveCityCode,
} = useGeo();

const formRef = ref(null);
const form = reactive(emptyCompanyForm());
const logoFiles = ref([]);
const fieldErrors = reactive({});
const hydrating = ref(false);

const isEdit = computed(() => Boolean(props.company?.uuid));

const {
  options: citySelectOptions,
  loading: citiesLoading,
} = cityOptions(toRef(form, "country"));

const requiredRule = (value) => {
  if (value == null || String(value).trim() === "") {
    return t("forms.required");
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

function onCountryChange(code) {
  if (hydrating.value) return;

  form.city = "";

  const country = getCountryByCode(code);
  if (!country) return;

}

async function hydrate() {
  hydrating.value = true;
  resetErrors();
  logoFiles.value = [];

  const next = props.company ? companyToForm(props.company) : emptyCompanyForm();
  next.country = resolveCountryCode(next.country) || next.country || "";

  Object.assign(form, next);

  if (form.country && form.city) {
    form.city = (await resolveCityCode(form.country, form.city)) || form.city;
  }

  await nextTick();
  hydrating.value = false;
}

function close() {
  emit("update:modelValue", false);
}

async function submit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  const payload = { ...form };
  const logoFile = Array.isArray(logoFiles.value)
    ? logoFiles.value[0]
    : logoFiles.value;

  emit("submit", {
    payload,
    logoFile: logoFile || null,
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
.company-form-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
</style>
