<template>
  <div class="permission-management">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4 mb-md-6">
      <div>
        <p class="text-body-2 text-medium-emphasis mb-1">
          {{ t('navigation.accessControl') }}
        </p>
        <h1 class="text-h4 font-weight-bold text-high-emphasis dashboard-page-title">
          {{ t('navigation.permissionsManagement') }}
        </h1>
      </div>

      <v-btn-toggle
        v-model="viewMode"
        mandatory
        density="comfortable"
        color="primary"
        variant="outlined"
        divided
      >
        <v-btn value="list" class="text-none mx-1" prepend-icon="mdi-view-list">
          {{ t('permission.listView') }}
        </v-btn>
        <v-btn value="grouped" class="text-none" prepend-icon="mdi-folder-outline">
          {{ t('permission.groupedView') }}
        </v-btn>
      </v-btn-toggle>
    </div>

    <v-card class="dashboard-card permission-toolbar mb-4" elevation="0">
      <v-row density="comfortable" align="center">
        <v-col cols="12" md="3">
          <ListSearchField v-model="search" @search="applyFilters" />
        </v-col>
        <v-col cols="12" sm="6" md="2">
          <v-select
            v-model="moduleFilter"
            :items="moduleItems"
            item-title="title"
            item-value="value"
            :label="t('permission.module')"
            clearable
            variant="outlined"
            hide-details
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col v-if="viewMode === 'list'" cols="12" sm="6" md="2">
          <v-select
            v-model="actionType"
            :items="actionTypeItems"
            item-title="title"
            item-value="value"
            :label="t('permission.actionType')"
            clearable
            variant="outlined"
            hide-details
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" sm="6" md="2">
          <v-select
            v-model="isActive"
            :items="statusItems"
            item-title="title"
            item-value="value"
            :label="t('permission.status')"
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
            {{ t('permission.applyFilters') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="dashboard-card" elevation="0">
      <div v-if="store.loading && !hasContent" class="d-flex justify-center py-12">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <div
        v-else-if="!hasContent"
        class="text-center text-medium-emphasis py-12"
      >
        <v-icon size="40" class="mb-3">mdi-shield-key-outline</v-icon>
        <div>{{ t('permission.empty') }}</div>
      </div>

      <template v-else-if="viewMode === 'list'">
        <v-table class="permission-table">
          <thead>
            <tr>
              <th>{{ t('permission.permission') }}</th>
              <th class="d-none d-lg-table-cell">{{ t('permission.module') }}</th>
              <th class="d-none d-lg-table-cell">{{ t('permission.actionType') }}</th>
              <!-- <th>{{ t('permission.status') }}</th> -->
              <th class="text-end">{{ t('permission.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="permission in store.items" :key="permission.id">
              <td>
                <div class="font-weight-medium py-2">
                  {{ displayName(permission) }}
                </div>

              </td>
              <td class="d-none d-md-table-cell text-medium-emphasis">
                {{ moduleLabel(permission.module) }}
              </td>
              <td class="d-none d-lg-table-cell text-medium-emphasis">
                {{ actionLabel(permission.action_type) }}
              </td>
              <!-- <td>
                <v-chip
                  size="small"
                  :color="isPermissionActive(permission) ? 'success' : 'secondary'"
                  variant="tonal"
                >
                  {{
                    isPermissionActive(permission)
                      ? t('permission.statusActive')
                      : t('permission.statusInactive')
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
                      :aria-label="t('permission.actions')"
                    >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>

                  <v-list density="compact" min-width="200">
                    <v-list-item
                      v-if="canView"
                      prepend-icon="mdi-account-group-outline"
                      :title="t('permission.viewUsage')"
                      :disabled="actionLoading"
                      @click="openUsage(permission)"
                    />
                    <v-list-item
                      v-if="canManage && isPermissionActive(permission)"
                      prepend-icon="mdi-shield-account-outline"
                      :title="t('permission.assignRole')"
                      :disabled="actionLoading"
                      @click="openAssign(permission)"
                    />
                    <!-- <v-list-item
                      v-if="canActivate && !isPermissionActive(permission)"
                      prepend-icon="mdi-check-circle-outline"
                      :title="t('permission.activate')"
                      :disabled="actionLoading"
                      @click="toggleStatus(permission, true)"
                    />
                    <v-list-item
                      v-if="canDeactivate && isPermissionActive(permission)"
                      prepend-icon="mdi-cancel"
                      :title="t('permission.deactivate')"
                      :disabled="actionLoading"
                      @click="toggleStatus(permission, false)"
                    /> -->
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

      <template v-else>
        <v-expansion-panels variant="accordion" class="permission-groups">
          <v-expansion-panel
            v-for="(perms, moduleKey) in store.groups"
            :key="moduleKey"
          >
            <v-expansion-panel-title>
              <div class="d-flex align-center justify-space-between w-100 pe-4">
                <span class="font-weight-medium">{{ moduleLabel(moduleKey) }}</span>
                <v-chip size="small" variant="tonal">{{ perms.length }}</v-chip>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-table density="comfortable" class="permission-table">
                <thead>
                  <tr>
                    <th>{{ t('permission.permission') }}</th>
                    <th class="d-none d-md-table-cell">{{ t('permission.actionType') }}</th>
                    <th>{{ t('permission.status') }}</th>
                    <th class="text-end">{{ t('permission.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="permission in perms" :key="permission.id">
                    <td>
                      <div class="font-weight-medium py-2">{{ displayName(permission) }}</div>
                      <div class="text-caption text-medium-emphasis">
                        {{ permission.name || '—' }}
                      </div>
                    </td>
                    <td class="d-none d-md-table-cell text-medium-emphasis">
                      {{ actionLabel(permission.action_type) }}
                    </td>
                    <td>
                      <v-chip
                        size="small"
                        :color="isPermissionActive(permission) ? 'success' : 'secondary'"
                        variant="tonal"
                      >
                        {{
                          isPermissionActive(permission)
                            ? t('permission.statusActive')
                            : t('permission.statusInactive')
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
                          >
                            <v-icon>mdi-dots-vertical</v-icon>
                          </v-btn>
                        </template>
                        <v-list density="compact" min-width="200">
                          <v-list-item
                            v-if="canView"
                            prepend-icon="mdi-account-group-outline"
                            :title="t('permission.viewUsage')"
                            :disabled="actionLoading"
                            @click="openUsage(permission)"
                          />
                          <v-list-item
                            v-if="canManage && isPermissionActive(permission)"
                            prepend-icon="mdi-shield-account-outline"
                            :title="t('permission.assignRole')"
                            :disabled="actionLoading"
                            @click="openAssign(permission)"
                          />
                          <!-- <v-list-item
                            v-if="canActivate && !isPermissionActive(permission)"
                            prepend-icon="mdi-check-circle-outline"
                            :title="t('permission.activate')"
                            :disabled="actionLoading"
                            @click="toggleStatus(permission, true)"
                          />
                          <v-list-item
                            v-if="canDeactivate && isPermissionActive(permission)"
                            prepend-icon="mdi-cancel"
                            :title="t('permission.deactivate')"
                            :disabled="actionLoading"
                            @click="toggleStatus(permission, false)"
                          /> -->
                        </v-list>
                      </v-menu>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>
    </v-card>

    <v-dialog v-model="usageDialogOpen" max-width="560">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('permission.usageTitle') }}
        </v-card-title>
        <v-card-subtitle v-if="usagePermission" class="pb-2">
          {{ displayName(usagePermission) }}
        </v-card-subtitle>
        <v-card-text>
          <div v-if="usageLoading" class="d-flex justify-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <div
            v-else-if="!usageRoles.length"
            class="text-center text-medium-emphasis py-6"
          >
            {{ t('permission.usageEmpty') }}
          </div>
          <v-list v-else density="comfortable">
            <v-list-item
              v-for="role in usageRoles"
              :key="role.id"
              :title="roleLabel(role)"
            >
              <template #append>
                <v-chip
                  size="x-small"
                  :color="role.is_active ? 'success' : 'secondary'"
                  variant="tonal"
                >
                  {{
                    role.is_active
                      ? t('permission.statusActive')
                      : t('permission.statusInactive')
                  }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
          <div
            v-if="!usageLoading && usageRoles.length"
            class="text-caption text-medium-emphasis mt-2"
          >
            {{ t('permission.usageCount', { count: usageRolesCount }) }}
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" class="text-none" @click="usageDialogOpen = false">
            {{ t('buttons.cancel') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="assignDialogOpen" max-width="480">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('permission.assignRoleTitle') }}
        </v-card-title>
        <v-card-text>
          <p class="text-body-2 text-medium-emphasis mb-4">
            {{
              t('permission.assignRoleHint', {
                name: displayName(assigningPermission),
              })
            }}
          </p>
          <v-select
            v-model="selectedRoleId"
            :items="roleItems"
            item-title="title"
            item-value="value"
            :label="t('permission.role')"
            :error-messages="assignErrors.role_id"
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
            @click="assignDialogOpen = false"
          >
            {{ t('buttons.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            class="text-none"
            :loading="store.saving"
            :disabled="!selectedRoleId"
            @click="handleAssign"
          >
            {{ t('permission.assignRole') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import {
  PERMISSION_ACTION_TYPES,
  PERMISSION_MODULES,
  PERMISSION_STATUSES,
  permissionDisplayName,
} from "~/utils/permissionConstants";
import { roleDisplayName } from "~/utils/roleConstants";
import { enumValue } from "~/utils/enumValue";
import { useSnackbar } from "~/composables/useSnackbar";

definePageMeta({
  middleware: ["auth", "tenant", "permission"],
  permission: "permissions.view",
});

const { t, locale } = useAppLocale();
const { hasPermission } = usePermissions();
const { showSnackbar } = useSnackbar();
const store = usePermissionsStore();
const rolesStore = useRolesStore();

useHead({
  title: () => t("navigation.permissionsManagement"),
});

const canView = computed(() => hasPermission("permissions.view"));
const canManage = computed(() => hasPermission("permissions.manage"));
const canActivate = computed(() => hasPermission("permissions.activate"));
const canDeactivate = computed(() => hasPermission("permissions.deactivate"));

const viewMode = ref("list");
const search = ref("");
const moduleFilter = ref(null);
const actionType = ref(null);
const isActive = ref(null);
const page = ref(1);
const actionLoading = ref(false);

const usageDialogOpen = ref(false);
const usageLoading = ref(false);
const usagePermission = ref(null);
const usageRoles = ref([]);
const usageRolesCount = ref(0);

const assignDialogOpen = ref(false);
const assigningPermission = ref(null);
const selectedRoleId = ref(null);
const assignErrors = ref({});

const hasContent = computed(() => {
  if (viewMode.value === "grouped") {
    return Object.keys(store.groups).length > 0;
  }
  return store.items.length > 0;
});

const statusItems = computed(() =>
  PERMISSION_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const actionTypeItems = computed(() =>
  PERMISSION_ACTION_TYPES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const moduleItems = computed(() =>
  PERMISSION_MODULES.map((value) => ({
    value,
    title: moduleLabel(value),
  })),
);

const roleItems = computed(() =>
  rolesStore.roleOptions.map((role) => ({
    value: role.id,
    title: roleLabel(role),
  })),
);

function displayName(permission) {
  return permissionDisplayName(permission, locale.value);
}

function roleLabel(role) {
  return roleDisplayName(role, locale.value);
}

function moduleLabel(value) {
  if (!value) return "—";
  const key = `permission.modules.${value}`;
  const translated = t(key);
  return translated === key ? value.replace(/_/g, " ") : translated;
}

function actionLabel(action) {
  const value = enumValue(action) ?? action;
  if (!value) return "—";
  if (typeof action === "object" && action?.label) return action.label;
  const match = PERMISSION_ACTION_TYPES.find((item) => item.value === value);
  return match ? t(match.labelKey) : value;
}

function isPermissionActive(permission) {
  return permission?.is_active === true;
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
  await loadPage(nextPage);
}

async function loadGrouped() {
  await store.fetchGrouped();
}

async function reload() {
  if (viewMode.value === "grouped") {
    await store.fetchGrouped(true);
  } else {
    await loadPage(page.value, true);
  }
}

function applyFilters() {
  store.setFilters({
    search: search.value?.trim() || "",
    module: moduleFilter.value || null,
    action_type: actionType.value || null,
    is_active: isActive.value === null || isActive.value === undefined
      ? null
      : isActive.value,
  });
  page.value = 1;
  reload();
}

async function toggleStatus(permission, activate) {
  actionLoading.value = true;
  try {
    const result = activate
      ? await store.activate(permission.id)
      : await store.deactivate(permission.id);

    if (!result.error) {
      showSnackbar(
        activate ? t("permission.activated") : t("permission.deactivated"),
        200,
      );
      if (viewMode.value === "grouped") await loadGrouped();
    }
  } finally {
    actionLoading.value = false;
  }
}

async function openUsage(permission) {
  usagePermission.value = permission;
  usageRoles.value = [];
  usageRolesCount.value = 0;
  usageDialogOpen.value = true;
  usageLoading.value = true;

  try {
    const { usage, error } = await store.fetchUsage(permission.id);
    if (!error && usage) {
      usagePermission.value = usage.permission || permission;
      usageRoles.value = usage.roles || [];
      usageRolesCount.value = usage.roles_count ?? usageRoles.value.length;
    }
  } finally {
    usageLoading.value = false;
  }
}

async function openAssign(permission) {
  assigningPermission.value = permission;
  selectedRoleId.value = null;
  assignErrors.value = {};
  assignDialogOpen.value = true;
  await rolesStore.fetchRoleOptions();
}

async function handleAssign() {
  if (!assigningPermission.value?.id || !selectedRoleId.value) return;

  assignErrors.value = {};
  const { error } = await store.assignToRole(
    assigningPermission.value.id,
    selectedRoleId.value,
  );

  if (error) {
    assignErrors.value = error.errors || {};
    return;
  }

  showSnackbar(t("permission.assigned"), 200);
  assignDialogOpen.value = false;
  assigningPermission.value = null;
  selectedRoleId.value = null;
}

watch(viewMode, (mode) => {
  if (mode === "grouped") loadGrouped();
  else loadPage(1);
});

onMounted(() => {
  const currentFilters = store.filters ?? {};
  search.value = currentFilters.search || "";
  moduleFilter.value = currentFilters.module || null;
  actionType.value = currentFilters.action_type || null;
  isActive.value = currentFilters.is_active ?? null;
  if (canView.value) loadPage(store.meta?.current_page || 1);
});
</script>

<style scoped>
.permission-toolbar {
  padding-block: 20px !important;
}

.permission-table :deep(th) {
  font-weight: 600 !important;
  color: rgba(var(--v-theme-on-surface), 0.55) !important;
  white-space: nowrap;
}

.permission-table :deep(td) {
  border-bottom-color: rgba(var(--v-theme-on-surface), 0.06) !important;
}

.permission-groups {
  border: none;
}
</style>
