<template>
  <v-dialog
    :model-value="modelValue"
    max-width="720"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="profit-center-form-card" rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
        <span class="text-h6 font-weight-bold">
          {{ isEdit ? t('profitCenter.editTitle') : t('profitCenter.createTitle') }}
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
                :label="t('profitCenter.nameEn')"
                :error-messages="fieldErrors.name_en"
                :rules="[requiredRule]"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.name_ar"
                :label="t('profitCenter.nameAr')"
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
                :label="t('profitCenter.parent')"
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
                :label="t('profitCenter.branch')"
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
                :label="t('profitCenter.department')"
                clearable
                variant="outlined"
                :error-messages="fieldErrors.department_id"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.product_category_id"
                :label="t('profitCenter.productCategory')"
                type="number"
                min="1"
                clearable
                :error-messages="fieldErrors.product_category_id"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="form.manager_id"
                :items="managerItems"
                item-title="title"
                item-value="value"
                :label="t('profitCenter.manager')"
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
                :label="t('profitCenter.status')"
                variant="outlined"
                :error-messages="fieldErrors.status"
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
          {{ isEdit ? t('buttons.save') : t('profitCenter.create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {
  PROFIT_CENTER_STATUSES,
  profitCenterDisplayName,
  profitCenterToForm,
  emptyProfitCenterForm,
} from "~/utils/profitCenterConstants";
import { branchDisplayName } from "~/utils/branchConstants";
import { departmentDisplayName } from "~/utils/departmentConstants";
import { userDisplayName } from "~/utils/userConstants";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  profitCenter: { type: Object, default: null },
  parentOptions: { type: Array, default: () => [] },
  departmentOptions: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const { t, locale } = useAppLocale();
const branchesStore = useBranchesStore();
const usersStore = useUsersStore();

const formRef = ref(null);
const form = reactive(emptyProfitCenterForm());
const fieldErrors = reactive({});
const branches = ref([]);
const users = ref([]);
const branchesLoading = ref(false);
const usersLoading = ref(false);

const isEdit = computed(() => Boolean(props.profitCenter?.id));

const statusItems = computed(() =>
  PROFIT_CENTER_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const parentItems = computed(() =>
  props.parentOptions
    .filter((item) => item.id !== props.profitCenter?.id)
    .map((item) => ({
      value: item.id,
      title: profitCenterDisplayName(item, locale.value),
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
    props.profitCenter
      ? profitCenterToForm(props.profitCenter)
      : emptyProfitCenterForm(),
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
    product_category_id: payload.product_category_id || null,
    manager_id: payload.manager_id ?? null,
  };
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
    if (!open) return;
    hydrate();
    loadBranches();
    loadUsers();
  },
);

defineExpose({ applyServerErrors });
</script>

<style scoped>
.profit-center-form-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
</style>
