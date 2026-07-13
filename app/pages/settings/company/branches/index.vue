<template>
  <div class="branch-management">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4 mb-md-6">
      <div>
        <p class="text-body-2 text-medium-emphasis mb-1">
          {{ t('navigation.companySettings') }}
        </p>
        <h1 class="text-h4 font-weight-bold text-high-emphasis dashboard-page-title">
          {{ t('navigation.branchManagement') }}
        </h1>
      </div>

      <v-btn
        v-if="canCreate"
        color="primary"
        class="text-none"
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        {{ t('branch.create') }}
      </v-btn>
    </div>

    <v-card class="dashboard-card branch-toolbar mb-4" elevation="0">
      <v-row density="comfortable" align="center">
        <v-col cols="12" md="4">
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
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="status"
            :items="statusItems"
            item-title="title"
            item-value="value"
            :label="t('branch.status')"
            clearable
            variant="outlined"
            hide-details
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="type"
            :items="typeItems"
            item-title="title"
            item-value="value"
            :label="t('branch.type')"
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
            {{ t('branch.applyFilters') }}
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
        <v-icon size="40" class="mb-3">mdi-store-marker-outline</v-icon>
        <div>{{ t('branch.empty') }}</div>
      </div>

      <template v-else>
        <v-table class="branch-table">
          <thead>
            <tr>
              <th>{{ t('branch.branch') }}</th>
              <th class="d-none d-md-table-cell">{{ t('branch.code') }}</th>
              <th class="d-none d-lg-table-cell">{{ t('branch.type') }}</th>
              <th class="d-none d-lg-table-cell">{{ t('branch.location') }}</th>
              <th>{{ t('branch.status') }}</th>
              <th class="text-end">{{ t('branch.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="branch in store.items" :key="branch.id">
              <td>
                <div class="d-flex align-center ga-3 py-2">
                  <v-avatar size="40" rounded="lg" color="surface-bright">
                    <v-icon size="20">mdi-store-marker-outline</v-icon>
                  </v-avatar>
                  <div class="min-width-0">
                    <div class="font-weight-medium text-truncate">
                      {{ displayName(branch) }}
                    </div>
                    <div
                      v-if="branch.email || branch.phone"
                      class="text-caption text-medium-emphasis text-truncate"
                    >
                      {{ branch.email || branch.phone }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="d-none d-md-table-cell">
                <span class="text-medium-emphasis">{{ branch.branch_code || '—' }}</span>
              </td>
              <td class="d-none d-lg-table-cell">
                <span class="text-medium-emphasis">{{ typeLabel(branch) }}</span>
              </td>
              <td class="d-none d-lg-table-cell">
                <span class="text-medium-emphasis">{{ locationLabel(branch) }}</span>
              </td>
              <td>
                <v-chip
                  size="small"
                  :color="isActive(branch) ? 'success' : 'secondary'"
                  variant="tonal"
                >
                  {{ statusLabel(branch) }}
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
                      :aria-label="t('branch.actions')"
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
                      @click="openEdit(branch)"
                    />
                    <v-list-item
                      v-if="canActivate && !isActive(branch)"
                      prepend-icon="mdi-check-circle-outline"
                      :title="t('branch.activate')"
                      :disabled="actionLoading"
                      @click="toggleStatus(branch, true)"
                    />
                    <v-list-item
                      v-if="canDeactivate && isActive(branch)"
                      prepend-icon="mdi-cancel"
                      :title="t('branch.deactivate')"
                      :disabled="actionLoading"
                      @click="toggleStatus(branch, false)"
                    />
                    <v-list-item
                      v-if="canDelete"
                      prepend-icon="mdi-delete-outline"
                      :title="t('buttons.delete')"
                      class="text-error"
                      :disabled="actionLoading"
                      @click="confirmDelete(branch)"
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

    <BranchFormDialog
      v-model="dialogOpen"
      :branch="editingBranch"
      :saving="store.saving || actionLoading"
      @submit="handleSubmit"
    />

    <v-dialog v-model="deleteDialogOpen" max-width="440">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('branch.deleteTitle') }}
        </v-card-title>
        <v-card-text class="text-medium-emphasis">
          {{ t('branch.deleteConfirm', { name: deleteTargetName }) }}
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
import BranchFormDialog from "~/components/branch/BranchFormDialog.vue";
import {
  BRANCH_STATUSES,
  BRANCH_TYPES,
  branchDisplayName,
} from "~/utils/branchConstants";
import { enumValue } from "~/utils/enumValue";
import { useSnackbar } from "~/composables/useSnackbar";

definePageMeta({
  middleware: ["auth", "tenant"],
});

const { t, locale } = useAppLocale();
const { hasPermission } = usePermissions();
const { showSnackbar } = useSnackbar();
const store = useBranchesStore();

useHead({
  title: () => t("navigation.branchManagement"),
});

const canCreate = computed(() => hasPermission("branches.create"));
const canUpdate = computed(() => hasPermission("branches.update"));
const canDelete = computed(() => hasPermission("branches.delete"));
const canActivate = computed(() => hasPermission("branches.activate"));
const canDeactivate = computed(() => hasPermission("branches.deactivate"));

const search = ref("");
const status = ref(null);
const type = ref(null);
const page = ref(1);
const dialogOpen = ref(false);
const editingBranch = ref(null);
const actionLoading = ref(false);
const deleteDialogOpen = ref(false);
const deletingBranch = ref(null);

const deleteTargetName = computed(() =>
  deletingBranch.value ? displayName(deletingBranch.value) : "",
);

const statusItems = computed(() =>
  BRANCH_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const typeItems = computed(() =>
  BRANCH_TYPES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

function displayName(branch) {
  return branchDisplayName(branch, locale.value);
}

function isActive(branch) {
  if (typeof branch.is_active === "boolean") return branch.is_active;
  return enumValue(branch.status) === "active";
}

function statusLabel(branch) {
  return isActive(branch) ? t("branch.statusActive") : t("branch.statusInactive");
}

function typeLabel(branch) {
  const value = enumValue(branch.type);
  if (value === "main") return t("branch.typeMain");
  if (value === "branch") return t("branch.typeBranch");
  return branch.type?.label || "—";
}

function locationLabel(branch) {
  return [branch.city, branch.country].filter(Boolean).join(", ") || "—";
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
  });
  loadPage(1, true);
}

function clearSearch() {
  search.value = "";
  applyFilters();
}

function openCreate() {
  editingBranch.value = null;
  dialogOpen.value = true;
}

function openEdit(branch) {
  editingBranch.value = branch;
  dialogOpen.value = true;
}

async function handleSubmit({ payload, applyServerErrors }) {
  actionLoading.value = true;

  try {
    if (editingBranch.value?.id) {
      const { error } = await store.update(editingBranch.value.id, payload);

      if (error) {
        applyServerErrors(error.errors);
        return;
      }

      showSnackbar(t("branch.updated"), 200);
      dialogOpen.value = false;
      return;
    }

    const { error } = await store.create(payload);

    if (error) {
      applyServerErrors(error.errors);
      return;
    }

    showSnackbar(t("branch.created"), 200);
    dialogOpen.value = false;
  } finally {
    actionLoading.value = false;
  }
}

async function toggleStatus(branch, activate) {
  actionLoading.value = true;

  try {
    const result = activate
      ? await store.activate(branch.id)
      : await store.deactivate(branch.id);

    if (!result.error) {
      showSnackbar(
        activate ? t("branch.activated") : t("branch.deactivated"),
        200,
      );
    }
  } finally {
    actionLoading.value = false;
  }
}

function confirmDelete(branch) {
  deletingBranch.value = branch;
  deleteDialogOpen.value = true;
}

async function handleDelete() {
  if (!deletingBranch.value?.id) return;

  actionLoading.value = true;

  try {
    const result = await store.destroy(deletingBranch.value.id);

    if (!result.error) {
      showSnackbar(t("branch.deleted"), 200);
      deleteDialogOpen.value = false;
      deletingBranch.value = null;
    }
  } finally {
    actionLoading.value = false;
  }
}

onMounted(() => {
  search.value = store.filters.search || "";
  status.value = store.filters.status || null;
  type.value = store.filters.type || null;
  loadPage(store.meta.current_page || 1);
});
</script>

<style scoped>
.branch-toolbar {
  padding-block: 20px !important;
}

.branch-table :deep(th) {
  font-weight: 600 !important;
  color: rgba(var(--v-theme-on-surface), 0.55) !important;
  white-space: nowrap;
}

.branch-table :deep(td) {
  border-bottom-color: rgba(var(--v-theme-on-surface), 0.06) !important;
}

.min-width-0 {
  min-width: 0;
}
</style>
