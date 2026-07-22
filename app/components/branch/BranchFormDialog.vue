<template>
  <v-dialog
    :model-value="modelValue"
    max-width="720"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="branch-form-card" rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
        <span class="text-h6 font-weight-bold">
          {{ isEdit ? t('branch.editTitle') : t('branch.createTitle') }}
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
                :label="t('branch.nameEn')"
                :error-messages="fieldErrors.name_en"
                :rules="[requiredRule]"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.name_ar"
                :label="t('branch.nameAr')"
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
                :label="t('branch.type')"
                :error-messages="fieldErrors.type"
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
                :label="t('branch.status')"
                variant="outlined"
                :error-messages="fieldErrors.status"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.manager_id"
                :items="managerItems"
                item-title="title"
                item-value="value"
                :label="t('branch.manager')"
                :loading="usersLoading"
                clearable
                variant="outlined"
                :error-messages="fieldErrors.manager_id"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.phone"
                :label="t('branch.phone')"
                :error-messages="fieldErrors.phone"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.mobile"
                :label="t('branch.mobile')"
                :error-messages="fieldErrors.mobile"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.email"
                :label="t('branch.email')"
                type="email"
                :error-messages="fieldErrors.email"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.country"
                :label="t('branch.country')"
                :error-messages="fieldErrors.country"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.city"
                :label="t('branch.city')"
                :error-messages="fieldErrors.city"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.postal_code"
                :label="t('branch.postalCode')"
                :error-messages="fieldErrors.postal_code"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.address"
                :label="t('branch.address')"
                :error-messages="fieldErrors.address"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.notes"
                :label="t('branch.notes')"
                :error-messages="fieldErrors.notes"
                rows="3"
                auto-grow
                variant="outlined"
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
          {{ isEdit ? t('buttons.save') : t('branch.create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {
  BRANCH_STATUSES,
  BRANCH_TYPES,
  branchToForm,
  emptyBranchForm,
} from "~/utils/branchConstants";
import { userDisplayName } from "~/utils/userConstants";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  branch: {
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
const usersStore = useUsersStore();

const formRef = ref(null);
const form = reactive(emptyBranchForm());
const fieldErrors = reactive({});
const users = ref([]);
const usersLoading = ref(false);

const isEdit = computed(() => Boolean(props.branch?.id));

const typeItems = computed(() =>
  BRANCH_TYPES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const statusItems = computed(() =>
  BRANCH_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
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
  Object.assign(form, props.branch ? branchToForm(props.branch) : emptyBranchForm());
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
  const cleaned = {};

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "manager_id") {
      cleaned[key] = value ?? null;
      return;
    }
    if (value === null || value === undefined) return;
    if (typeof value === "string" && value.trim() === "") return;
    cleaned[key] = typeof value === "string" ? value.trim() : value;
  });

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
    if (!open) return;
    hydrate();
    loadUsers();
  },
);

defineExpose({ applyServerErrors });
</script>

<style scoped>
.branch-form-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
</style>
