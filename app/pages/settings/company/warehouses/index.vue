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
        v-if="canCreate"
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
        <v-col cols="12" sm="6" md="2" class="d-flex justify-end">
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
                    <v-list-item
                      v-if="canUpdate"
                      prepend-icon="mdi-pencil-outline"
                      :title="t('buttons.edit')"
                      :disabled="actionLoading"
                      @click="openEdit(warehouse)"
                    />
                    <v-list-item
                      v-if="canAssignBranch"
                      prepend-icon="mdi-store-marker-outline"
                      :title="t('warehouse.assignBranch')"
                      :disabled="actionLoading"
                      @click="openAssignBranch(warehouse)"
                    />
                    <v-list-item
                      v-if="canAssignManager"
                      prepend-icon="mdi-account-outline"
                      :title="t('warehouse.assignManager')"
                      :disabled="actionLoading"
                      @click="openAssignManager(warehouse)"
                    />
                    <v-list-item
                      v-if="canActivate && !isActive(warehouse)"
                      prepend-icon="mdi-check-circle-outline"
                      :title="t('warehouse.activate')"
                      :disabled="actionLoading"
                      @click="toggleStatus(warehouse, true)"
                    />
                    <v-list-item
                      v-if="canDeactivate && isActive(warehouse)"
                      prepend-icon="mdi-cancel"
                      :title="t('warehouse.deactivate')"
                      :disabled="actionLoading"
                      @click="toggleStatus(warehouse, false)"
                    />
                    <v-list-item
                      v-if="canDelete"
                      prepend-icon="mdi-delete-outline"
                      :title="t('buttons.delete')"
                      class="text-error"
                      :disabled="actionLoading"
                      @click="confirmDelete(warehouse)"
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
    </v-card>

    <WarehouseFormDialog
      v-model="dialogOpen"
      :warehouse="editingWarehouse"
      :branch-options="branchesStore.allItems"
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
          <v-text-field
            v-model="assignManagerId"
            :label="t('warehouse.managerId')"
            type="number"
            min="1"
            clearable
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
import { enumValue } from "~/utils/enumValue";
import { useSnackbar } from "~/composables/useSnackbar";

definePageMeta({
  middleware: ["auth", "tenant"],
});

const { t, locale } = useAppLocale();
const { hasPermission } = usePermissions();
const { showSnackbar } = useSnackbar();
const store = useWarehousesStore();
const branchesStore = useBranchesStore();

useHead({
  title: () => t("navigation.warehousesManagement"),
});

const canCreate = computed(() => hasPermission("warehouses.create"));
const canUpdate = computed(() => hasPermission("warehouses.update"));
const canDelete = computed(() => hasPermission("warehouses.delete"));
const canActivate = computed(() => hasPermission("warehouses.activate"));
const canDeactivate = computed(() => hasPermission("warehouses.deactivate"));
const canAssignBranch = computed(() => hasPermission("warehouses.assign_branch"));
const canAssignManager = computed(() => hasPermission("warehouses.assign_manager"));

const search = ref("");
const status = ref(null);
const type = ref(null);
const branchId = ref(null);
const page = ref(1);
const dialogOpen = ref(false);
const editingWarehouse = ref(null);
const actionLoading = ref(false);
const deleteDialogOpen = ref(false);
const deletingWarehouse = ref(null);

const assignBranchOpen = ref(false);
const assignBranchId = ref(null);
const assigningWarehouse = ref(null);

const assignManagerOpen = ref(false);
const assignManagerId = ref("");

const deleteTargetName = computed(() =>
  deletingWarehouse.value ? displayName(deletingWarehouse.value) : "",
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

const branchFilterItems = computed(() =>
  branchesStore.allItems.map((item) => ({
    value: item.id,
    title: branchDisplayName(item, locale.value),
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
  const match = branchesStore.allItems.find(
    (item) => item.id === warehouse.branch_id,
  );
  return match ? branchDisplayName(match, locale.value) : "—";
}

async function loadPage(nextPage = page.value, force = false) {
  page.value = nextPage;
  await store.fetchList(nextPage, force);
}

function applyFilters() {
  store.setFilters({
    search: search.value?.trim() || "",
    status: status.value || null,
    type: type.value || null,
    branch_id: branchId.value || null,
  });
  loadPage(1, true);
}

function clearSearch() {
  search.value = "";
  applyFilters();
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
  assignManagerId.value =
    warehouse.manager_id != null ? String(warehouse.manager_id) : "";
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
    const managerId =
      assignManagerId.value === "" || assignManagerId.value == null
        ? null
        : Number(assignManagerId.value);

    const result = await store.assignManager(
      assigningWarehouse.value.id,
      managerId,
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

onMounted(async () => {
  search.value = store.filters.search || "";
  status.value = store.filters.status || null;
  type.value = store.filters.type || null;
  branchId.value = store.filters.branch_id || null;

  await Promise.all([
    loadPage(store.meta.current_page || 1),
    branchesStore.fetchList(),
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
