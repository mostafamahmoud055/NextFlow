<template>
  <v-form @submit.prevent="submit">
    <v-text-field v-model="form.name" :label="t('setup.fiscalYearName')" :error-messages="errors.name" class="mb-2" />
    <v-text-field v-model="form.start_date" :label="t('setup.startDate')" type="date" :error-messages="errors.start_date" class="mb-2" />
    <v-text-field v-model="form.end_date" :label="t('setup.endDate')" type="date" :error-messages="errors.end_date" class="mb-4" />

    <v-btn type="submit" color="primary" :loading="saving" class="text-none">
      {{ t('setup.saveContinue') }}
    </v-btn>
  </v-form>
</template>

<script setup>
import {
  hasErrors,
  validateFiscalYearForm,
} from "@/utils/validation/SetupValidation";

const props = defineProps({
  draft: { type: Object, default: null },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["save"]);
const { t } = useAppLocale();

const errors = ref({});

const form = reactive({
  fiscal_year_code: "FY-1",
  name: "",
  start_date: "",
  end_date: "",
  is_default: true,
});

watch(
  () => props.draft,
  (draft) => {
    if (draft) Object.assign(form, draft);
  },
  { immediate: true },
);

function submit() {
  errors.value = validateFiscalYearForm(form, t);
  if (hasErrors(errors.value)) return;

  emit("save", { ...form });
}
</script>
