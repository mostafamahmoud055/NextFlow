<template>
  <div class="warehouse-management">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4 mb-md-6">
      <div>
        <p class="text-body-2 text-medium-emphasis mb-1">
          {{ t('navigation.companySettings') }}
        </p>
        <h1 class="text-h4 font-weight-bold text-high-emphasis dashboard-page-title">
          {{ t('navigation.warehousesManagement') }}
        </h1>
      </div>

      <v-btn
        v-if="canCreate && !showDeleted"
        color="primary"
        class="text-none"
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        {{ t('warehouse.create') }}
      </v-btn>
    </div>

    <v-card class="dashboard-card warehouse-toolbar mb-4" elevation="0">
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
            :label="t('warehouse.status')"
            clearable
            variant="outlined"
            hide-details
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" sm="6" md="2">
          <v-select
            v-model="type"
            :items="typeItems"
            item-title="title"
            item-value="value"
            :label="t('warehouse.type')"
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
            :label="t('warehouse.branch')"
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
            {{ t('warehouse.applyFilters') }}
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
        <v-icon size="40" class="mb-3">mdi-warehouse</v-icon>
        <div>{{ t('warehouse.empty') }}</div>
      </div>

      <template v-else>
        <v-table class="warehouse-table">
          <thead>
            <tr>
              <th>{{ t('warehouse.warehouse') }}</th>
              <th class="d-none d-md-table-cell">{{ t('warehouse.code') }}</th>
              <th class="d-none d-lg-table-cell">{{ t('warehouse.type') }}</th>
              <th class="d-none d-lg-table-cell">{{ t('warehouse.branch') }}</th>
              <th class="d-none d-lg-table-cell">{{ t('warehouse.manager') }}</th>
              <th>{{ t('warehouse.status') }}</th>
              <th class="text-end">{{ t('warehouse.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="warehouse in store.items" :key="warehouse.id">
              <td>
                <div class="py-2">
                  <div class="font-weight-medium">
                    {{ displayName(warehouse) }}
                  </div>
                  <div
                    v-if="warehouse.location"
                    class="text-caption text-medium-emphasis"
                  >
                    {{ warehouse.location }}
                  </div>
                </div>
              </td>
              <td class="d-none d-md-table-cell text-medium-emphasis">
                {{ warehouse.warehouse_code || '—' }}
              </td>
              <td class="d-none d-lg-table-cell text-medium-emphasis">
                {{ typeLabel(warehouse) }}
              </td>
              <td class="d-none d-lg-table-cell text-medium-emphasis">
                {{ branchLabel(warehouse) }}
              </td>
              <td class="d-none d-lg-table-cell text-medium-emphasis">
                {{ managerLabel(warehouse) }}
              </td>
              <td>
                <v-chip
                  size="small"
                  :color="isActive(warehouse) ? 'success' : 'secondary'"
                  variant="tonal"
                >
                  {{ statusLabel(warehouse) }}
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
                      :aria-label="t('warehouse.actions')"
                    >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>

                  <v-list density="compact" min-width="220">
                    <template v-if="!showDeleted">
                      <v-list-item
                        v-if="canUpdate && canAccessBranch(warehouse.branch_id)"
                        prepend-icon="mdi-pencil-outline"
                        :title="t('buttons.edit')"
                        :disabled="actionLoading"
                        @click="openEdit(warehouse)"
                      />
                      <v-list-item
                        v-if="canAssignBranch && canAccessBranch(warehouse.branch_id)"
                        prepend-icon="mdi-store-marker-outline"
                        :title="t('warehouse.assignBranch')"
                        :disabled="actionLoading"
                        @click="openAssignBranch(warehouse)"
                      />
                      <v-list-item
                        v-if="canAssignManager && canAccessBranch(warehouse.branch_id)"
                        prepend-icon="mdi-account-outline"
                        :title="t('warehouse.assignManager')"
                        :disabled="actionLoading"
                        @click="openAssignManager(warehouse)"
                      />
                      <v-list-item
                        v-if="canActivate && canAccessBranch(warehouse.branch_id) && !isActive(warehouse)"
                        prepend-icon="mdi-check-circle-outline"
                        :title="t('warehouse.activate')"
                        :disabled="actionLoading"
                        @click="toggleStatus(warehouse, true)"
                      />
                      <v-list-item
                        v-if="canDeactivate && canAccessBranch(warehouse.branch_id) && isActive(warehouse)"
                        prepend-icon="mdi-cancel"
                        :title="t('warehouse.deactivate')"
                        :disabled="actionLoading"
                        @click="toggleStatus(warehouse, false)"
                      />
                      <v-list-item
                        v-if="canDelete && canAccessBranch(warehouse.branch_id)"
                        prepend-icon="mdi-delete-outline"
                        :title="t('buttons.delete')"
                        class="text-error"
                        :disabled="actionLoading"
                        @click="confirmDelete(warehouse)"
                      />
                    </template>
                    <template v-else>
                      <v-list-item
                        v-if="canRestore && canAccessBranch(warehouse.branch_id)"
                        prepend-icon="mdi-delete-restore"
                        :title="t('buttons.restore')"
                        :disabled="actionLoading"
                        @click="handleRestore(warehouse)"
                      />
                      <v-list-item
                        v-if="canForceDelete && canAccessBranch(warehouse.branch_id)"
                        prepend-icon="mdi-delete-forever-outline"
                        :title="t('buttons.permanentDelete')"
                        class="text-error"
                        :disabled="actionLoading"
                        @click="confirmForceDelete(warehouse)"
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
    </v-card>

    <WarehouseFormDialog
      v-model="dialogOpen"
      :warehouse="editingWarehouse"
      :saving="store.saving || actionLoading"
      @submit="handleSubmit"
    />

    <v-dialog v-model="assignBranchOpen" max-width="440">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('warehouse.assignBranchTitle') }}
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="assignBranchId"
            :items="branchFilterItems"
            item-title="title"
            item-value="value"
            :label="t('warehouse.branch')"
            :rules="[requiredRule]"
            variant="outlined"
            hide-details="auto"
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" class="text-none" @click="assignBranchOpen = false">
            {{ t('buttons.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            class="text-none"
            :loading="actionLoading"
            :disabled="!assignBranchId"
            @click="handleAssignBranch"
          >
            {{ t('warehouse.assignBranch') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="assignManagerOpen" max-width="440">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('warehouse.assignManagerTitle') }}
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="assignManagerId"
            :items="managerItems"
            item-title="title"
            item-value="value"
            :label="t('warehouse.manager')"
            :loading="usersLoading"
            clearable
            variant="outlined"
            hide-details="auto"
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" class="text-none" @click="assignManagerOpen = false">
            {{ t('buttons.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            class="text-none"
            :loading="actionLoading"
            @click="handleAssignManager"
          >
            {{ t('warehouse.assignManager') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialogOpen" max-width="440">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('warehouse.deleteTitle') }}
        </v-card-title>
        <v-card-text class="text-medium-emphasis">
          {{ t('warehouse.deleteConfirm', { name: deleteTargetName }) }}
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
import WarehouseFormDialog from "~/components/warehouse/WarehouseFormDialog.vue";
import {
  WAREHOUSE_STATUSES,
  WAREHOUSE_TYPES,
  warehouseDisplayName,
} from "~/utils/warehouseConstants";
import { branchDisplayName } from "~/utils/branchConstants";
import { userDisplayName } from "~/utils/userConstants";
import { enumValue } from "~/utils/enumValue";
import { useSnackbar } from "~/composables/useSnackbar";

definePageMeta({
  middleware: ["auth", "tenant", "permission"],
  permission: "warehouses.view",
});

const { t, locale } = useAppLocale();
const { hasPermission, canAccessBranch } = usePermissions();
const { showSnackbar } = useSnackbar();
const store = useWarehousesStore();
const branchesStore = useBranchesStore();
const usersStore = useUsersStore();

useHead({
  title: () => t("navigation.warehousesManagement"),
});

const canCreate = computed(() => hasPermission("warehouses.create"));
const canUpdate = computed(() => hasPermission("warehouses.update"));
const canDelete = computed(() => hasPermission("warehouses.delete"));
const canRestore = computed(() => hasPermission("warehouses.restore"));
const canForceDelete = computed(() => hasPermission("warehouses.force_delete"));
const canActivate = computed(() => hasPermission("warehouses.activate"));
const canDeactivate = computed(() => hasPermission("warehouses.deactivate"));
const canAssignBranch = computed(() => hasPermission("warehouses.assign_branch"));

const showDeleted = computed(() => store.filters.trashed === "only");
const canAssignManager = computed(() => hasPermission("warehouses.assign_manager"));

const search = ref("");
const status = ref(null);
const type = ref(null);
const branchId = ref(null);
const trashedFilter = ref(null);
const page = ref(1);
const dialogOpen = ref(false);
const editingWarehouse = ref(null);
const actionLoading = ref(false);
const deleteDialogOpen = ref(false);
const deletingWarehouse = ref(null);
const forceDeleteDialogOpen = ref(false);
const forceDeletingWarehouse = ref(null);

const assignBranchOpen = ref(false);
const assignBranchId = ref(null);
const assigningWarehouse = ref(null);
const allBranches = ref([]);
const allUsers = ref([]);
const usersLoading = ref(false);

const assignManagerOpen = ref(false);
const assignManagerId = ref(null);

const usersById = computed(() => {
  const map = new Map();
  for (const user of allUsers.value) {
    map.set(user.id, user);
  }
  return map;
});

const deleteTargetName = computed(() =>
  deletingWarehouse.value ? displayName(deletingWarehouse.value) : "",
);

const forceDeleteTargetName = computed(() =>
  forceDeletingWarehouse.value ? displayName(forceDeletingWarehouse.value) : "",
);

const statusItems = computed(() =>
  WAREHOUSE_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const typeItems = computed(() =>
  WAREHOUSE_TYPES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const trashedItems = computed(() => [
  { value: null, title: t("common.showDeletedAll") },
  { value: "only", title: t("common.showDeletedOnly") },
]);

const branchFilterItems = computed(() =>
  allBranches.value.map((item) => ({
    value: item.id,
    title: branchDisplayName(item, locale.value),
  })),
);

const managerItems = computed(() =>
  allUsers.value.map((user) => ({
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

function displayName(warehouse) {
  return warehouseDisplayName(warehouse, locale.value);
}

function isActive(warehouse) {
  if (typeof warehouse.is_active === "boolean") return warehouse.is_active;
  return enumValue(warehouse.status) === "active";
}

function statusLabel(warehouse) {
  return isActive(warehouse)
    ? t("warehouse.statusActive")
    : t("warehouse.statusInactive");
}

function typeLabel(warehouse) {
  const value = enumValue(warehouse.type);
  const match = WAREHOUSE_TYPES.find((item) => item.value === value);
  return match ? t(match.labelKey) : warehouse.type?.label || "—";
}

function branchLabel(warehouse) {
  if (warehouse.branch) {
    return branchDisplayName(warehouse.branch, locale.value);
  }
  if (!warehouse.branch_id) return "—";
  const match = allBranches.value.find(
    (item) => item.id === warehouse.branch_id,
  );
  return match ? branchDisplayName(match, locale.value) : "—";
}

function managerLabel(warehouse) {
  if (!warehouse.manager_id) return "—";
  const user = usersById.value.get(warehouse.manager_id);
  return user ? userDisplayName(user, locale.value) : "—";
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
    type: type.value || null,
    branch_id: branchId.value || null,
    trashed: trashedFilter.value || null,
  });
  loadPage(1, true);
}

async function handleRestore(warehouse) {
  if (!warehouse?.id) return;

  actionLoading.value = true;
  try {
    const result = await store.restore(warehouse.id);
    if (!result.error) {
      showSnackbar(t("warehouse.restored"), 200);
    }
  } finally {
    actionLoading.value = false;
  }
}

function openCreate() {
  editingWarehouse.value = null;
  dialogOpen.value = true;
}

function openEdit(warehouse) {
  editingWarehouse.value = warehouse;
  dialogOpen.value = true;
}

function openAssignBranch(warehouse) {
  assigningWarehouse.value = warehouse;
  assignBranchId.value = warehouse.branch_id || null;
  assignBranchOpen.value = true;
}

function openAssignManager(warehouse) {
  assigningWarehouse.value = warehouse;
  assignManagerId.value = warehouse.manager_id ?? null;
  assignManagerOpen.value = true;
}

async function handleSubmit({ payload, applyServerErrors }) {
  actionLoading.value = true;

  try {
    if (editingWarehouse.value?.id) {
      const { error } = await store.update(editingWarehouse.value.id, payload);

      if (error) {
        applyServerErrors(error.errors);
        return;
      }

      showSnackbar(t("warehouse.updated"), 200);
      dialogOpen.value = false;
      return;
    }

    const { error } = await store.create(payload);

    if (error) {
      applyServerErrors(error.errors);
      return;
    }

    showSnackbar(t("warehouse.created"), 200);
    dialogOpen.value = false;
  } finally {
    actionLoading.value = false;
  }
}

async function handleAssignBranch() {
  if (!assigningWarehouse.value?.id || !assignBranchId.value) return;

  actionLoading.value = true;
  try {
    const result = await store.assignBranch(
      assigningWarehouse.value.id,
      assignBranchId.value,
    );
    if (!result.error) {
      showSnackbar(t("warehouse.branchAssigned"), 200);
      assignBranchOpen.value = false;
      assigningWarehouse.value = null;
    }
  } finally {
    actionLoading.value = false;
  }
}

async function handleAssignManager() {
  if (!assigningWarehouse.value?.id) return;

  actionLoading.value = true;
  try {
    const result = await store.assignManager(
      assigningWarehouse.value.id,
      assignManagerId.value ?? null,
    );
    if (!result.error) {
      showSnackbar(t("warehouse.managerAssigned"), 200);
      assignManagerOpen.value = false;
      assigningWarehouse.value = null;
    }
  } finally {
    actionLoading.value = false;
  }
}

async function toggleStatus(warehouse, activate) {
  actionLoading.value = true;

  try {
    const result = activate
      ? await store.activate(warehouse.id)
      : await store.deactivate(warehouse.id);

    if (!result.error) {
      showSnackbar(
        activate ? t("warehouse.activated") : t("warehouse.deactivated"),
        200,
      );
    }
  } finally {
    actionLoading.value = false;
  }
}

function confirmDelete(warehouse) {
  deletingWarehouse.value = warehouse;
  deleteDialogOpen.value = true;
}

async function handleDelete() {
  if (!deletingWarehouse.value?.id) return;

  actionLoading.value = true;

  try {
    const result = await store.destroy(deletingWarehouse.value.id);

    if (!result.error) {
      showSnackbar(t("warehouse.deleted"), 200);
      deleteDialogOpen.value = false;
      deletingWarehouse.value = null;
    }
  } finally {
    actionLoading.value = false;
  }
}

function confirmForceDelete(warehouse) {
  forceDeletingWarehouse.value = warehouse;
  forceDeleteDialogOpen.value = true;
}

async function handleForceDelete() {
  if (!forceDeletingWarehouse.value?.id) return;

  actionLoading.value = true;

  try {
    const result = await store.forceDestroy(forceDeletingWarehouse.value.id);

    if (!result.error) {
      showSnackbar(t("common.permanentlyDeleted"), 200);
      forceDeleteDialogOpen.value = false;
      forceDeletingWarehouse.value = null;
    }
  } finally {
    actionLoading.value = false;
  }
}

async function loadBranches() {
  const { items, error } = await branchesStore.fetchAll();
  if (!error) allBranches.value = items;
}

async function loadUsers() {
  usersLoading.value = true;
  try {
    const { items, error } = await usersStore.fetchAll();
    if (!error) allUsers.value = items;
  } finally {
    usersLoading.value = false;
  }
}

onMounted(async () => {
  search.value = store.filters.search || "";
  status.value = store.filters.status || null;
  type.value = store.filters.type || null;
  branchId.value = store.filters.branch_id || null;
  trashedFilter.value = store.filters.trashed || null;

  await Promise.all([
    loadPage(store.meta.current_page || 1),
    loadBranches(),
    loadUsers(),
  ]);
});
</script>

<style scoped>
.warehouse-toolbar {
  padding-block: 20px !important;
}

.warehouse-table :deep(th) {
  font-weight: 600 !important;
  color: rgba(var(--v-theme-on-surface), 0.55) !important;
  white-space: nowrap;
}

.warehouse-table :deep(td) {
  border-bottom-color: rgba(var(--v-theme-on-surface), 0.06) !important;
}
</style>
