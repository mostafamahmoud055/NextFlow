<template>
  <div class="department-management">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4 mb-md-6">
      <div>
        <p class="text-body-2 text-medium-emphasis mb-1">
          {{ t('navigation.companySettings') }}
        </p>
        <h1 class="text-h4 font-weight-bold text-high-emphasis dashboard-page-title">
          {{ t('navigation.departmentsManagement') }}
        </h1>
      </div>

      <div class="d-flex flex-wrap align-center ga-2">
        <v-btn-toggle
          v-model="viewMode"
          mandatory
          density="comfortable"
          color="primary"
          variant="outlined"
          divided
        >
          <v-btn value="list" class="text-none mx-1" prepend-icon="mdi-view-list">
            {{ t('department.listView') }}
          </v-btn>
          <v-btn
            v-if="canViewTree && !showDeleted"
            value="tree"
            class="text-none"
            prepend-icon="mdi-file-tree-outline"
          >
            {{ t('department.treeView') }}
          </v-btn>
        </v-btn-toggle>

        <v-btn
          v-if="canCreate && !showDeleted"
          color="primary"
          class="text-none"
          prepend-icon="mdi-plus"
          @click="openCreate"
        >
          {{ t('department.create') }}
        </v-btn>
      </div>
    </div>

    <v-card class="dashboard-card department-toolbar mb-4" elevation="0">
      <v-row density="comfortable" align="center">
        <v-col cols="12" md="3">
          <ListSearchField v-model="search" @search="applyFilters" />
        </v-col>
        <v-col cols="12" sm="6" md="2">
          <v-select
            v-model="status"
            :items="statusItems"
            item-title="title"
            item-value="value"
            :label="t('department.status')"
            clearable
            variant="outlined"
            hide-details
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="branchId"
            :items="branchFilterItems"
            item-title="title"
            item-value="value"
            :label="t('department.branch')"
            clearable
            variant="outlined"
            hide-details
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" sm="6" md="2">
          <v-select
            v-model="parentId"
            :items="parentFilterItems"
            item-title="title"
            item-value="value"
            :label="t('department.parent')"
            clearable
            variant="outlined"
            hide-details
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" sm="6" md="2">
          <v-select
            v-model="trashedFilter"
            :items="trashedItems"
            item-title="title"
            item-value="value"
            :label="t('common.showDeleted')"
            variant="outlined"
            hide-details
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" sm="6" md="1" class="d-flex justify-end">
          <v-btn
            variant="tonal"
            class="text-none"
            prepend-icon="mdi-filter-outline"
            @click="applyFilters"
          >
            {{ t('department.applyFilters') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="dashboard-card" elevation="0">
      <template v-if="viewMode === 'list'">
        <div v-if="store.loading && !store.items.length" class="d-flex justify-center py-12">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <div
          v-else-if="!store.items.length"
          class="text-center text-medium-emphasis py-12"
        >
          <v-icon size="40" class="mb-3">mdi-sitemap-outline</v-icon>
          <div>{{ t('department.empty') }}</div>
        </div>

        <template v-else>
          <v-table class="department-table">
            <thead>
              <tr>
                <th>{{ t('department.department') }}</th>
                <th class="d-none d-md-table-cell">{{ t('department.code') }}</th>
                <th class="d-none d-lg-table-cell">{{ t('department.parent') }}</th>
                <th class="d-none d-lg-table-cell">{{ t('department.branch') }}</th>
                <th class="d-none d-lg-table-cell">{{ t('department.manager') }}</th>
                <th class="d-none d-lg-table-cell">{{ t('department.employees') }}</th>
                <th>{{ t('department.status') }}</th>
                <th class="text-end">{{ t('department.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="department in store.items" :key="department.id">
                <td>
                  <div class="font-weight-medium py-2">
                    {{ displayName(department) }}
                  </div>
                </td>
                <td class="d-none d-md-table-cell text-medium-emphasis">
                  {{ department.department_code || '—' }}
                </td>
                <td class="d-none d-lg-table-cell text-medium-emphasis">
                  {{ parentLabel(department) }}
                </td>
                <td class="d-none d-lg-table-cell text-medium-emphasis">
                  {{ branchLabel(department) }}
                </td>
                <td class="d-none d-lg-table-cell text-medium-emphasis">
                  {{ managerLabel(department) }}
                </td>
                <td class="d-none d-lg-table-cell text-medium-emphasis">
                  {{ employeesCountLabel(department) }}
                </td>
                <td>
                  <v-chip
                    size="small"
                    :color="isActive(department) ? 'success' : 'secondary'"
                    variant="tonal"
                  >
                    {{ statusLabel(department) }}
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
                        :aria-label="t('department.actions')"
                      >
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>

                    <v-list density="compact" min-width="200">
                      <template v-if="!showDeleted">
                        <v-list-item
                          v-if="canUpdate && canAccessBranch(department.branch_id)"
                          prepend-icon="mdi-pencil-outline"
                          :title="t('buttons.edit')"
                          :disabled="actionLoading"
                          @click="openEdit(department)"
                        />
                        <v-list-item
                          v-if="canAssignEmployees && canAccessBranch(department.branch_id)"
                          prepend-icon="mdi-account-multiple-outline"
                          :title="t('department.assignEmployees')"
                          :disabled="actionLoading || !isActive(department)"
                          @click="openAssignEmployees(department)"
                        />
                        <v-list-item
                          v-if="canActivate && canAccessBranch(department.branch_id) && !isActive(department)"
                          prepend-icon="mdi-check-circle-outline"
                          :title="t('department.activate')"
                          :disabled="actionLoading"
                          @click="toggleStatus(department, true)"
                        />
                        <v-list-item
                          v-if="canDeactivate && canAccessBranch(department.branch_id) && isActive(department)"
                          prepend-icon="mdi-cancel"
                          :title="t('department.deactivate')"
                          :disabled="actionLoading"
                          @click="toggleStatus(department, false)"
                        />
                        <v-list-item
                          v-if="canDelete && canAccessBranch(department.branch_id)"
                          prepend-icon="mdi-delete-outline"
                          :title="t('buttons.delete')"
                          class="text-error"
                          :disabled="actionLoading"
                          @click="confirmDelete(department)"
                        />
                      </template>
                      <template v-else>
                        <v-list-item
                          v-if="canRestore && canAccessBranch(department.branch_id)"
                          prepend-icon="mdi-delete-restore"
                          :title="t('buttons.restore')"
                          :disabled="actionLoading"
                          @click="handleRestore(department)"
                        />
                        <v-list-item
                          v-if="canForceDelete && canAccessBranch(department.branch_id)"
                          prepend-icon="mdi-delete-forever-outline"
                          :title="t('buttons.permanentDelete')"
                          class="text-error"
                          :disabled="actionLoading"
                          @click="confirmForceDelete(department)"
                        />
                      </template>
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
      </template>

      <template v-else>
        <div v-if="store.treeLoading" class="d-flex justify-center py-12">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <div
          v-else-if="!store.treeItems.length"
          class="text-center text-medium-emphasis py-12"
        >
          <v-icon size="40" class="mb-3">mdi-file-tree-outline</v-icon>
          <div>{{ t('department.emptyTree') }}</div>
        </div>

        <v-list v-else class="py-2">
          <DepartmentTreeNodes
            :nodes="store.treeItems"
            :depth="0"
            :can-update="canUpdate"
            :can-assign-employees="canAssignEmployees"
            :can-activate="canActivate"
            :can-deactivate="canDeactivate"
            :can-delete="canDelete"
            :action-loading="actionLoading"
            @edit="openEdit"
            @assign-employees="openAssignEmployees"
            @activate="(dept) => toggleStatus(dept, true)"
            @deactivate="(dept) => toggleStatus(dept, false)"
            @delete="confirmDelete"
          />
        </v-list>
      </template>
    </v-card>

    <DepartmentFormDialog
      v-model="dialogOpen"
      :department="editingDepartment"
      :saving="store.saving || actionLoading"
      @submit="handleSubmit"
    />

    <DepartmentAssignEmployeesDialog
      v-model="assignEmployeesOpen"
      :department="assigningDepartment"
      :saving="store.saving || actionLoading"
      @submit="handleAssignEmployees"
    />

    <v-dialog v-model="deleteDialogOpen" max-width="440">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('department.deleteTitle') }}
        </v-card-title>
        <v-card-text class="text-medium-emphasis">
          {{ t('department.deleteConfirm', { name: deleteTargetName }) }}
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" class="text-none" @click="deleteDialogOpen = false">
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

    <v-dialog v-model="forceDeleteDialogOpen" max-width="440">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('common.permanentDeleteTitle') }}
        </v-card-title>
        <v-card-text class="text-medium-emphasis">
          {{ t('common.permanentDeleteConfirm', { name: forceDeleteTargetName }) }}
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" class="text-none" @click="forceDeleteDialogOpen = false">
            {{ t('buttons.cancel') }}
          </v-btn>
          <v-btn
            color="error"
            class="text-none"
            :loading="actionLoading"
            @click="handleForceDelete"
          >
            {{ t('buttons.permanentDelete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import DepartmentAssignEmployeesDialog from "~/components/department/DepartmentAssignEmployeesDialog.vue";
import DepartmentFormDialog from "~/components/department/DepartmentFormDialog.vue";
import DepartmentTreeNodes from "~/components/department/DepartmentTreeNodes.vue";
import {
  DEPARTMENT_STATUSES,
  departmentDisplayName,
} from "~/utils/departmentConstants";
import { branchDisplayName } from "~/utils/branchConstants";
import { userDisplayName } from "~/utils/userConstants";
import { enumValue } from "~/utils/enumValue";
import { useSnackbar } from "~/composables/useSnackbar";

definePageMeta({
  middleware: ["auth", "tenant", "permission"],
  permission: ["departments.view", "departments.view_tree"],
});

const { t, locale } = useAppLocale();
const { hasPermission, canAccessBranch } = usePermissions();
const { showSnackbar } = useSnackbar();
const store = useDepartmentsStore();
const branchesStore = useBranchesStore();
const usersStore = useUsersStore();

useHead({
  title: () => t("navigation.departmentsManagement"),
});

const canCreate = computed(() => hasPermission("departments.create"));
const canUpdate = computed(() => hasPermission("departments.update"));
const canDelete = computed(() => hasPermission("departments.delete"));
const canRestore = computed(() => hasPermission("departments.restore"));
const canForceDelete = computed(() => hasPermission("departments.force_delete"));
const canActivate = computed(() => hasPermission("departments.activate"));
const canDeactivate = computed(() => hasPermission("departments.deactivate"));
const canAssignEmployees = computed(() =>
  hasPermission("departments.assign_employees"),
);
const canViewTree = computed(
  () =>
    hasPermission("departments.view_tree") ||
    hasPermission("departments.view"),
);

const showDeleted = computed(() => store.filters.trashed === "only");

const viewMode = ref("list");
const search = ref("");
const status = ref(null);
const branchId = ref(null);
const parentId = ref(null);
const trashedFilter = ref(null);
const page = ref(1);
const dialogOpen = ref(false);
const editingDepartment = ref(null);
const assignEmployeesOpen = ref(false);
const assigningDepartment = ref(null);
const actionLoading = ref(false);
const deleteDialogOpen = ref(false);
const deletingDepartment = ref(null);
const forceDeleteDialogOpen = ref(false);
const forceDeletingDepartment = ref(null);
const allBranches = ref([]);
const allParents = ref([]);
const allUsers = ref([]);

const usersById = computed(() => {
  const map = new Map();
  for (const user of allUsers.value) {
    map.set(user.id, user);
  }
  return map;
});

const deleteTargetName = computed(() =>
  deletingDepartment.value ? displayName(deletingDepartment.value) : "",
);

const forceDeleteTargetName = computed(() =>
  forceDeletingDepartment.value ? displayName(forceDeletingDepartment.value) : "",
);

const statusItems = computed(() =>
  DEPARTMENT_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const branchFilterItems = computed(() =>
  allBranches.value.map((item) => ({
    value: item.id,
    title: branchDisplayName(item, locale.value),
  })),
);

const parentFilterItems = computed(() =>
  allParents.value.map((item) => ({
    value: item.id,
    title: departmentDisplayName(item, locale.value),
  })),
);

const trashedItems = computed(() => [
  { value: null, title: t("common.showDeletedAll") },
  { value: "only", title: t("common.showDeletedOnly") },
]);

function displayName(department) {
  return departmentDisplayName(department, locale.value);
}

function isActive(department) {
  return enumValue(department.status) === "active";
}

function statusLabel(department) {
  return isActive(department)
    ? t("department.statusActive")
    : t("department.statusInactive");
}

async function loadBranches() {
  const { items, error } = await branchesStore.fetchAll();
  if (!error) allBranches.value = items;
}

async function loadParents() {
  const { items, error } = await store.fetchAll();
  if (!error) allParents.value = items;
}

async function loadUsers() {
  const { items, error } = await usersStore.fetchAll();
  if (!error) allUsers.value = items;
}

function parentLabel(department) {
  if (department.parent) {
    return departmentDisplayName(department.parent, locale.value);
  }
  if (!department.parent_id) return "Main";
  const match = allParents.value.find((item) => item.id === department.parent_id);
  return match ? departmentDisplayName(match, locale.value) : "—";
}

function branchLabel(department) {
  if (department.branch) {
    return branchDisplayName(department.branch, locale.value);
  }
  if (!department.branch_id) return "—";
  const match = allBranches.value.find(
    (item) => item.id === department.branch_id,
  );
  return match ? branchDisplayName(match, locale.value) : "—";
}

function managerLabel(department) {
  if (!department.manager_id) return "—";
  const user = usersById.value.get(department.manager_id);
  return user ? userDisplayName(user, locale.value) : "—";
}

function employeesCountLabel(department) {
  const count =
    department.employees_count ??
    (Array.isArray(department.employee_ids)
      ? department.employee_ids.length
      : 0);
  return String(count);
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

async function loadTree() {
  await store.fetchTree({
    search: search.value?.trim() || "",
    status: status.value || null,
    branch_id: branchId.value || null,
  });
}

function applyFilters() {
  store.setFilters({
    search: search.value?.trim() || "",
    status: status.value || null,
    branch_id: branchId.value || null,
    parent_id: parentId.value || null,
    trashed: trashedFilter.value || null,
  });

  if (showDeleted.value && viewMode.value === "tree") {
    viewMode.value = "list";
  }

  if (viewMode.value === "tree") {
    loadTree();
  } else {
    loadPage(1, true);
  }
}

function openCreate() {
  editingDepartment.value = null;
  dialogOpen.value = true;
}

function openEdit(department) {
  editingDepartment.value = department;
  dialogOpen.value = true;
}

function openAssignEmployees(department) {
  assigningDepartment.value = department;
  assignEmployeesOpen.value = true;
}

async function handleSubmit({ payload, applyServerErrors }) {
  actionLoading.value = true;

  try {
    if (editingDepartment.value?.id) {
      const { error } = await store.update(editingDepartment.value.id, payload);

      if (error) {
        applyServerErrors(error.errors);
        return;
      }

      showSnackbar(t("department.updated"), 200);
      dialogOpen.value = false;
      if (viewMode.value === "tree") await loadTree();
      return;
    }

    const { error } = await store.create(payload);

    if (error) {
      applyServerErrors(error.errors);
      return;
    }

    showSnackbar(t("department.created"), 200);
    dialogOpen.value = false;
    if (viewMode.value === "tree") await loadTree();
  } finally {
    actionLoading.value = false;
  }
}

async function handleAssignEmployees({ userIds, applyServerErrors }) {
  if (!assigningDepartment.value?.id) return;

  actionLoading.value = true;

  try {
    const { department, error } = await store.assignEmployees(
      assigningDepartment.value.id,
      userIds,
    );

    if (error) {
      applyServerErrors(error.errors);
      return;
    }

    showSnackbar(t("department.employeesAssigned"), 200);
    assignEmployeesOpen.value = false;
    assigningDepartment.value = department;
    if (viewMode.value === "tree") await loadTree();
  } finally {
    actionLoading.value = false;
  }
}

async function toggleStatus(department, activate) {
  actionLoading.value = true;

  try {
    const result = activate
      ? await store.activate(department.id)
      : await store.deactivate(department.id);

    if (!result.error) {
      showSnackbar(
        activate ? t("department.activated") : t("department.deactivated"),
        200,
      );
      if (viewMode.value === "tree") await loadTree();
    }
  } finally {
    actionLoading.value = false;
  }
}

function confirmDelete(department) {
  deletingDepartment.value = department;
  deleteDialogOpen.value = true;
}

async function handleDelete() {
  if (!deletingDepartment.value?.id) return;

  actionLoading.value = true;

  try {
    const result = await store.destroy(deletingDepartment.value.id);

    if (!result.error) {
      showSnackbar(t("department.deleted"), 200);
      deleteDialogOpen.value = false;
      deletingDepartment.value = null;
      if (viewMode.value === "tree") await loadTree();
    }
  } finally {
    actionLoading.value = false;
  }
}

function confirmForceDelete(department) {
  forceDeletingDepartment.value = department;
  forceDeleteDialogOpen.value = true;
}

async function handleForceDelete() {
  if (!forceDeletingDepartment.value?.id) return;

  actionLoading.value = true;

  try {
    const result = await store.forceDestroy(forceDeletingDepartment.value.id);

    if (!result.error) {
      showSnackbar(t("common.permanentlyDeleted"), 200);
      forceDeleteDialogOpen.value = false;
      forceDeletingDepartment.value = null;
      if (viewMode.value === "tree") await loadTree();
    }
  } finally {
    actionLoading.value = false;
  }
}

async function handleRestore(department) {
  if (!department?.id) return;

  actionLoading.value = true;
  try {
    const result = await store.restore(department.id);
    if (!result.error) {
      showSnackbar(t("department.restored"), 200);
    }
  } finally {
    actionLoading.value = false;
  }
}

watch(viewMode, (mode) => {
  if (mode === "tree") loadTree();
});

onMounted(async () => {
  search.value = store.filters.search || "";
  status.value = store.filters.status || null;
  branchId.value = store.filters.branch_id || null;
  parentId.value = store.filters.parent_id || null;
  trashedFilter.value = store.filters.trashed || null;

  if (showDeleted.value && viewMode.value === "tree") {
    viewMode.value = "list";
  }

  await Promise.all([
    loadParents(),
    loadBranches(),
    loadUsers(),
    loadPage(store.meta.current_page || 1),
  ]);
});
</script>

<style scoped>
.department-toolbar {
  padding-block: 20px !important;
}

.department-table :deep(th) {
  font-weight: 600 !important;
  color: rgba(var(--v-theme-on-surface), 0.55) !important;
  white-space: nowrap;
}

.department-table :deep(td) {
  border-bottom-color: rgba(var(--v-theme-on-surface), 0.06) !important;
}
</style>
