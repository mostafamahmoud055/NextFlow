<template>
  <div class="user-management">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4 mb-md-6">
      <div>
        <p class="text-body-2 text-medium-emphasis mb-1">
          {{ t('navigation.accessControl') }}
        </p>
        <h1 class="text-h4 font-weight-bold text-high-emphasis dashboard-page-title">
          {{ t('navigation.userManagement') }}
        </h1>
      </div>

      <v-btn
        v-if="canCreate"
        color="primary"
        class="text-none"
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        {{ t('user.create') }}
      </v-btn>
    </div>

    <v-card class="dashboard-card user-toolbar mb-4" elevation="0">
      <v-row density="comfortable" align="center">
        <v-col cols="12" md="4">
          <ListSearchField v-model="search" @search="applyFilters" />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="status"
            :items="statusItems"
            item-title="title"
            item-value="value"
            :label="t('user.status')"
            clearable
            variant="outlined"
            hide-details
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="loginStatus"
            :items="loginStatusItems"
            item-title="title"
            item-value="value"
            :label="t('user.loginStatus')"
            clearable
            variant="outlined"
            hide-details
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" md="2" class="d-flex justify-end">
          <v-btn
            variant="tonal"
            class="text-none"
            prepend-icon="mdi-filter-outline"
            @click="applyFilters"
          >
            {{ t('user.applyFilters') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="dashboard-card" elevation="0">
      <div v-if="store.loading && !store.items.length" class="d-flex justify-center py-12">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <div
        v-else-if="!store.items.length"
        class="text-center text-medium-emphasis py-12"
      >
        <v-icon size="40" class="mb-3">mdi-account-group-outline</v-icon>
        <div>{{ t('user.empty') }}</div>
      </div>

      <template v-else>
        <v-table class="user-table">
          <thead>
            <tr>
              <th>{{ t('user.user') }}</th>
              <th class="d-none d-md-table-cell">{{ t('user.roles') }}</th>
              <th>{{ t('user.status') }}</th>
              <th class="d-none d-lg-table-cell">{{ t('user.loginStatus') }}</th>
              <th class="text-end">{{ t('user.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in store.items" :key="user.id">
              <td>
                <div class="d-flex align-center ga-3 py-2">
                  <v-avatar size="40" color="surface-bright">
                    <v-img v-if="user.avatar" :src="user.avatar" :alt="displayName(user)" />
                    <span v-else class="text-caption font-weight-bold">
                      {{ initials(displayName(user)) }}
                    </span>
                  </v-avatar>
                  <div class="min-width-0">
                    <div class="font-weight-medium text-truncate">{{ displayName(user) }}</div>
                    <div class="text-caption text-medium-emphasis text-truncate">
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="d-none d-md-table-cell text-medium-emphasis">
                {{ rolesLabel(user) || '—' }}
              </td>
              <td>
                <v-chip
                  size="small"
                  :color="isActive(user) ? 'success' : 'secondary'"
                  variant="tonal"
                >
                  {{
                    isActive(user) ? t('user.statusActive') : t('user.statusInactive')
                  }}
                </v-chip>
              </td>
              <td class="d-none d-lg-table-cell">
                <v-chip
                  size="small"
                  :color="isLocked(user) ? 'error' : 'success'"
                  variant="tonal"
                >
                  {{
                    isLocked(user) ? t('user.loginLocked') : t('user.loginUnlocked')
                  }}
                </v-chip>
              </td>
              <td class="text-end">
                <v-menu location="bottom end">
                  <template #activator="{ props: menuProps }">
                    <v-btn
                      v-bind="menuProps"
                      icon
                      variant="text"
                      size="small"
                      :aria-label="t('user.actions')"
                    >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>

                  <v-list density="compact" min-width="220">
                    <v-list-item
                      v-if="canUpdate"
                      prepend-icon="mdi-pencil-outline"
                      :title="t('buttons.edit')"
                      :disabled="actionLoading"
                      @click="openEdit(user)"
                    />
                    <v-list-item
                      v-if="canAssignRoles"
                      prepend-icon="mdi-account-key-outline"
                      :title="t('user.assignRoles')"
                      :disabled="actionLoading"
                      @click="openAssignRoles(user)"
                    />
                    <v-list-item
                      v-if="canResetPassword"
                      prepend-icon="mdi-lock-reset"
                      :title="t('user.resetPassword')"
                      :disabled="actionLoading"
                      @click="openResetPassword(user)"
                    />
                    <v-list-item
                      v-if="canViewActivity"
                      prepend-icon="mdi-history"
                      :title="t('user.viewActivity')"
                      :disabled="actionLoading"
                      @click="openActivity(user)"
                    />
                    <v-list-item
                      v-if="canActivate && !isActive(user)"
                      prepend-icon="mdi-check-circle-outline"
                      :title="t('user.activate')"
                      :disabled="actionLoading"
                      @click="toggleStatus(user, true)"
                    />
                    <v-list-item
                      v-if="canDeactivate && isActive(user)"
                      prepend-icon="mdi-cancel"
                      :title="t('user.deactivate')"
                      :disabled="actionLoading"
                      @click="toggleStatus(user, false)"
                    />
                    <v-list-item
                      v-if="canLock && !isLocked(user)"
                      prepend-icon="mdi-lock-outline"
                      :title="t('user.lock')"
                      :disabled="actionLoading"
                      @click="toggleLock(user, true)"
                    />
                    <v-list-item
                      v-if="canUnlock && isLocked(user)"
                      prepend-icon="mdi-lock-open-outline"
                      :title="t('user.unlock')"
                      :disabled="actionLoading"
                      @click="toggleLock(user, false)"
                    />
                    <v-list-item
                      v-if="canDelete"
                      prepend-icon="mdi-delete-outline"
                      :title="t('buttons.delete')"
                      class="text-error"
                      :disabled="actionLoading"
                      @click="confirmDelete(user)"
                    />
                  </v-list>
                </v-menu>
              </td>
            </tr>
          </tbody>
        </v-table>

        <div
          v-if="store.meta.last_page > 1"
          class="d-flex justify-center pt-4 pb-2"
        >
          <v-pagination
            :model-value="page"
            :length="store.meta.last_page"
            :disabled="store.loading"
            :total-visible="7"
            density="comfortable"
            @update:model-value="onPageChange"
          />
        </div>
      </template>
    </v-card>

    <UserFormDialog
      v-model="formOpen"
      :user="editingUser"
      :saving="store.saving || actionLoading"
      :role-options="rolesStore.roleOptions"
      :roles-loading="rolesLoading"
      @submit="handleFormSubmit"
    />

    <v-dialog v-model="rolesOpen" max-width="520">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('user.assignRolesTitle') }}
        </v-card-title>
        <v-card-subtitle v-if="activeUser" class="pb-2">
          {{ displayName(activeUser) }}
        </v-card-subtitle>
        <v-card-text>
          <v-select
            v-model="selectedRoles"
            :items="roleItems"
            item-title="title"
            item-value="value"
            :label="t('user.roles')"
            :error-messages="roleErrors.roles"
            :loading="rolesLoading"
            multiple
            chips
            closable-chips
            variant="outlined"
            hide-details="auto"
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            class="text-none"
            :disabled="store.saving"
            @click="rolesOpen = false"
          >
            {{ t('buttons.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            class="text-none"
            :loading="store.saving"
            :disabled="!selectedRoles.length"
            @click="handleAssignRoles"
          >
            {{ t('buttons.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="passwordOpen" max-width="480">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('user.resetPasswordTitle') }}
        </v-card-title>
        <v-card-subtitle v-if="activeUser" class="pb-2">
          {{ displayName(activeUser) }}
        </v-card-subtitle>
        <v-card-text>
          <v-text-field
            v-model="passwordForm.password"
            :label="t('user.password')"
            :type="showPassword ? 'text' : 'password'"
            :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            autocomplete="new-password"
            :error-messages="passwordErrors.password"
            class="mb-2"
            hide-details="auto"
            @click:append-inner="showPassword = !showPassword"
          />
          <v-text-field
            v-model="passwordForm.password_confirmation"
            :label="t('user.passwordConfirmation')"
            :type="showPasswordConfirm ? 'text' : 'password'"
            :append-inner-icon="showPasswordConfirm ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            autocomplete="new-password"
            :error-messages="passwordErrors.password_confirmation"
            hide-details="auto"
            @click:append-inner="showPasswordConfirm = !showPasswordConfirm"
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            class="text-none"
            :disabled="store.saving"
            @click="passwordOpen = false"
          >
            {{ t('buttons.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            class="text-none"
            :loading="store.saving"
            @click="handleResetPassword"
          >
            {{ t('user.resetPassword') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="activityOpen" max-width="720" scrollable>
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('user.activityTitle') }}
        </v-card-title>
        <v-card-subtitle v-if="activeUser" class="pb-2">
          {{ displayName(activeUser) }}
        </v-card-subtitle>
        <v-card-text>
          <div v-if="store.activityLoading" class="d-flex justify-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <div
            v-else-if="!store.activityItems.length"
            class="text-center text-medium-emphasis py-6"
          >
            {{ t('user.activityEmpty') }}
          </div>
          <v-list v-else density="comfortable">
            <v-list-item
              v-for="log in store.activityItems"
              :key="log.id"
              :title="log.description || log.action_type || '—'"
              :subtitle="activitySubtitle(log)"
            />
          </v-list>
          <div
            v-if="store.activityMeta.last_page > 1"
            class="d-flex justify-center pt-4 pb-2"
          >
            <v-pagination
              :model-value="activityPage"
              :length="store.activityMeta.last_page"
              :disabled="store.activityLoading"
              :total-visible="7"
              density="comfortable"
              @update:model-value="onActivityPageChange"
            />
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" class="text-none" @click="activityOpen = false">
            {{ t('buttons.cancel') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteOpen" max-width="440">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('user.deleteTitle') }}
        </v-card-title>
        <v-card-text class="text-medium-emphasis">
          {{ t('user.deleteConfirm', { name: deleteTargetName }) }}
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" class="text-none" @click="deleteOpen = false">
            {{ t('buttons.cancel') }}
          </v-btn>
          <v-btn
            color="error"
            class="text-none"
            :loading="actionLoading"
            @click="handleDelete"
          >
            {{ t('buttons.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import UserFormDialog from "~/components/user/UserFormDialog.vue";
import {
  USER_LOGIN_STATUSES,
  USER_STATUSES,
  userDisplayName,
  userRoleNames,
} from "~/utils/userConstants";
import { useSnackbar } from "~/composables/useSnackbar";

definePageMeta({
  middleware: ["auth", "tenant", "permission"],
  permission: "users.view",
});

const { t, locale } = useAppLocale();
const { hasPermission } = usePermissions();
const { showSnackbar } = useSnackbar();
const store = useUsersStore();
const rolesStore = useRolesStore();

useHead({
  title: () => t("navigation.userManagement"),
});

const canCreate = computed(() => hasPermission("users.create"));
const canUpdate = computed(() => hasPermission("users.update"));
const canDelete = computed(() => hasPermission("users.delete"));
const canActivate = computed(() => hasPermission("users.activate"));
const canDeactivate = computed(() => hasPermission("users.deactivate"));
const canLock = computed(() => hasPermission("users.lock"));
const canUnlock = computed(() => hasPermission("users.unlock"));
const canAssignRoles = computed(() => hasPermission("users.assign_roles"));
const canResetPassword = computed(() => hasPermission("users.reset_password"));
const canViewActivity = computed(() => hasPermission("users.view_activity"));

const search = ref("");
const status = ref(null);
const loginStatus = ref(null);
const page = ref(1);
const actionLoading = ref(false);
const rolesLoading = ref(false);

const formOpen = ref(false);
const editingUser = ref(null);

const rolesOpen = ref(false);
const selectedRoles = ref([]);
const roleErrors = reactive({});

const passwordOpen = ref(false);
const passwordForm = reactive({ password: "", password_confirmation: "" });
const passwordErrors = reactive({});
const showPassword = ref(false);
const showPasswordConfirm = ref(false);

const activityOpen = ref(false);
const activityPage = ref(1);

const activeUser = ref(null);
const deleteOpen = ref(false);
const deletingUser = ref(null);

const deleteTargetName = computed(() =>
  displayName(deletingUser.value),
);

const statusItems = computed(() =>
  USER_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const loginStatusItems = computed(() =>
  USER_LOGIN_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const roleItems = computed(() =>
  rolesStore.roleOptions.map((role) => ({
    value: role.id,
    title: role.name || role.code,
  })),
);

function displayName(user) {
  return userDisplayName(user, locale.value);
}

function initials(name) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function isActive(user) {
  return user?.status === "active";
}

function isLocked(user) {
  return user?.login_status === "locked";
}

function rolesLabel(user) {
  return userRoleNames(user, locale.value);
}

function activitySubtitle(log) {
  const parts = [log.module, log.created_at].filter(Boolean);
  return parts.join(" · ") || undefined;
}

async function ensureRoleOptions() {
  rolesLoading.value = true;
  try {
    await rolesStore.fetchRoleOptions();
  } finally {
    rolesLoading.value = false;
  }
}

async function loadPage(nextPage = page.value, force = false) {
  const target = Number(nextPage) || 1;
  page.value = target;
  await store.fetchList(target, force);
  page.value = store.meta.current_page || target;
}

async function onPageChange(nextPage) {
  if (store.loading) return;
  if (Number(nextPage) === Number(page.value)) return;
  await loadPage(nextPage, true);
}

function applyFilters() {
  store.setFilters({
    search: search.value?.trim() || "",
    status: status.value || null,
    login_status: loginStatus.value || null,
  });
  loadPage(1, true);
}

async function openCreate() {
  editingUser.value = null;
  await ensureRoleOptions();
  formOpen.value = true;
}

function openEdit(user) {
  editingUser.value = user;
  formOpen.value = true;
}


async function handleFormSubmit({ payload, applyServerErrors }) {
  actionLoading.value = true;
  try {
    if (editingUser.value?.id) {
      const { error } = await store.update(editingUser.value.id, payload);
      if (error) {
        applyServerErrors(error.errors);
        return;
      }
      showSnackbar(t("user.updated"), 200);
    } else {
      const { error } = await store.create(payload);
      if (error) {
        applyServerErrors(error.errors);
        return;
      }
      showSnackbar(t("user.created"), 200);
    }
    formOpen.value = false;
    editingUser.value = null;
  } finally {
    actionLoading.value = false;
  }
}

async function openAssignRoles(user) {
  activeUser.value = user;
  selectedRoles.value = (user.roles || []).map((role) => role.id).filter(Boolean);
  Object.keys(roleErrors).forEach((key) => delete roleErrors[key]);
  rolesOpen.value = true;
  await ensureRoleOptions();
}

async function handleAssignRoles() {
  if (!activeUser.value?.id) return;
  Object.keys(roleErrors).forEach((key) => delete roleErrors[key]);

  const { error } = await store.assignRoles(activeUser.value.id, selectedRoles.value);
  if (error) {
    Object.entries(error.errors || {}).forEach(([key, value]) => {
      roleErrors[key] = Array.isArray(value) ? value : [String(value)];
    });
    return;
  }

  showSnackbar(t("user.rolesAssigned"), 200);
  rolesOpen.value = false;
}

function openResetPassword(user) {
  activeUser.value = user;
  passwordForm.password = "";
  passwordForm.password_confirmation = "";
  showPassword.value = false;
  showPasswordConfirm.value = false;
  Object.keys(passwordErrors).forEach((key) => delete passwordErrors[key]);
  passwordOpen.value = true;
}

async function handleResetPassword() {
  if (!activeUser.value?.id) return;
  Object.keys(passwordErrors).forEach((key) => delete passwordErrors[key]);

  if (!passwordForm.password) {
    passwordErrors.password = [t("forms.required")];
    return;
  }
  if (passwordForm.password !== passwordForm.password_confirmation) {
    passwordErrors.password_confirmation = [t("validation.confirmPassword.mismatch")];
    return;
  }

  const { error } = await store.resetPassword(activeUser.value.id, {
    password: passwordForm.password,
    password_confirmation: passwordForm.password_confirmation,
  });

  if (error) {
    Object.entries(error.errors || {}).forEach(([key, value]) => {
      passwordErrors[key] = Array.isArray(value) ? value : [String(value)];
    });
    return;
  }

  showSnackbar(t("user.passwordReset"), 200);
  passwordOpen.value = false;
}

async function openActivity(user) {
  activeUser.value = user;
  activityPage.value = 1;
  activityOpen.value = true;
  await store.fetchActivity(user.id, 1);
}

async function loadActivity(nextPage = activityPage.value) {
  if (!activeUser.value?.id) return;
  const target = Number(nextPage) || 1;
  activityPage.value = target;
  await store.fetchActivity(activeUser.value.id, target);
  activityPage.value = store.activityMeta.current_page || target;
}

async function onActivityPageChange(nextPage) {
  if (store.activityLoading) return;
  if (Number(nextPage) === Number(activityPage.value)) return;
  await loadActivity(nextPage);
}

async function toggleStatus(user, activate) {
  actionLoading.value = true;
  try {
    const result = activate
      ? await store.activate(user.id)
      : await store.deactivate(user.id);
    if (!result.error) {
      showSnackbar(activate ? t("user.activated") : t("user.deactivated"), 200);
    }
  } finally {
    actionLoading.value = false;
  }
}

async function toggleLock(user, shouldLock) {
  actionLoading.value = true;
  try {
    const result = shouldLock
      ? await store.lock(user.id)
      : await store.unlock(user.id);
    if (!result.error) {
      showSnackbar(shouldLock ? t("user.locked") : t("user.unlocked"), 200);
    }
  } finally {
    actionLoading.value = false;
  }
}

function confirmDelete(user) {
  deletingUser.value = user;
  deleteOpen.value = true;
}

async function handleDelete() {
  if (!deletingUser.value?.id) return;

  actionLoading.value = true;
  try {
    const { error } = await store.destroy(deletingUser.value.id);
    if (!error) {
      showSnackbar(t("user.deleted"), 200);
      deleteOpen.value = false;
      deletingUser.value = null;
    }
  } finally {
    actionLoading.value = false;
  }
}

onMounted(() => {
  search.value = store.filters.search || "";
  status.value = store.filters.status || null;
  loginStatus.value = store.filters.login_status || null;
  loadPage(store.meta.current_page || 1);
});
</script>

<style scoped>
.user-toolbar {
  padding-block: 20px !important;
}

.user-table :deep(th) {
  font-weight: 600 !important;
  color: rgba(var(--v-theme-on-surface), 0.55) !important;
  white-space: nowrap;
}

.user-table :deep(td) {
  border-bottom-color: rgba(var(--v-theme-on-surface), 0.06) !important;
}

.min-width-0 {
  min-width: 0;
}
</style>
