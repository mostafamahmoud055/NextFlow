<template>
  <v-dialog
    :model-value="modelValue"
    max-width="720"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="warehouse-form-card" rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
        <span class="text-h6 font-weight-bold">
          {{ isEdit ? t('warehouse.editTitle') : t('warehouse.createTitle') }}
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
                :label="t('warehouse.nameEn')"
                :error-messages="fieldErrors.name_en"
                :rules="[requiredRule]"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.name_ar"
                :label="t('warehouse.nameAr')"
                :error-messages="fieldErrors.name_ar"
                :rules="[requiredRule]"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.type"
                :items="typeItems"
                item-title="title"
                item-value="value"
                :label="t('warehouse.type')"
                :error-messages="fieldErrors.type"
                :rules="[requiredRule]"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="form.branch_id"
                :items="branchItems"
                item-title="title"
                item-value="value"
                :label="t('warehouse.branch')"
                :error-messages="fieldErrors.branch_id"
                :rules="[requiredRule]"
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
                :label="t('warehouse.status')"
                variant="outlined"
                :error-messages="fieldErrors.status"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.location"
                :label="t('warehouse.location')"
                :error-messages="fieldErrors.location"
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
          {{ isEdit ? t('buttons.save') : t('warehouse.create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {
  WAREHOUSE_STATUSES,
  WAREHOUSE_TYPES,
  emptyWarehouseForm,
  warehouseToForm,
} from "~/utils/warehouseConstants";
import { branchDisplayName } from "~/utils/branchConstants";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  warehouse: { type: Object, default: null },
  branchOptions: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const { t, locale } = useAppLocale();

const formRef = ref(null);
const form = reactive(emptyWarehouseForm());
const fieldErrors = reactive({});

const isEdit = computed(() => Boolean(props.warehouse?.id));

const statusItems = computed(() =>
  WAREHOUSE_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const typeItems = computed(() =>
  WAREHOUSE_TYPES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const branchItems = computed(() =>
  props.branchOptions.map((item) => ({
    value: item.id,
    title: branchDisplayName(item, locale.value),
  })),
);

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

function hydrate() {
  resetErrors();
  Object.assign(
    form,
    props.warehouse ? warehouseToForm(props.warehouse) : emptyWarehouseForm(),
  );
}

function close() {
  emit("update:modelValue", false);
}

function cleanPayload(payload) {
  const cleaned = {
    name_ar: payload.name_ar?.trim() || "",
    name_en: payload.name_en?.trim() || "",
    branch_id: payload.branch_id,
    type: payload.type,
    status: payload.status || "active",
    location: payload.location?.trim() || null,
    manager_id: payload.manager_id ?? null,
  };

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
.warehouse-form-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
</style>
