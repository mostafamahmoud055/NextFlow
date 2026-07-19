<template>
  <div class="role-management">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4 mb-md-6">
      <div>
        <p class="text-body-2 text-medium-emphasis mb-1">
          {{ t('navigation.accessControl') }}
        </p>
        <h1 class="text-h4 font-weight-bold text-high-emphasis dashboard-page-title">
          {{ t('navigation.rolesManagement') }}
        </h1>
      </div>

      <v-btn
        v-if="canCreate"
        color="primary"
        class="text-none"
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        {{ t('role.create') }}
      </v-btn>
    </div>

    <v-card class="dashboard-card role-toolbar mb-4" elevation="0">
      <v-row density="comfortable" align="center">
        <v-col cols="12" md="5">
          <ListSearchField v-model="search" @search="applyFilters" />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="isActive"
            :items="statusItems"
            item-title="title"
            item-value="value"
            :label="t('role.status')"
            clearable
            variant="outlined"
            hide-details
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3" class="d-flex justify-end">
          <v-btn
            variant="tonal"
            class="text-none"
            prepend-icon="mdi-filter-outline"
            @click="applyFilters"
          >
            {{ t('role.applyFilters') }}
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
        <v-icon size="40" class="mb-3">mdi-account-key-outline</v-icon>
        <div>{{ t('role.empty') }}</div>
      </div>

      <template v-else>
        <v-table class="role-table">
          <thead>
            <tr>
              <th>{{ t('role.role') }}</th>
              <th class="d-none d-md-table-cell">{{ t('role.code') }}</th>
              <th class="d-none d-lg-table-cell">{{ t('role.users') }}</th>
              <th class="d-none d-lg-table-cell">{{ t('role.permissions') }}</th>
              <!-- <th>{{ t('role.status') }}</th> -->
              <th class="text-end">{{ t('role.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in store.items" :key="role.id">
              <td>
                <div class="font-weight-medium py-2">{{ displayName(role) }}</div>
                <div
                  v-if="role.description"
                  class="text-caption text-medium-emphasis text-truncate"
                  style="max-width: 280px"
                >
                  {{ role.description }}
                </div>
              </td>
              <td class="d-none d-md-table-cell text-medium-emphasis">
                {{ role.role_code || '—' }}
              </td>
              <td class="d-none d-lg-table-cell text-medium-emphasis">
                {{ role.users_count ?? 0 }}
              </td>
              <td class="d-none d-lg-table-cell text-medium-emphasis">
                {{ (role.permissions || []).length }}
              </td>
              <!-- <td>
                <v-chip
                  size="small"
                  :color="isRoleActive(role) ? 'success' : 'secondary'"
                  variant="tonal"
                >
                  {{
                    isRoleActive(role)
                      ? t('role.statusActive')
                      : t('role.statusInactive')
                  }}
                </v-chip>
              </td> -->
              <td class="text-end">
                <v-menu location="bottom end">
                  <template #activator="{ props: menuProps }">
                    <v-btn
                      v-bind="menuProps"
                      icon
                      variant="text"
                      size="small"
                      :aria-label="t('role.actions')"
                    >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>

                  <v-list density="compact" min-width="220">
                    <v-list-item
                      v-if="canView"
                      prepend-icon="mdi-eye-outline"
                      :title="t('role.view')"
                      :disabled="actionLoading"
                      @click="openView(role)"
                    />
                    <v-list-item
                      v-if="canUpdate"
                      prepend-icon="mdi-pencil-outline"
                      :title="t('buttons.edit')"
                      :disabled="actionLoading"
                      @click="openEdit(role)"
                    />
                    <v-list-item
                      v-if="canAssignPermissions && isRoleActive(role)"
                      prepend-icon="mdi-shield-key-outline"
                      :title="t('role.assignPermissions')"
                      :disabled="actionLoading"
                      @click="openAssignPermissions(role)"
                    />
                    <v-list-item
                      v-if="canAssignUsers && isRoleActive(role)"
                      prepend-icon="mdi-account-multiple-plus-outline"
                      :title="t('role.assignUsers')"
                      :disabled="actionLoading"
                      @click="openAssignUsers(role)"
                    />
                    <v-list-item
                      v-if="canCreate"
                      prepend-icon="mdi-content-copy"
                      :title="t('role.clone')"
                      :disabled="actionLoading"
                      @click="openClone(role)"
                    />
                    <v-list-item
                      v-if="canView"
                      prepend-icon="mdi-account-group-outline"
                      :title="t('role.viewUsage')"
                      :disabled="actionLoading"
                      @click="openUsage(role)"
                    />
                    <!-- <v-list-item
                      v-if="canActivate && !isRoleActive(role)"
                      prepend-icon="mdi-check-circle-outline"
                      :title="t('role.activate')"
                      :disabled="actionLoading"
                      @click="toggleStatus(role, true)"
                    />
                    <v-list-item
                      v-if="canDeactivate && isRoleActive(role)"
                      prepend-icon="mdi-cancel"
                      :title="t('role.deactivate')"
                      :disabled="actionLoading"
                      @click="toggleStatus(role, false)"
                    /> -->
                    <v-list-item
                      v-if="canDelete"
                      prepend-icon="mdi-delete-outline"
                      :title="t('buttons.delete')"
                      class="text-error"
                      :disabled="actionLoading"
                      @click="confirmDelete(role)"
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

    <RoleFormDialog
      v-model="formOpen"
      :role="editingRole"
      :saving="store.saving || actionLoading"
      :permission-groups="permissionsStore.groups"
      :permissions-loading="permissionsLoading"
      @submit="handleFormSubmit"
    />

    <v-dialog v-model="viewOpen" max-width="640">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('role.viewTitle') }}
        </v-card-title>
        <v-card-text>
          <div v-if="viewLoading" class="d-flex justify-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <template v-else-if="viewingRole">
            <div class="mb-3">
              <div class="text-caption text-medium-emphasis">{{ t('role.role') }}</div>
              <div class="font-weight-medium">{{ displayName(viewingRole) }}</div>
            </div>
            <div class="mb-3">
              <div class="text-caption text-medium-emphasis">{{ t('role.code') }}</div>
              <div>{{ viewingRole.role_code || '—' }}</div>
            </div>
            <div class="mb-3">
              <div class="text-caption text-medium-emphasis">{{ t('role.description') }}</div>
              <div>{{ viewingRole.description || '—' }}</div>
            </div>
            <div class="mb-3">
              <div class="text-caption text-medium-emphasis">{{ t('role.permissions') }}</div>
              <div class="d-flex flex-wrap ga-1 mt-1">
                <v-chip
                  v-for="perm in viewingRole.permissions || []"
                  :key="perm.id"
                  size="small"
                  variant="tonal"
                >
                  {{ permissionLabel(perm) }}
                </v-chip>
                <span v-if="!(viewingRole.permissions || []).length">—</span>
              </div>
            </div>
          </template>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" class="text-none" @click="viewOpen = false">
            {{ t('buttons.cancel') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="cloneOpen" max-width="480">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('role.cloneTitle') }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="cloneForm.name"
            :label="t('role.systemName')"
            :error-messages="cloneErrors.name"
            class="mb-2"
            hide-details="auto"
          />
          <v-text-field
            v-model="cloneForm.name_en"
            :label="t('role.nameEn')"
            :error-messages="cloneErrors.name_en"
            class="mb-2"
            hide-details="auto"
          />
          <v-text-field
            v-model="cloneForm.name_ar"
            :label="t('role.nameAr')"
            :error-messages="cloneErrors.name_ar"
            class="mb-2"
            hide-details="auto"
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            class="text-none"
            :disabled="store.saving"
            @click="cloneOpen = false"
          >
            {{ t('buttons.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            class="text-none"
            :loading="store.saving"
            @click="handleClone"
          >
            {{ t('role.clone') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="permissionsOpen" max-width="720" scrollable>
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('role.assignPermissionsTitle') }}
        </v-card-title>
        <v-card-subtitle v-if="activeRole" class="pb-2">
          {{ displayName(activeRole) }}
        </v-card-subtitle>
        <v-card-text>
          <div
            v-if="assignPermissionErrors.permissions?.length"
            class="text-error text-caption mb-2"
          >
            {{ assignPermissionErrors.permissions[0] }}
          </div>
          <div v-if="permissionsLoading" class="d-flex justify-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <v-expansion-panels v-else variant="accordion" multiple>
            <v-expansion-panel
              v-for="(perms, moduleKey) in permissionsStore.groups"
              :key="moduleKey"
            >
              <v-expansion-panel-title>
                {{ moduleLabel(moduleKey) }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-checkbox
                  v-for="perm in perms"
                  :key="perm.id"
                  v-model="selectedPermissions"
                  :label="permissionLabel(perm)"
                  :value="perm.id"
                  density="compact"
                  hide-details
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            class="text-none"
            :disabled="store.saving"
            @click="permissionsOpen = false"
          >
            {{ t('buttons.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            class="text-none"
            :loading="store.saving"
            :disabled="!selectedPermissions.length"
            @click="handleAssignPermissions"
          >
            {{ t('buttons.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="usersOpen" max-width="520">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('role.assignUsersTitle') }}
        </v-card-title>
        <v-card-subtitle v-if="activeRole" class="pb-2">
          {{ displayName(activeRole) }}
        </v-card-subtitle>
        <v-card-text>
          <v-autocomplete
            v-model="selectedUsers"
            :items="userItems"
            item-title="title"
            item-value="value"
            :label="t('role.users')"
            :error-messages="assignUserErrors.users"
            :loading="usersLoading"
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
            @click="usersOpen = false"
          >
            {{ t('buttons.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            class="text-none"
            :loading="store.saving"
            :disabled="!selectedUsers.length"
            @click="handleAssignUsers"
          >
            {{ t('buttons.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="usageOpen" max-width="560">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('role.usageTitle') }}
        </v-card-title>
        <v-card-subtitle v-if="activeRole" class="pb-2">
          {{ displayName(activeRole) }}
        </v-card-subtitle>
        <v-card-text>
          <div v-if="usageLoading" class="d-flex justify-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <div
            v-else-if="!usageUsers.length"
            class="text-center text-medium-emphasis py-6"
          >
            {{ t('role.usageEmpty') }}
          </div>
          <v-list v-else density="comfortable">
            <v-list-item
              v-for="user in usageUsers"
              :key="user.id"
              :title="user.name"
              :subtitle="user.email"
            />
          </v-list>
          <div
            v-if="!usageLoading && usageUsers.length"
            class="text-caption text-medium-emphasis mt-2"
          >
            {{ t('role.usageCount', { count: usageCount }) }}
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" class="text-none" @click="usageOpen = false">
            {{ t('buttons.cancel') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteOpen" max-width="440">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('role.deleteTitle') }}
        </v-card-title>
        <v-card-text class="text-medium-emphasis">
          {{ t('role.deleteConfirm', { name: deleteTargetName }) }}
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
import RoleFormDialog from "~/components/role/RoleFormDialog.vue";
import { ROLE_STATUSES, roleDisplayName } from "~/utils/roleConstants";
import { permissionDisplayName } from "~/utils/permissionConstants";
import { useSnackbar } from "~/composables/useSnackbar";

definePageMeta({
  middleware: ["auth", "tenant", "permission"],
  permission: "roles.view",
});

const { t, locale } = useAppLocale();
const { hasPermission } = usePermissions();
const { showSnackbar } = useSnackbar();
const store = useRolesStore();
const permissionsStore = usePermissionsStore();

useHead({
  title: () => t("navigation.rolesManagement"),
});

const canView = computed(() => hasPermission("roles.view"));
const canCreate = computed(() => hasPermission("roles.create"));
const canUpdate = computed(() => hasPermission("roles.update"));
const canDelete = computed(() => hasPermission("roles.delete"));
const canActivate = computed(() => hasPermission("roles.activate"));
const canDeactivate = computed(() => hasPermission("roles.deactivate"));
const canAssignPermissions = computed(() =>
  hasPermission("roles.assign_permissions"),
);
const canAssignUsers = computed(() => hasPermission("roles.assign_users"));

const search = ref("");
const isActive = ref(null);
const page = ref(1);
const actionLoading = ref(false);
const permissionsLoading = ref(false);
const usersLoading = ref(false);

const formOpen = ref(false);
const editingRole = ref(null);

const viewOpen = ref(false);
const viewLoading = ref(false);
const viewingRole = ref(null);

const cloneOpen = ref(false);
const cloningRole = ref(null);
const cloneForm = reactive({ name: "", name_en: "", name_ar: "" });
const cloneErrors = reactive({});

const permissionsOpen = ref(false);
const selectedPermissions = ref([]);
const assignPermissionErrors = reactive({});

const usersOpen = ref(false);
const selectedUsers = ref([]);
const assignUserErrors = reactive({});

const usageOpen = ref(false);
const usageLoading = ref(false);
const usageUsers = ref([]);
const usageCount = ref(0);

const deleteOpen = ref(false);
const deletingRole = ref(null);
const activeRole = ref(null);

const deleteTargetName = computed(() =>
  deletingRole.value ? displayName(deletingRole.value) : "",
);

const statusItems = computed(() =>
  ROLE_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const userItems = computed(() =>
  store.userOptions.map((user) => ({
    value: user.id,
    title: user.name ? `${user.name} (${user.email})` : user.email,
  })),
);

function displayName(role) {
  return roleDisplayName(role, locale.value);
}

function permissionLabel(permission) {
  return permissionDisplayName(permission, locale.value);
}

function isRoleActive(role) {
  return role?.is_active === true;
}

function moduleLabel(value) {
  if (!value) return "—";
  const key = `permission.modules.${value}`;
  const translated = t(key);
  return translated === key ? value.replace(/_/g, " ") : translated;
}

async function ensurePermissionGroups() {
  permissionsLoading.value = true;
  try {
    await permissionsStore.fetchGrouped(false, { is_active: true });
  } finally {
    permissionsLoading.value = false;
  }
}

async function loadPage(nextPage = page.value, force = false) {
  const target = Number(nextPage) || 1;
  page.value = target;
  await store.fetchList(target, force);
  page.value = store.meta.current_page || target;
}

function applyFilters() {
  store.setFilters({
    search: search.value?.trim() || "",
    is_active:
      isActive.value === null || isActive.value === undefined
        ? null
        : isActive.value,
  });
  loadPage(1, true);
}

async function openCreate() {
  editingRole.value = null;
  await ensurePermissionGroups();
  formOpen.value = true;
}

async function openEdit(role) {
  actionLoading.value = true;
  try {
    const { role: fresh, error } = await store.fetchOne(role.id);
    if (error) return;
    editingRole.value = fresh || role;
    formOpen.value = true;
  } finally {
    actionLoading.value = false;
  }
}

async function openView(role) {
  viewingRole.value = role;
  viewOpen.value = true;
  viewLoading.value = true;
  try {
    const { role: fresh } = await store.fetchOne(role.id);
    if (fresh) viewingRole.value = fresh;
  } finally {
    viewLoading.value = false;
  }
}

async function handleFormSubmit({ payload, applyServerErrors }) {
  actionLoading.value = true;
  try {
    if (editingRole.value?.id) {
      const { error } = await store.update(editingRole.value.id, payload);
      if (error) {
        applyServerErrors(error.errors);
        return;
      }
      showSnackbar(t("role.updated"), 200);
    } else {
      const { error } = await store.create(payload);
      if (error) {
        applyServerErrors(error.errors);
        return;
      }
      showSnackbar(t("role.created"), 200);
    }
    formOpen.value = false;
    editingRole.value = null;
  } finally {
    actionLoading.value = false;
  }
}

function openClone(role) {
  cloningRole.value = role;
  Object.keys(cloneErrors).forEach((key) => delete cloneErrors[key]);
  cloneForm.name = role.name ? `${role.name} (Copy)` : "";
  cloneForm.name_en = role.name_en ? `${role.name_en} (Copy)` : "";
  cloneForm.name_ar = role.name_ar ? `${role.name_ar} (نسخة)` : "";
  cloneOpen.value = true;
}

async function handleClone() {
  if (!cloningRole.value?.id) return;

  Object.keys(cloneErrors).forEach((key) => delete cloneErrors[key]);

  const payload = {};
  if (cloneForm.name?.trim()) payload.name = cloneForm.name.trim();
  if (cloneForm.name_en?.trim()) payload.name_en = cloneForm.name_en.trim();
  if (cloneForm.name_ar?.trim()) payload.name_ar = cloneForm.name_ar.trim();

  const { error } = await store.clone(cloningRole.value.id, payload);
  if (error) {
    Object.entries(error.errors || {}).forEach(([key, value]) => {
      cloneErrors[key] = Array.isArray(value) ? value : [String(value)];
    });
    return;
  }

  showSnackbar(t("role.cloned"), 200);
  cloneOpen.value = false;
  cloningRole.value = null;
}

async function openAssignPermissions(role) {
  activeRole.value = role;
  selectedPermissions.value = (role.permissions || [])
    .map((p) => p.id)
    .filter(Boolean);
  Object.keys(assignPermissionErrors).forEach(
    (key) => delete assignPermissionErrors[key],
  );
  permissionsOpen.value = true;
  await ensurePermissionGroups();
}

async function handleAssignPermissions() {
  if (!activeRole.value?.id) return;
  Object.keys(assignPermissionErrors).forEach(
    (key) => delete assignPermissionErrors[key],
  );

  const { error } = await store.assignPermissions(
    activeRole.value.id,
    selectedPermissions.value,
  );
  if (error) {
    Object.entries(error.errors || {}).forEach(([key, value]) => {
      assignPermissionErrors[key] = Array.isArray(value)
        ? value
        : [String(value)];
    });
    return;
  }

  showSnackbar(t("role.permissionsAssigned"), 200);
  permissionsOpen.value = false;
}

async function openAssignUsers(role) {
  activeRole.value = role;
  selectedUsers.value = [];
  Object.keys(assignUserErrors).forEach((key) => delete assignUserErrors[key]);
  usersOpen.value = true;
  usersLoading.value = true;
  try {
    await store.fetchUserOptions();
  } finally {
    usersLoading.value = false;
  }
}

async function handleAssignUsers() {
  if (!activeRole.value?.id) return;
  Object.keys(assignUserErrors).forEach((key) => delete assignUserErrors[key]);

  const { error } = await store.assignUsers(
    activeRole.value.id,
    selectedUsers.value,
  );
  if (error) {
    Object.entries(error.errors || {}).forEach(([key, value]) => {
      assignUserErrors[key] = Array.isArray(value) ? value : [String(value)];
    });
    return;
  }

  showSnackbar(t("role.usersAssigned"), 200);
  usersOpen.value = false;
}

async function openUsage(role) {
  activeRole.value = role;
  usageUsers.value = [];
  usageCount.value = 0;
  usageOpen.value = true;
  usageLoading.value = true;
  try {
    const { usage, error } = await store.fetchUsage(role.id);
    if (!error && usage) {
      if (usage.role) activeRole.value = usage.role;
      usageUsers.value = usage.users || [];
      usageCount.value = usage.users_count ?? usageUsers.value.length;
    }
  } finally {
    usageLoading.value = false;
  }
}

async function toggleStatus(role, activate) {
  actionLoading.value = true;
  try {
    const result = activate
      ? await store.activate(role.id)
      : await store.deactivate(role.id);
    if (!result.error) {
      showSnackbar(
        activate ? t("role.activated") : t("role.deactivated"),
        200,
      );
    }
  } finally {
    actionLoading.value = false;
  }
}

function confirmDelete(role) {
  deletingRole.value = role;
  deleteOpen.value = true;
}

async function onPageChange(nextPage) {
  if (store.loading) return;
  if (Number(nextPage) === Number(page.value)) return;
  await loadPage(nextPage, true);
}

async function handleDelete() {
  if (!deletingRole.value?.id) return;
  actionLoading.value = true;
  try {
    const { error } = await store.destroy(deletingRole.value.id);
    if (!error) {
      showSnackbar(t("role.deleted"), 200);
      deleteOpen.value = false;
      deletingRole.value = null;
    }
  } finally {
    actionLoading.value = false;
  }
}

onMounted(() => {
  search.value = store.filters.search || "";
  isActive.value = store.filters.is_active;
  if (canView.value) loadPage(store.meta.current_page || 1);
});
</script>

<style scoped>
.role-toolbar {
  padding-block: 20px !important;
}

.role-table :deep(th) {
  font-weight: 600 !important;
  color: rgba(var(--v-theme-on-surface), 0.55) !important;
  white-space: nowrap;
}

.role-table :deep(td) {
  border-bottom-color: rgba(var(--v-theme-on-surface), 0.06) !important;
}
</style>
