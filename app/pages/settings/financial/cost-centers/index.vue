<template>
  <div class="cost-center-management">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4 mb-md-6">
      <div>
        <p class="text-body-2 text-medium-emphasis mb-1">
          {{ t('navigation.financialSetup') }}
        </p>
        <h1 class="text-h4 font-weight-bold text-high-emphasis dashboard-page-title">
          {{ t('navigation.costCentersManagement') }}
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
            {{ t('costCenter.listView') }}
          </v-btn>
          <v-btn
            v-if="canViewTree && !showDeleted"
            value="tree"
            class="text-none"
            prepend-icon="mdi-file-tree-outline"
          >
            {{ t('costCenter.treeView') }}
          </v-btn>
        </v-btn-toggle>

        <v-btn
          v-if="canCreate && !showDeleted"
          color="primary"
          class="text-none"
          prepend-icon="mdi-plus"
          @click="openCreate"
        >
          {{ t('costCenter.create') }}
        </v-btn>
      </div>
    </div>

    <v-card class="dashboard-card cost-center-toolbar mb-4" elevation="0">
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
            :label="t('costCenter.status')"
            clearable
            variant="outlined"
            hide-details
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" sm="6" md="2">
          <v-select
            v-model="branchId"
            :items="branchFilterItems"
            item-title="title"
            item-value="value"
            :label="t('costCenter.branch')"
            clearable
            variant="outlined"
            hide-details
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" sm="6" md="2">
          <v-select
            v-model="departmentId"
            :items="departmentFilterItems"
            item-title="title"
            item-value="value"
            :label="t('costCenter.department')"
            clearable
            variant="outlined"
            hide-details
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" sm="6" md="2">
          <v-select
            v-model="warehouseId"
            :items="warehouseFilterItems"
            item-title="title"
            item-value="value"
            :label="t('costCenter.warehouse')"
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
            :label="t('costCenter.parent')"
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
            {{ t('costCenter.applyFilters') }}
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
          <v-icon size="40" class="mb-3">mdi-finance</v-icon>
          <div>{{ t('costCenter.empty') }}</div>
        </div>

        <template v-else>
          <v-table class="cost-center-table">
            <thead>
              <tr>
                <th>{{ t('costCenter.costCenter') }}</th>
                <th class="d-none d-md-table-cell">{{ t('costCenter.code') }}</th>
                <th class="d-none d-lg-table-cell">{{ t('costCenter.parent') }}</th>
                <th class="d-none d-lg-table-cell">{{ t('costCenter.branch') }}</th>
                <th class="d-none d-lg-table-cell">{{ t('costCenter.department') }}</th>
                <th class="d-none d-lg-table-cell">{{ t('costCenter.warehouse') }}</th>
                <th class="d-none d-lg-table-cell">{{ t('costCenter.manager') }}</th>
                <th>{{ t('costCenter.status') }}</th>
                <th class="text-end">{{ t('costCenter.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="costCenter in store.items" :key="costCenter.id">
                <td>
                  <div class="font-weight-medium py-2">
                    {{ displayName(costCenter) }}
                  </div>
                </td>
                <td class="d-none d-md-table-cell text-medium-emphasis">
                  {{ costCenter.cost_center_code || '—' }}
                </td>
                <td class="d-none d-lg-table-cell text-medium-emphasis">
                  {{ parentLabel(costCenter) }}
                </td>
                <td class="d-none d-lg-table-cell text-medium-emphasis">
                  {{ branchLabel(costCenter) }}
                </td>
                <td class="d-none d-lg-table-cell text-medium-emphasis">
                  {{ departmentLabel(costCenter) }}
                </td>
                <td class="d-none d-lg-table-cell text-medium-emphasis">
                  {{ warehouseLabel(costCenter) }}
                </td>
                <td class="d-none d-lg-table-cell text-medium-emphasis">
                  {{ managerLabel(costCenter) }}
                </td>
                <td>
                  <v-chip
                    size="small"
                    :color="isActive(costCenter) ? 'success' : 'secondary'"
                    variant="tonal"
                  >
                    {{ statusLabel(costCenter) }}
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
                        :aria-label="t('costCenter.actions')"
                      >
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>

                    <v-list density="compact" min-width="200">
                      <template v-if="!showDeleted">
                        <v-list-item
                          v-if="canUpdate && canAccessBranch(costCenter.branch_id)"
                          prepend-icon="mdi-pencil-outline"
                          :title="t('buttons.edit')"
                          :disabled="actionLoading"
                          @click="openEdit(costCenter)"
                        />
                        <v-list-item
                          v-if="canActivate && canAccessBranch(costCenter.branch_id) && !isActive(costCenter)"
                          prepend-icon="mdi-check-circle-outline"
                          :title="t('costCenter.activate')"
                          :disabled="actionLoading"
                          @click="toggleStatus(costCenter, true)"
                        />
                        <v-list-item
                          v-if="canDeactivate && canAccessBranch(costCenter.branch_id) && isActive(costCenter)"
                          prepend-icon="mdi-cancel"
                          :title="t('costCenter.deactivate')"
                          :disabled="actionLoading"
                          @click="toggleStatus(costCenter, false)"
                        />
                        <v-list-item
                          v-if="canDelete && canAccessBranch(costCenter.branch_id)"
                          prepend-icon="mdi-delete-outline"
                          :title="t('buttons.delete')"
                          class="text-error"
                          :disabled="actionLoading"
                          @click="confirmDelete(costCenter)"
                        />
                      </template>
                      <template v-else>
                        <v-list-item
                          v-if="canRestore && canAccessBranch(costCenter.branch_id)"
                          prepend-icon="mdi-delete-restore"
                          :title="t('buttons.restore')"
                          :disabled="actionLoading"
                          @click="handleRestore(costCenter)"
                        />
                        <v-list-item
                          v-if="canForceDelete && canAccessBranch(costCenter.branch_id)"
                          prepend-icon="mdi-delete-forever-outline"
                          :title="t('buttons.permanentDelete')"
                          class="text-error"
                          :disabled="actionLoading"
                          @click="confirmForceDelete(costCenter)"
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
          <div>{{ t('costCenter.emptyTree') }}</div>
        </div>

        <v-list v-else class="py-2">
          <CostCenterTreeNodes
            :nodes="store.treeItems"
            :depth="0"
            :can-update="canUpdate"
            :can-activate="canActivate"
            :can-deactivate="canDeactivate"
            :can-delete="canDelete"
            :action-loading="actionLoading"
            @edit="openEdit"
            @activate="(item) => toggleStatus(item, true)"
            @deactivate="(item) => toggleStatus(item, false)"
            @delete="confirmDelete"
          />
        </v-list>
      </template>
    </v-card>

    <CostCenterFormDialog
      v-model="dialogOpen"
      :cost-center="editingCostCenter"
      :parent-options="store.optionsItems"
      :department-options="departmentsStore.optionsItems"
      :saving="store.saving || actionLoading"
      @submit="handleSubmit"
    />

    <v-dialog v-model="deleteDialogOpen" max-width="440">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('costCenter.deleteTitle') }}
        </v-card-title>
        <v-card-text class="text-medium-emphasis">
          {{ t('costCenter.deleteConfirm', { name: deleteTargetName }) }}
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
import CostCenterFormDialog from "~/components/costCenter/CostCenterFormDialog.vue";
import CostCenterTreeNodes from "~/components/costCenter/CostCenterTreeNodes.vue";
import {
  COST_CENTER_STATUSES,
  costCenterDisplayName,
} from "~/utils/costCenterConstants";
import { branchDisplayName } from "~/utils/branchConstants";
import { departmentDisplayName } from "~/utils/departmentConstants";
import { warehouseDisplayName } from "~/utils/warehouseConstants";
import { userDisplayName } from "~/utils/userConstants";
import { enumValue } from "~/utils/enumValue";
import { useSnackbar } from "~/composables/useSnackbar";

definePageMeta({
  middleware: ["auth", "tenant", "permission"],
  permission: ["cost_centers.view", "cost_centers.view_tree"],
});

const { t, locale } = useAppLocale();
const { hasPermission, canAccessPermission, canAccessBranch } = usePermissions();
const { showSnackbar } = useSnackbar();
const store = useCostCentersStore();
const branchesStore = useBranchesStore();
const departmentsStore = useDepartmentsStore();
const warehousesStore = useWarehousesStore();
const usersStore = useUsersStore();

useHead({
  title: () => t("navigation.costCentersManagement"),
});

const canView = computed(() =>
  canAccessPermission("cost_centers.view", "cost_centers.view_tree"),
);
const canCreate = computed(() => hasPermission("cost_centers.create"));
const canUpdate = computed(() => hasPermission("cost_centers.update"));
const canDelete = computed(() => hasPermission("cost_centers.delete"));
const canRestore = computed(() => hasPermission("cost_centers.restore"));
const canForceDelete = computed(() => hasPermission("cost_centers.force_delete"));
const canActivate = computed(() => hasPermission("cost_centers.activate"));
const canDeactivate = computed(() => hasPermission("cost_centers.deactivate"));
const canViewTree = computed(() =>
  canAccessPermission("cost_centers.view_tree", "cost_centers.view"),
);

const showDeleted = computed(() => store.filters.trashed === "only");

const viewMode = ref("list");
const search = ref("");
const status = ref(null);
const branchId = ref(null);
const departmentId = ref(null);
const warehouseId = ref(null);
const parentId = ref(null);
const trashedFilter = ref(null);
const page = ref(1);
const dialogOpen = ref(false);
const editingCostCenter = ref(null);
const actionLoading = ref(false);
const deleteDialogOpen = ref(false);
const deletingCostCenter = ref(null);
const forceDeleteDialogOpen = ref(false);
const forceDeletingCostCenter = ref(null);
const allWarehouses = ref([]);
const allUsers = ref([]);

const usersById = computed(() => {
  const map = new Map();
  for (const user of allUsers.value) {
    map.set(user.id, user);
  }
  return map;
});

const deleteTargetName = computed(() =>
  deletingCostCenter.value ? displayName(deletingCostCenter.value) : "",
);

const forceDeleteTargetName = computed(() =>
  forceDeletingCostCenter.value ? displayName(forceDeletingCostCenter.value) : "",
);

const statusItems = computed(() =>
  COST_CENTER_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const branchFilterItems = computed(() =>
  branchesStore.optionsItems.map((item) => ({
    value: item.id,
    title: branchDisplayName(item, locale.value),
  })),
);

const departmentFilterItems = computed(() =>
  departmentsStore.optionsItems.map((item) => ({
    value: item.id,
    title: departmentDisplayName(item, locale.value),
  })),
);

const warehouseFilterItems = computed(() =>
  allWarehouses.value.map((item) => ({
    value: item.id,
    title: warehouseDisplayName(item, locale.value),
  })),
);

const parentFilterItems = computed(() =>
  store.optionsItems.map((item) => ({
    value: item.id,
    title: costCenterDisplayName(item, locale.value),
  })),
);

const trashedItems = computed(() => [
  { value: null, title: t("common.showDeletedAll") },
  { value: "only", title: t("common.showDeletedOnly") },
]);

function displayName(costCenter) {
  return costCenterDisplayName(costCenter, locale.value);
}

function isActive(costCenter) {
  return enumValue(costCenter.status) === "active";
}

function statusLabel(costCenter) {
  return isActive(costCenter)
    ? t("costCenter.statusActive")
    : t("costCenter.statusInactive");
}

function parentLabel(costCenter) {
  if (costCenter.parent) {
    return costCenterDisplayName(costCenter.parent, locale.value);
  }
  if (!costCenter.parent_id) return "—";
  const match = store.optionsItems.find((item) => item.id === costCenter.parent_id);
  return match ? costCenterDisplayName(match, locale.value) : "—";
}

function branchLabel(costCenter) {
  if (costCenter.branch) {
    return branchDisplayName(costCenter.branch, locale.value);
  }
  if (!costCenter.branch_id) return "—";
  const match = branchesStore.optionsItems.find(
    (item) => item.id === costCenter.branch_id,
  );
  return match ? branchDisplayName(match, locale.value) : "—";
}

function departmentLabel(costCenter) {
  if (costCenter.department) {
    return departmentDisplayName(costCenter.department, locale.value);
  }
  if (!costCenter.department_id) return "—";
  const match = departmentsStore.optionsItems.find(
    (item) => item.id === costCenter.department_id,
  );
  return match ? departmentDisplayName(match, locale.value) : "—";
}

function warehouseLabel(costCenter) {
  if (costCenter.warehouse) {
    return warehouseDisplayName(costCenter.warehouse, locale.value);
  }
  if (!costCenter.warehouse_id) return "—";
  const match = allWarehouses.value.find(
    (item) => item.id === costCenter.warehouse_id,
  );
  return match ? warehouseDisplayName(match, locale.value) : "—";
}

function managerLabel(costCenter) {
  if (!costCenter.manager_id) return "—";
  const user = usersById.value.get(costCenter.manager_id);
  return user ? userDisplayName(user, locale.value) : "—";
}

async function loadWarehouses() {
  const { items, error } = await warehousesStore.fetchAll();
  if (!error) allWarehouses.value = items;
}

async function loadUsers() {
  const { items, error } = await usersStore.fetchAll();
  if (!error) allUsers.value = items;
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
    department_id: departmentId.value || null,
    warehouse_id: warehouseId.value || null,
  });
}

