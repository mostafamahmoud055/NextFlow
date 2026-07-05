<template>
  <v-form @submit.prevent="submit">
    <v-alert
      v-if="listError(errors, 'taxes').length"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-4"
    >
      {{ listError(errors, 'taxes')[0] }}
    </v-alert>

    <v-expansion-panels v-model="openPanel" class="mb-4">
      <v-expansion-panel
        v-for="(tax, index) in form.taxes"
        :key="index"
      >
        <v-expansion-panel-title>
          {{ panelTitle(index, tax) }}
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <v-text-field
            v-model="tax.name_en"
            :label="t('setup.nameEn')"
            :error-messages="itemError(errors, index, 'name_en')"
            class="mb-2"
          />
          <v-text-field
            v-model="tax.name_ar"
            :label="t('setup.nameAr')"
            :error-messages="itemError(errors, index, 'name_ar')"
            class="mb-2"
          />
          <v-text-field
            v-model.number="tax.rate"
            :label="t('setup.taxRate')"
            type="number"
            :error-messages="itemError(errors, index, 'rate')"
            class="mb-2"
          />
          <v-text-field
            v-model="tax.effective_date"
            :label="t('setup.effectiveDate')"
            type="date"
            :error-messages="itemError(errors, index, 'effective_date')"
            class="mb-2"
          />

          <v-btn
            v-if="form.taxes.length > 1"
            variant="text"
            color="error"
            class="text-none px-0"
            @click="removeTax(index)"
          >
            {{ t('setup.remove') }}
          </v-btn>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div class="d-flex flex-wrap ga-2">
      <v-btn variant="outlined" class="text-none" @click="addTax">
        {{ t('setup.addMore') }}
      </v-btn>
      <v-btn type="submit" color="primary" :loading="saving" class="text-none">
        {{ t('setup.saveContinue') }}
      </v-btn>
    </div>
  </v-form>
</template>

<script setup>
import { itemError, listError } from "@/utils/setup/arrayFieldErrors";
import { createTax } from "@/utils/setup/setupDefaults";
import {
  hasErrors,
  validateTaxesForm,
} from "@/utils/validation/SetupValidation";

const props = defineProps({
  draft: { type: Object, default: null },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["save"]);
const { t } = useAppLocale();

const errors = ref({});
const openPanel = ref(0);

const form = reactive({
  taxes: [createTax(0)],
});

function panelTitle(index, tax) {
  const label = tax.tax_code || tax.name_en || tax.name_ar;

  return label
    ? t("setup.taxNumberNamed", { n: index + 1, name: label })
    : t("setup.taxNumber", { n: index + 1 });
}

function applyDraft(draft) {
  if (Array.isArray(draft?.taxes) && draft.taxes.length) {
    form.taxes = draft.taxes.map((tax) => ({ ...tax }));
    openPanel.value = 0;
    return;
  }

  form.taxes = [createTax(0)];
  openPanel.value = 0;
}

watch(() => props.draft, applyDraft, { immediate: true });

function addTax() {
  form.taxes.push(createTax(form.taxes.length));
  openPanel.value = form.taxes.length - 1;
}

function removeTax(index) {
  form.taxes.splice(index, 1);
  if (openPanel.value === index) {
    openPanel.value = Math.max(0, index - 1);
  } else if (openPanel.value > index) {
    openPanel.value--;
  }
}

function submit() {
  errors.value = validateTaxesForm(form.taxes, t);
  if (hasErrors(errors.value)) return;

  emit("save", {
    taxes: form.taxes.map((tax) => ({ ...tax })),
  });
}
</script>
