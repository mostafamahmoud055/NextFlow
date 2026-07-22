<template>
  <div class="profit-center-management">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4 mb-md-6">
      <div>
        <p class="text-body-2 text-medium-emphasis mb-1">
          {{ t('navigation.financialSetup') }}
        </p>
        <h1 class="text-h4 font-weight-bold text-high-emphasis dashboard-page-title">
          {{ t('navigation.profitCentersManagement') }}
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
            {{ t('profitCenter.listView') }}
          </v-btn>
          <v-btn
            v-if="canViewTree && !showDeleted"
            value="tree"
            class="text-none"
            prepend-icon="mdi-file-tree-outline"
          >
            {{ t('profitCenter.treeView') }}
          </v-btn>
        </v-btn-toggle>

        <v-btn
          v-if="canCreate && !showDeleted"
          color="primary"
          class="text-none"
          prepend-icon="mdi-plus"
          @click="openCreate"
        >
          {{ t('profitCenter.create') }}
        </v-btn>
      </div>
    </div>

    <v-card class="dashboard-card profit-center-toolbar mb-4" elevation="0">
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
            :label="t('profitCenter.status')"
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
            :label="t('profitCenter.branch')"
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
            :label="t('profitCenter.department')"
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
            :label="t('profitCenter.parent')"
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
            {{ t('profitCenter.applyFilters') }}
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
          <v-icon size="40" class="mb-3">mdi-chart-timeline-variant</v-icon>
          <div>{{ t('profitCenter.empty') }}</div>
        </div>

        <template v-else>
          <v-table class="profit-center-table">
            <thead>
              <tr>
                <th>{{ t('profitCenter.profitCenter') }}</th>
                <th class="d-none d-md-table-cell">{{ t('profitCenter.code') }}</th>
                <th class="d-none d-lg-table-cell">{{ t('profitCenter.parent') }}</th>
                <th class="d-none d-lg-table-cell">{{ t('profitCenter.branch') }}</th>
                <th class="d-none d-lg-table-cell">{{ t('profitCenter.department') }}</th>
                <th class="d-none d-lg-table-cell">{{ t('profitCenter.productCategory') }}</th>
                <th class="d-none d-lg-table-cell">{{ t('profitCenter.manager') }}</th>
                <th>{{ t('profitCenter.status') }}</th>
                <th class="text-end">{{ t('profitCenter.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="profitCenter in store.items" :key="profitCenter.id">
                <td>
                  <div class="font-weight-medium py-2">
                    {{ displayName(profitCenter) }}
                  </div>
                </td>
                <td class="d-none d-md-table-cell text-medium-emphasis">
                  {{ profitCenter.profit_center_code || '—' }}
                </td>
                <td class="d-none d-lg-table-cell text-medium-emphasis">
                  {{ parentLabel(profitCenter) }}
                </td>
                <td class="d-none d-lg-table-cell text-medium-emphasis">
                  {{ branchLabel(profitCenter) }}
                </td>
                <td class="d-none d-lg-table-cell text-medium-emphasis">
                  {{ departmentLabel(profitCenter) }}
                </td>
                <td class="d-none d-lg-table-cell text-medium-emphasis">
                  {{ profitCenter.product_category_id || '—' }}
                </td>
                <td class="d-none d-lg-table-cell text-medium-emphasis">
                  {{ managerLabel(profitCenter) }}
                </td>
                <td>
                  <v-chip
                    size="small"
                    :color="isActive(profitCenter) ? 'success' : 'secondary'"
                    variant="tonal"
                  >
                    {{ statusLabel(profitCenter) }}
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
                        :aria-label="t('profitCenter.actions')"
                      >
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>

                    <v-list density="compact" min-width="200">
                      <template v-if="!showDeleted">
                        <v-list-item
                          v-if="canUpdate && canAccessBranch(profitCenter.branch_id)"
                          prepend-icon="mdi-pencil-outline"
                          :title="t('buttons.edit')"
                          :disabled="actionLoading"
                          @click="openEdit(profitCenter)"
                        />
                        <v-list-item
                          v-if="canActivate && canAccessBranch(profitCenter.branch_id) && !isActive(profitCenter)"
                          prepend-icon="mdi-check-circle-outline"
                          :title="t('profitCenter.activate')"
                          :disabled="actionLoading"
                          @click="toggleStatus(profitCenter, true)"
                        />
                        <v-list-item
                          v-if="canDeactivate && canAccessBranch(profitCenter.branch_id) && isActive(profitCenter)"
                          prepend-icon="mdi-cancel"
                          :title="t('profitCenter.deactivate')"
                          :disabled="actionLoading"
                          @click="toggleStatus(profitCenter, false)"
                        />
                        <v-list-item
                          v-if="canDelete && canAccessBranch(profitCenter.branch_id)"
                          prepend-icon="mdi-delete-outline"
                          :title="t('buttons.delete')"
                          class="text-error"
                          :disabled="actionLoading"
                          @click="confirmDelete(profitCenter)"
                        />
                      </template>
                      <template v-else>
                        <v-list-item
                          v-if="canRestore && canAccessBranch(profitCenter.branch_id)"
                          prepend-icon="mdi-delete-restore"
                          :title="t('buttons.restore')"
                          :disabled="actionLoading"
                          @click="handleRestore(profitCenter)"
                        />
                        <v-list-item
                          v-if="canForceDelete && canAccessBranch(profitCenter.branch_id)"
                          prepend-icon="mdi-delete-forever-outline"
                          :title="t('buttons.permanentDelete')"
                          class="text-error"
                          :disabled="actionLoading"
                          @click="confirmForceDelete(profitCenter)"
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
          <div>{{ t('profitCenter.emptyTree') }}</div>
        </div>

        <v-list v-else class="py-2">
          <ProfitCenterTreeNodes
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

    <ProfitCenterFormDialog
      v-model="dialogOpen"
      :profit-center="editingProfitCenter"
      :parent-options="parentOptions"
      :department-options="departmentsStore.optionsItems"
      :saving="store.saving || actionLoading"
      @submit="handleSubmit"
    />

    <v-dialog v-model="deleteDialogOpen" max-width="440">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('profitCenter.deleteTitle') }}
        </v-card-title>
        <v-card-text class="text-medium-emphasis">
          {{ t('profitCenter.deleteConfirm', { name: deleteTargetName }) }}
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
import ProfitCenterFormDialog from "~/components/profitCenter/ProfitCenterFormDialog.vue";
import ProfitCenterTreeNodes from "~/components/profitCenter/ProfitCenterTreeNodes.vue";
import {
  PROFIT_CENTER_STATUSES,
  profitCenterDisplayName,
} from "~/utils/profitCenterConstants";
import { branchDisplayName } from "~/utils/branchConstants";
import { departmentDisplayName } from "~/utils/departmentConstants";
import { userDisplayName } from "~/utils/userConstants";
import { enumValue } from "~/utils/enumValue";
import { useSnackbar } from "~/composables/useSnackbar";

definePageMeta({
  middleware: ["auth", "tenant", "permission"],
  permission: ["profit_centers.view", "profit_centers.view_tree"],
});

const { t, locale } = useAppLocale();
const { hasPermission, canAccessPermission, canAccessBranch } = usePermissions();
const { showSnackbar } = useSnackbar();
const store = useProfitCentersStore();
const branchesStore = useBranchesStore();
const departmentsStore = useDepartmentsStore();
const usersStore = useUsersStore();

useHead({
  title: () => t("navigation.profitCentersManagement"),
});

const canView = computed(() =>
  canAccessPermission("profit_centers.view", "profit_centers.view_tree"),
);
const canCreate = computed(() => hasPermission("profit_centers.create"));
const canUpdate = computed(() => hasPermission("profit_centers.update"));
const canDelete = computed(() => hasPermission("profit_centers.delete"));
const canRestore = computed(() => hasPermission("profit_centers.restore"));
const canForceDelete = computed(() => hasPermission("profit_centers.force_delete"));
const canActivate = computed(() => hasPermission("profit_centers.activate"));
const canDeactivate = computed(() =>
  hasPermission("profit_centers.deactivate"),
);
const canViewTree = computed(() =>
  canAccessPermission("profit_centers.view_tree", "profit_centers.view"),
);

const showDeleted = computed(() => store.filters.trashed === "only");

const viewMode = ref("list");
const search = ref("");
const status = ref(null);
const branchId = ref(null);
const departmentId = ref(null);
const parentId = ref(null);
const trashedFilter = ref(null);
const page = ref(1);
const dialogOpen = ref(false);
const editingProfitCenter = ref(null);
const actionLoading = ref(false);
const deleteDialogOpen = ref(false);
const deletingProfitCenter = ref(null);
const forceDeleteDialogOpen = ref(false);
const forceDeletingProfitCenter = ref(null);
const allUsers = ref([]);

const usersById = computed(() => {
  const map = new Map();
  for (const user of allUsers.value) {
    map.set(user.id, user);
  }
  return map;
});

const deleteTargetName = computed(() =>
  deletingProfitCenter.value ? displayName(deletingProfitCenter.value) : "",
);

const forceDeleteTargetName = computed(() =>
  forceDeletingProfitCenter.value ? displayName(forceDeletingProfitCenter.value) : "",
);

const statusItems = computed(() =>
  PROFIT_CENTER_STATUSES.map((item) => ({
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

const parentOptions = computed(() => store.optionsItems);

const parentFilterItems = computed(() =>
  parentOptions.value.map((item) => ({
    value: item.id,
    title: profitCenterDisplayName(item, locale.value),
  })),
);

const trashedItems = computed(() => [
  { value: null, title: t("common.showDeletedAll") },
  { value: "only", title: t("common.showDeletedOnly") },
]);

function displayName(profitCenter) {
  return profitCenterDisplayName(profitCenter, locale.value);
}

function isActive(profitCenter) {
  return enumValue(profitCenter.status) === "active";
}

function statusLabel(profitCenter) {
  return isActive(profitCenter)
    ? t("profitCenter.statusActive")
    : t("profitCenter.statusInactive");
}

function parentLabel(profitCenter) {
  if (profitCenter.parent) {
    return profitCenterDisplayName(profitCenter.parent, locale.value);
  }
  if (!profitCenter.parent_id) return "—";
  const match = parentOptions.value.find(
    (item) => item.id === profitCenter.parent_id,
  );
  return match ? profitCenterDisplayName(match, locale.value) : "—";
}

function branchLabel(profitCenter) {
  if (profitCenter.branch) {
    return branchDisplayName(profitCenter.branch, locale.value);
  }
  if (!profitCenter.branch_id) return "—";
  const match = branchesStore.optionsItems.find(
    (item) => item.id === profitCenter.branch_id,
  );
  return match ? branchDisplayName(match, locale.value) : "—";
}

function departmentLabel(profitCenter) {
  if (profitCenter.department) {
    return departmentDisplayName(profitCenter.department, locale.value);
  }
  if (!profitCenter.department_id) return "—";
  const match = departmentsStore.optionsItems.find(
    (item) => item.id === profitCenter.department_id,
  );
  return match ? departmentDisplayName(match, locale.value) : "—";
}

function managerLabel(profitCenter) {
  if (!profitCenter.manager_id) return "—";
  const user = usersById.value.get(profitCenter.manager_id);
  return user ? userDisplayName(user, locale.value) : "—";
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
  });
}

function applyFilters() {
  store.setFilters({
    search: search.value?.trim() || "",
    status: status.value || null,
    branch_id: branchId.value || null,
    department_id: departmentId.value || null,
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

async function handleRestore(profitCenter) {
  if (!profitCenter?.id) return;

  actionLoading.value = true;
  try {
    const result = await store.restore(profitCenter.id);
    if (!result.error) {
      showSnackbar(t("profitCenter.restored"), 200);
    }
  } finally {
    actionLoading.value = false;
  }
}

function openCreate() {
  editingProfitCenter.value = null;
  dialogOpen.value = true;
}

async function openEdit(profitCenter) {
  actionLoading.value = true;
  try {
    const { profitCenter: fresh, error } = await store.show(profitCenter.id);
    if (error || !fresh) return;
    editingProfitCenter.value = fresh;
    dialogOpen.value = true;
  } finally {
    actionLoading.value = false;
  }
}

async function handleSubmit({ payload, applyServerErrors }) {
  actionLoading.value = true;

  try {
    if (editingProfitCenter.value?.id) {
      const { error } = await store.update(
        editingProfitCenter.value.id,
        payload,
      );

      if (error) {
        applyServerErrors(error.errors);
        return;
      }

      showSnackbar(t("profitCenter.updated"), 200);
      dialogOpen.value = false;
      if (viewMode.value === "tree") await loadTree();
      return;
    }

    const { error } = await store.create(payload);

    if (error) {
      applyServerErrors(error.errors);
      return;
    }

    showSnackbar(t("profitCenter.created"), 200);
    dialogOpen.value = false;
    if (viewMode.value === "tree") await loadTree();
  } finally {
    actionLoading.value = false;
  }
}

async function toggleStatus(profitCenter, activate) {
  actionLoading.value = true;

  try {
    const result = activate
      ? await store.activate(profitCenter.id)
      : await store.deactivate(profitCenter.id);

    if (!result.error) {
      showSnackbar(
        activate
          ? t("profitCenter.activated")
          : t("profitCenter.deactivated"),
        200,
      );
      if (viewMode.value === "tree") await loadTree();
    }
  } finally {
    actionLoading.value = false;
  }
}

function confirmDelete(profitCenter) {
  deletingProfitCenter.value = profitCenter;
  deleteDialogOpen.value = true;
}

async function handleDelete() {
  if (!deletingProfitCenter.value?.id) return;

  actionLoading.value = true;

  try {
    const result = await store.destroy(deletingProfitCenter.value.id);

    if (!result.error) {
      showSnackbar(t("profitCenter.deleted"), 200);
      deleteDialogOpen.value = false;
      deletingProfitCenter.value = null;
      if (viewMode.value === "tree") await loadTree();
    }
  } finally {
    actionLoading.value = false;
  }
}

function confirmForceDelete(profitCenter) {
  forceDeletingProfitCenter.value = profitCenter;
  forceDeleteDialogOpen.value = true;
}

async function handleForceDelete() {
  if (!forceDeletingProfitCenter.value?.id) return;

  actionLoading.value = true;

  try {
    const result = await store.forceDestroy(forceDeletingProfitCenter.value.id);

    if (!result.error) {
      showSnackbar(t("common.permanentlyDeleted"), 200);
      forceDeleteDialogOpen.value = false;
      forceDeletingProfitCenter.value = null;
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
    loadUsers(),
  ]);
});
</script>

<style scoped>
.profit-center-toolbar {
  padding-block: 20px !important;
}

.profit-center-table :deep(th) {
  font-weight: 600 !important;
  color: rgba(var(--v-theme-on-surface), 0.55) !important;
  white-space: nowrap;
}

.profit-center-table :deep(td) {
  border-bottom-color: rgba(var(--v-theme-on-surface), 0.06) !important;
}
</style>