function applyFilters() {
  store.setFilters({
    search: search.value?.trim() || "",
    status: status.value || null,
    branch_id: branchId.value || null,
    department_id: departmentId.value || null,
    warehouse_id: warehouseId.value || null,
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

async function handleRestore(costCenter) {
  if (!costCenter?.id) return;

  actionLoading.value = true;
  try {
    const result = await store.restore(costCenter.id);
    if (!result.error) {
      showSnackbar(t("costCenter.restored"), 200);
    }
  } finally {
    actionLoading.value = false;
  }
}

function openCreate() {
  editingCostCenter.value = null;
  dialogOpen.value = true;
}

async function openEdit(costCenter) {
  actionLoading.value = true;
  try {
    const { costCenter: fresh, error } = await store.show(costCenter.id);
    if (error || !fresh) return;
    editingCostCenter.value = fresh;
    dialogOpen.value = true;
  } finally {
    actionLoading.value = false;
  }
}

async function handleSubmit({ payload, applyServerErrors }) {
  actionLoading.value = true;

  try {
    if (editingCostCenter.value?.id) {
      const { error } = await store.update(editingCostCenter.value.id, payload);

      if (error) {
        applyServerErrors(error.errors);
        return;
      }

      showSnackbar(t("costCenter.updated"), 200);
      dialogOpen.value = false;
      if (viewMode.value === "tree") await loadTree();
      return;
    }

    const { error } = await store.create(payload);

    if (error) {
      applyServerErrors(error.errors);
      return;
    }

    showSnackbar(t("costCenter.created"), 200);
    dialogOpen.value = false;
    if (viewMode.value === "tree") await loadTree();
  } finally {
    actionLoading.value = false;
  }
}

async function toggleStatus(costCenter, activate) {
  actionLoading.value = true;

  try {
    const result = activate
      ? await store.activate(costCenter.id)
      : await store.deactivate(costCenter.id);

    if (!result.error) {
      showSnackbar(
        activate ? t("costCenter.activated") : t("costCenter.deactivated"),
        200,
      );
      if (viewMode.value === "tree") await loadTree();
    }
  } finally {
    actionLoading.value = false;
  }
}

function confirmDelete(costCenter) {
  deletingCostCenter.value = costCenter;
  deleteDialogOpen.value = true;
}

async function handleDelete() {
  if (!deletingCostCenter.value?.id) return;

  actionLoading.value = true;

  try {
    const result = await store.destroy(deletingCostCenter.value.id);

    if (!result.error) {
      showSnackbar(t("costCenter.deleted"), 200);
      deleteDialogOpen.value = false;
      deletingCostCenter.value = null;
      if (viewMode.value === "tree") await loadTree();
    }
  } finally {
    actionLoading.value = false;
  }
}

function confirmForceDelete(costCenter) {
  forceDeletingCostCenter.value = costCenter;
  forceDeleteDialogOpen.value = true;
}

async function handleForceDelete() {
  if (!forceDeletingCostCenter.value?.id) return;

  actionLoading.value = true;

  try {
    const result = await store.forceDestroy(forceDeletingCostCenter.value.id);

    if (!result.error) {
      showSnackbar(t("common.permanentlyDeleted"), 200);
      forceDeleteDialogOpen.value = false;
      forceDeletingCostCenter.value = null;
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
  departmentId.value = store.filters.department_id || null;
  warehouseId.value = store.filters.warehouse_id || null;
  parentId.value = store.filters.parent_id || null;
  trashedFilter.value = store.filters.trashed || null;

  if (showDeleted.value && viewMode.value === "tree") {
    viewMode.value = "list";
  }

  await Promise.all([
    canView.value ? loadPage(store.meta.current_page || 1) : Promise.resolve(),
    store.fetchAll(),
    branchesStore.fetchAll(),
    departmentsStore.fetchAll(),
    loadWarehouses(),
    loadUsers(),
  ]);
});
</script>

<style scoped>
.cost-center-toolbar {
  padding-block: 20px !important;
}

.cost-center-table :deep(th) {
  font-weight: 600 !important;
  color: rgba(var(--v-theme-on-surface), 0.55) !important;
  white-space: nowrap;
}

.cost-center-table :deep(td) {
  border-bottom-color: rgba(var(--v-theme-on-surface), 0.06) !important;
}
</style>
