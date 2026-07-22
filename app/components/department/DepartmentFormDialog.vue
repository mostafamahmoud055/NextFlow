<template>
  <v-dialog
    :model-value="modelValue"
    max-width="720"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="department-form-card" rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
        <span class="text-h6 font-weight-bold">
          {{ isEdit ? t('department.editTitle') : t('department.createTitle') }}
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
                :label="t('department.nameEn')"
                :error-messages="fieldErrors.name_en"
                :rules="[requiredRule]"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.name_ar"
                :label="t('department.nameAr')"
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
                :label="t('department.parent')"
                :loading="parentsLoading"
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
                :label="t('department.branch')"
                :loading="branchesLoading"
                clearable
                variant="outlined"
                :error-messages="fieldErrors.branch_id"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="form.manager_id"
                :items="managerItems"
                item-title="title"
                item-value="value"
                :label="t('department.manager')"
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
                :label="t('department.status')"
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
          {{ isEdit ? t('buttons.save') : t('department.create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {
  DEPARTMENT_STATUSES,
  departmentDisplayName,
  departmentToForm,
  emptyDepartmentForm,
} from "~/utils/departmentConstants";
import { branchDisplayName } from "~/utils/branchConstants";
import { userDisplayName } from "~/utils/userConstants";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  department: { type: Object, default: null },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const { t, locale } = useAppLocale();
const branchesStore = useBranchesStore();
const departmentsStore = useDepartmentsStore();
const usersStore = useUsersStore();

const formRef = ref(null);
const form = reactive(emptyDepartmentForm());
const fieldErrors = reactive({});
const branches = ref([]);
const parents = ref([]);
const users = ref([]);
const branchesLoading = ref(false);
const parentsLoading = ref(false);
const usersLoading = ref(false);

const isEdit = computed(() => Boolean(props.department?.id));

const statusItems = computed(() =>
  DEPARTMENT_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const parentItems = computed(() =>
  parents.value
    .filter((item) => item.id !== props.department?.id)
    .map((item) => ({
      value: item.id,
      title: departmentDisplayName(item, locale.value),
    })),
);

const branchItems = computed(() =>
  branches.value.map((item) => ({
    value: item.id,
    title: branchDisplayName(item, locale.value),
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
    props.department ? departmentToForm(props.department) : emptyDepartmentForm(),
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

async function loadParents() {
  parentsLoading.value = true;
  try {
    const { items, error } = await departmentsStore.fetchAll();
    if (!error) parents.value = items;
  } finally {
    parentsLoading.value = false;
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
    branch_id: payload.branch_id ?? null,
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
    loadParents();
    loadBranches();
    loadUsers();
  },
);

defineExpose({ applyServerErrors });
</script>

<style scoped>
.department-form-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
</style>
