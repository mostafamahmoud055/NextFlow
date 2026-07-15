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
            v-if="canViewTree"
            value="tree"
            class="text-none"
            prepend-icon="mdi-file-tree-outline"
          >
            {{ t('department.treeView') }}
          </v-btn>
        </v-btn-toggle>

        <v-btn
          v-if="canCreate"
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
          <v-text-field
            v-model="search"
            :label="t('common.search')"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            @keyup.enter="applyFilters"
            @click:clear="clearSearch"
          />
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
        <v-col cols="12" sm="6" md="2" class="d-flex justify-end">
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
                      <v-list-item
                        v-if="canUpdate"
                        prepend-icon="mdi-pencil-outline"
                        :title="t('buttons.edit')"
                        :disabled="actionLoading"
                        @click="openEdit(department)"
                      />
                      <v-list-item
                        v-if="canActivate && !isActive(department)"
                        prepend-icon="mdi-check-circle-outline"
                        :title="t('department.activate')"
                        :disabled="actionLoading"
                        @click="toggleStatus(department, true)"
                      />
                      <v-list-item
                        v-if="canDeactivate && isActive(department)"
                        prepend-icon="mdi-cancel"
                        :title="t('department.deactivate')"
                        :disabled="actionLoading"
                        @click="toggleStatus(department, false)"
                      />
                      <v-list-item
                        v-if="canDelete"
                        prepend-icon="mdi-delete-outline"
                        :title="t('buttons.delete')"
                        class="text-error"
                        :disabled="actionLoading"
                        @click="confirmDelete(department)"
                      />
                    </v-list>
                  </v-menu>
                </td>
              </tr>
            </tbody>
          </v-table>

          <div
            v-if="store.meta.last_page > 1"
            class="d-flex justify-center pt-4"
          >
            <v-pagination
              v-model="page"
              :length="store.meta.last_page"
              :disabled="store.loading"
              density="comfortable"
              @update:model-value="(p) => loadPage(p, true)"
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
            :can-activate="canActivate"
            :can-deactivate="canDeactivate"
            :can-delete="canDelete"
            :action-loading="actionLoading"
            @edit="openEdit"
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
      :parent-options="store.allItems"
      :branch-options="branchesStore.allItems"
      :saving="store.saving || actionLoading"
      @submit="handleSubmit"
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
  </div>
</template>

<script setup>
import DepartmentFormDialog from "~/components/department/DepartmentFormDialog.vue";
import DepartmentTreeNodes from "~/components/department/DepartmentTreeNodes.vue";
import {
  DEPARTMENT_STATUSES,
  departmentDisplayName,
} from "~/utils/departmentConstants";
import { branchDisplayName } from "~/utils/branchConstants";
import { enumValue } from "~/utils/enumValue";
import { useSnackbar } from "~/composables/useSnackbar";

definePageMeta({
  middleware: ["auth", "tenant"],
});

const { t, locale } = useAppLocale();
const { hasPermission } = usePermissions();
const { showSnackbar } = useSnackbar();
const store = useDepartmentsStore();
const branchesStore = useBranchesStore();

useHead({
  title: () => t("navigation.departmentsManagement"),
});

const canCreate = computed(() => hasPermission("departments.create"));
const canUpdate = computed(() => hasPermission("departments.update"));
const canDelete = computed(() => hasPermission("departments.delete"));
const canActivate = computed(() => hasPermission("departments.activate"));
const canDeactivate = computed(() => hasPermission("departments.deactivate"));
const canViewTree = computed(
  () =>
    hasPermission("departments.view_tree") ||
    hasPermission("departments.view"),
);

const viewMode = ref("list");
const search = ref("");
const status = ref(null);
const branchId = ref(null);
const parentId = ref(null);
const page = ref(1);
const dialogOpen = ref(false);
const editingDepartment = ref(null);
const actionLoading = ref(false);
const deleteDialogOpen = ref(false);
const deletingDepartment = ref(null);

const deleteTargetName = computed(() =>
  deletingDepartment.value ? displayName(deletingDepartment.value) : "",
);

const statusItems = computed(() =>
  DEPARTMENT_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const branchFilterItems = computed(() =>
  branchesStore.allItems.map((item) => ({
    value: item.id,
    title: branchDisplayName(item, locale.value),
  })),
);

const parentFilterItems = computed(() =>
  store.allItems.map((item) => ({
    value: item.id,
    title: departmentDisplayName(item, locale.value),
  })),
);

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

function parentLabel(department) {
  if (department.parent) {
    return departmentDisplayName(department.parent, locale.value);
  }
  if (!department.parent_id) return "Main";
  const match = store.allItems.find((item) => item.id === department.parent_id);
  return match ? departmentDisplayName(match, locale.value) : "—";
}

function branchLabel(department) {
  if (department.branch) {
    return branchDisplayName(department.branch, locale.value);
  }
  if (!department.branch_id) return "—";
  const match = branchesStore.allItems.find(
    (item) => item.id === department.branch_id,
  );
  return match ? branchDisplayName(match, locale.value) : "—";
}

async function loadPage(nextPage = page.value, force = false) {
  page.value = nextPage;
  await store.fetchList(nextPage, force);
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
  });

  if (viewMode.value === "tree") {
    loadTree();
  } else {
    loadPage(1, true);
  }
}

function clearSearch() {
  search.value = "";
  applyFilters();
}

function openCreate() {
  editingDepartment.value = null;
  dialogOpen.value = true;
}

function openEdit(department) {
  editingDepartment.value = department;
  dialogOpen.value = true;
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

watch(viewMode, (mode) => {
  if (mode === "tree") loadTree();
});

onMounted(async () => {
  search.value = store.filters.search || "";
  status.value = store.filters.status || null;
  branchId.value = store.filters.branch_id || null;
  parentId.value = store.filters.parent_id || null;

  await Promise.all([
    loadPage(store.meta.current_page || 1),
    branchesStore.fetchList(),
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
