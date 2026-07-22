<template>
  <v-dialog
    :model-value="modelValue"
    max-width="720"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="cost-center-form-card" rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
        <span class="text-h6 font-weight-bold">
          {{ isEdit ? t('costCenter.editTitle') : t('costCenter.createTitle') }}
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
                :label="t('costCenter.nameEn')"
                :error-messages="fieldErrors.name_en"
                :rules="[requiredRule]"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.name_ar"
                :label="t('costCenter.nameAr')"
                :error-messages="fieldErrors.name_ar"
                :rules="[requiredRule]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="form.parent_id"
                :items="parentItems"
                item-title="title"
                item-value="value"
                :label="t('costCenter.parent')"
                clearable
                variant="outlined"
                :error-messages="fieldErrors.parent_id"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.branch_id"
                :items="branchItems"
                item-title="title"
                item-value="value"
                :label="t('costCenter.branch')"
                :loading="branchesLoading"
                clearable
                variant="outlined"
                :error-messages="fieldErrors.branch_id"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="form.department_id"
                :items="departmentItems"
                item-title="title"
                item-value="value"
                :label="t('costCenter.department')"
                clearable
                variant="outlined"
                :error-messages="fieldErrors.department_id"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.warehouse_id"
                :items="warehouseItems"
                item-title="title"
                item-value="value"
                :label="t('costCenter.warehouse')"
                :loading="warehousesLoading"
                clearable
                variant="outlined"
                :error-messages="fieldErrors.warehouse_id"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="form.manager_id"
                :items="managerItems"
                item-title="title"
                item-value="value"
                :label="t('costCenter.manager')"
                :loading="usersLoading"
                clearable
                variant="outlined"
                :error-messages="fieldErrors.manager_id"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.status"
                :items="statusItems"
                item-title="title"
                item-value="value"
                :label="t('costCenter.status')"
                variant="outlined"
                :error-messages="fieldErrors.status"
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <div
            v-if="fieldErrors.form?.length"
            class="text-error text-caption mt-2"
          >
            {{ fieldErrors.form[0] }}
          </div>
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
          {{ isEdit ? t('buttons.save') : t('costCenter.create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {
  COST_CENTER_STATUSES,
  costCenterDisplayName,
  costCenterToForm,
  emptyCostCenterForm,
} from "~/utils/costCenterConstants";
import { branchDisplayName } from "~/utils/branchConstants";
import { departmentDisplayName } from "~/utils/departmentConstants";
import { warehouseDisplayName } from "~/utils/warehouseConstants";
import { userDisplayName } from "~/utils/userConstants";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  costCenter: { type: Object, default: null },
  parentOptions: { type: Array, default: () => [] },
  departmentOptions: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const { t, locale } = useAppLocale();
const branchesStore = useBranchesStore();
const warehousesStore = useWarehousesStore();
const usersStore = useUsersStore();

const formRef = ref(null);
const form = reactive(emptyCostCenterForm());
const fieldErrors = reactive({});
const branches = ref([]);
const warehouses = ref([]);
const users = ref([]);
const branchesLoading = ref(false);
const warehousesLoading = ref(false);
const usersLoading = ref(false);

const isEdit = computed(() => Boolean(props.costCenter?.id));

const statusItems = computed(() =>
  COST_CENTER_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const parentItems = computed(() =>
  props.parentOptions
    .filter((item) => item.id !== props.costCenter?.id)
    .map((item) => ({
      value: item.id,
      title: costCenterDisplayName(item, locale.value),
    })),
);

const branchItems = computed(() =>
  branches.value.map((item) => ({
    value: item.id,
    title: branchDisplayName(item, locale.value),
  })),
);

const departmentItems = computed(() =>
  props.departmentOptions.map((item) => ({
    value: item.id,
    title: departmentDisplayName(item, locale.value),
  })),
);

const warehouseItems = computed(() =>
  warehouses.value.map((item) => ({
    value: item.id,
    title: warehouseDisplayName(item, locale.value),
  })),
);

const managerItems = computed(() =>
  users.value.map((user) => ({
    value: user.id,
    title: userDisplayName(user, locale.value),
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
    props.costCenter ? costCenterToForm(props.costCenter) : emptyCostCenterForm(),
  );
}

async function loadBranches() {
  branchesLoading.value = true;
  try {
    const { items, error } = await branchesStore.fetchAll();
    if (!error) branches.value = items;
  } finally {
    branchesLoading.value = false;
  }
}

async function loadWarehouses() {
  warehousesLoading.value = true;
  try {
    const { items, error } = await warehousesStore.fetchAll();
    if (!error) warehouses.value = items;
  } finally {
    warehousesLoading.value = false;
  }
}

async function loadUsers() {
  usersLoading.value = true;
  try {
    const { items, error } = await usersStore.fetchAll();
    if (!error) users.value = items;
  } finally {
    usersLoading.value = false;
  }
}

function close() {
  emit("update:modelValue", false);
}

function cleanPayload(payload) {
  return {
    name_ar: payload.name_ar?.trim() || "",
    name_en: payload.name_en?.trim() || "",
    status: payload.status || "active",
    parent_id: payload.parent_id ?? null,
    department_id: payload.department_id ?? null,
    branch_id: payload.branch_id ?? null,
    warehouse_id: payload.warehouse_id ?? null,
    manager_id: payload.manager_id ?? null,
  };
}

async function submit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  const payload = cleanPayload({ ...form });

  if (!payload.branch_id && !payload.department_id && !payload.warehouse_id) {
    fieldErrors.form = [t("costCenter.orgLinkRequired")];
    return;
  }

  emit("submit", {
    payload,
    applyServerErrors,
  });
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    hydrate();
    loadBranches();
    loadWarehouses();
    loadUsers();
  },
);

defineExpose({ applyServerErrors });
</script>

<style scoped>
.cost-center-form-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
</style>
