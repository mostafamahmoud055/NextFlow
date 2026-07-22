<template>
  <v-dialog
    :model-value="modelValue"
    max-width="520"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="branch-assign-card" rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
        <span class="text-h6 font-weight-bold">
          {{ t('branch.assignEmployeesTitle') }}
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
        <div v-if="branchName" class="text-medium-emphasis mb-4">
          {{ branchName }}
        </div>

        <v-select
          v-model="selectedIds"
          :items="userItems"
          item-title="title"
          item-value="value"
          :label="t('branch.employees')"
          :loading="usersLoading"
          :error-messages="fieldErrors.user_ids"
          multiple
          chips
          closable-chips
          clearable
          variant="outlined"
          hide-details="auto"
        />
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
          {{ t('branch.assignEmployees') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { branchDisplayName } from "~/utils/branchConstants";
import { userDisplayName } from "~/utils/userConstants";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  branch: { type: Object, default: null },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const { t, locale } = useAppLocale();
const usersStore = useUsersStore();

const selectedIds = ref([]);
const users = ref([]);
const usersLoading = ref(false);
const fieldErrors = reactive({});

const branchName = computed(() =>
  props.branch ? branchDisplayName(props.branch, locale.value) : "",
);

const userItems = computed(() =>
  users.value.map((user) => ({
    value: user.id,
    title: userDisplayName(user, locale.value),
  })),
);

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
  selectedIds.value = Array.isArray(props.branch?.employee_ids)
    ? [...props.branch.employee_ids]
    : [];
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

function submit() {
  emit("submit", {
    userIds: [...selectedIds.value],
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
.branch-assign-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
</style>
