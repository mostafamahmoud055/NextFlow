<template>
  <v-form @submit.prevent="submit">
    <v-alert
      v-if="listError(errors, 'warehouses').length"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-4"
    >
      {{ listError(errors, 'warehouses')[0] }}
    </v-alert>

    <v-expansion-panels v-model="openPanel" multiple class="mb-4">
      <v-expansion-panel
        v-for="(warehouse, index) in form.warehouses"
        :key="index"
      >
        <v-expansion-panel-title>
          {{ panelTitle(index, warehouse) }}
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <v-text-field
            v-model="warehouse.name_en"
            :label="t('setup.nameEn')"
            :error-messages="itemError(errors, index, 'name_en')"
            class="mb-2"
          />
          <v-text-field
            v-model="warehouse.name_ar"
            :label="t('setup.nameAr')"
            :error-messages="itemError(errors, index, 'name_ar')"
            class="mb-2"
          />

          <v-skeleton-loader v-if="branchesLoading" type="list-item" class="mb-2" />

          <v-select
            v-else
            v-model="warehouse.branch_id"
            :items="localizedBranches"
            :label="t('setup.branchName')"
            :error-messages="itemError(errors, index, 'branch_id')"
            item-title="display_name"
            item-value="id"
            class="mb-2"
          />
          <v-select
            v-model="warehouse.type"
            :items="warehouseTypes"
            :label="t('setup.warehouseType')"
            :error-messages="itemError(errors, index, 'type')"
            item-title="title"
            item-value="value"
            class="mb-2"
          />

          <v-btn
            v-if="form.warehouses.length > 1"
            variant="text"
            color="error"
            class="text-none px-0"
            @click="removeWarehouse(index)"
          >
            {{ t('setup.remove') }}
          </v-btn>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div class="d-flex flex-wrap ga-2">
      <v-btn variant="outlined" class="text-none" @click="addWarehouse">
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
import { createWarehouse } from "@/utils/setup/setupDefaults";
import {
  hasErrors,
  SETUP_WAREHOUSE_TYPES,
  validateWarehousesForm,
} from "@/utils/validation/SetupValidation";

const props = defineProps({
  draft: { type: Object, default: null },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["save"]);
const { locale, t } = useAppLocale();
const { fetchApi } = useApi();

const errors = ref({});
const openPanel = ref([0]);
const warehouseTypes = computed(() =>
  SETUP_WAREHOUSE_TYPES.map((type) => ({
    value: type,
    title: t(`setup.warehouseTypes.${type}`, type),
  })),
);
const branches = ref([]);
const branchesLoading = ref(false);

const localizedBranches = computed(() =>
  branches.value.map((branch) => ({
    ...branch,
    display_name: locale.value === "ar"
      ? (branch.name_ar)
      : (branch.name_en),
  })),
);

const form = reactive({
  warehouses: [createWarehouse(0)],
});

function panelTitle(index, warehouse) {
  const label = locale.value === "ar"
    ? (warehouse.name_ar || warehouse.name_en)
    : (warehouse.name_en || warehouse.name_ar);

  return label
    ? t("setup.warehouseNumberNamed", { n: index + 1, name: label })
    : t("setup.warehouseNumber", { n: index + 1 });
}

function applyDraft(draft) {
  if (Array.isArray(draft?.warehouses) && draft.warehouses.length) {
    form.warehouses = draft.warehouses.map((warehouse) => ({ ...warehouse }));
    openPanel.value = form.warehouses.map((_, index) => index);
    return;
  }

  form.warehouses = [createWarehouse(0)];
  openPanel.value = [0];
}

watch(() => props.draft, applyDraft, { immediate: true });

async function loadOptions() {
  branchesLoading.value = true;
  const result = await fetchApi("/setup/branches/options", {
    tenant: true,
    silent: true,
  });
  const data = result.data?.data ?? result.data ?? {};
  if (Array.isArray(data)) {
    branches.value = data;
  } else if (Array.isArray(data.items)) {
    branches.value = data.items;
  } else {
    branches.value = Array.isArray(data.branches) ? data.branches : [];
  }
  branchesLoading.value = false;
}

onMounted(loadOptions);

function addWarehouse() {
  form.warehouses.push(createWarehouse(form.warehouses.length));
  openPanel.value = [...openPanel.value, form.warehouses.length - 1];
}

function removeWarehouse(index) {
  form.warehouses.splice(index, 1);
  openPanel.value = form.warehouses.map((_, itemIndex) => itemIndex);
}

function submit() {
  errors.value = validateWarehousesForm(form.warehouses, t);
  if (hasErrors(errors.value)) return;

  emit("save", {
    warehouses: form.warehouses.map((warehouse) => ({ ...warehouse })),
  });
}
</script>
