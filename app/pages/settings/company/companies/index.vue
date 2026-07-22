<template>
  <div class="company-management">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4 mb-md-6">
      <div>
        <p class="text-body-2 text-medium-emphasis mb-1">
          {{ t('navigation.companySettings') }}
        </p>
        <h1 class="text-h4 font-weight-bold text-high-emphasis dashboard-page-title">
          {{ t('navigation.companyManagement') }}
        </h1>
      </div>

      <v-btn
        v-if="canCreateAndDelete && !showDeleted"
        color="primary"
        class="text-none"
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        {{ t('company.create') }}
      </v-btn>
    </div>

    <v-card class="dashboard-card company-toolbar mb-4" elevation="0">
      <v-row density="comfortable" align="center">
        <v-col cols="12" md="6">
          <ListSearchField v-model="search" @search="applyFilters" />
        </v-col>
        <v-col cols="12" sm="6" md="2">
          <v-select
            v-model="status"
            :items="statusItems"
            item-title="title"
            item-value="value"
            :label="t('company.status')"
            variant="outlined"
            clearable
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
        <v-col cols="12" sm="6" md="2" class="d-flex justify-end">
          <v-btn
            variant="tonal"
            class="text-none"
            prepend-icon="mdi-filter-outline"
            @click="applyFilters"
          >
            {{ t('company.applyFilters') }}
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
        <v-icon size="40" class="mb-3">mdi-office-building-outline</v-icon>
        <div>{{ t('company.empty') }}</div>
      </div>

      <template v-else>
        <v-table class="company-table">
          <thead>
            <tr>
              <th>{{ t('company.company') }}</th>
              <th class="d-none d-md-table-cell">{{ t('company.code') }}</th>
              <th>{{ t('company.status') }}</th>
              <th class="text-end">{{ t('company.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="company in store.items" :key="company.uuid">
              <td>
                <div class="d-flex align-center ga-3 py-2">
                  <v-avatar size="40" rounded="lg" color="surface-bright">
                    <v-img v-if="company.logo_url" :src="company.logo_url" cover />
                    <v-icon v-else size="20">mdi-office-building-outline</v-icon>
                  </v-avatar>
                  <div class="min-width-0">
                    <div class="font-weight-medium text-truncate">
                      {{ displayName(company) }}
                    </div>
                    <div
                      v-if="company.commercial_name"
                      class="text-caption text-medium-emphasis text-truncate"
                    >
                      {{ company.commercial_name }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="d-none d-md-table-cell">
                <span class="text-medium-emphasis">{{ company.company_code || '—' }}</span>
              </td>
              <td>
                <v-chip
                  size="small"
                  :color="isActive(company) ? 'success' : 'secondary'"
                  variant="tonal"
                >
                  {{ statusLabel(company) }}
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
                      :aria-label="t('company.actions')"
                    >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>

                  <v-list density="compact" min-width="200">
                    <template v-if="!showDeleted">
                      <v-list-item
                        v-if="canManage"
                        prepend-icon="mdi-pencil-outline"
                        :title="t('buttons.edit')"
                        :disabled="actionLoading"
                        @click="openEdit(company)"
                      />
                      <v-list-item
                        v-if="canManage && !isActive(company)"
                        prepend-icon="mdi-check-circle-outline"
                        :title="t('company.activate')"
                        :disabled="actionLoading"
                        @click="toggleStatus(company, true)"
                      />
                      <v-list-item
                        v-if="canManage && isActive(company)"
                        prepend-icon="mdi-cancel"
                        :title="t('company.deactivate')"
                        :disabled="actionLoading"
                        @click="toggleStatus(company, false)"
                      />

                      <v-list-item
                        v-if="canCreateAndDelete"
                        prepend-icon="mdi-delete-outline"
                        :title="t('buttons.delete')"
                        class="text-error"
                        :disabled="actionLoading"
                        @click="confirmDelete(company)"
                      />
                    </template>
                    <template v-else>
                      <v-list-item
                        v-if="canRestore"
                        prepend-icon="mdi-delete-restore"
                        :title="t('buttons.restore')"
                        :disabled="actionLoading"
                        @click="handleRestore(company)"
                      />
                      <v-list-item
                        v-if="canForceDelete"
                        prepend-icon="mdi-delete-forever-outline"
                        :title="t('buttons.permanentDelete')"
                        class="text-error"
                        :disabled="actionLoading"
                        @click="confirmForceDelete(company)"
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

    <CompanyFormDialog
      v-model="dialogOpen"
      :company="editingCompany"
      :saving="store.saving || actionLoading"
      @submit="handleSubmit"
    />

    <v-dialog v-model="deleteDialogOpen" max-width="440">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('company.deleteTitle') }}
        </v-card-title>
        <v-card-text class="text-medium-emphasis">
          {{ t('company.deleteConfirm', { name: deleteTargetName }) }}
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
import CompanyFormDialog from "~/components/company/CompanyFormDialog.vue";
import {
  COMPANY_STATUSES,
  companyDisplayName,
} from "~/utils/companyConstants";
import { enumValue } from "~/utils/enumValue";
import { useSnackbar } from "~/composables/useSnackbar";

definePageMeta({
  middleware: ["auth", "tenant", "permission"],
  permission: ["companies.view", "companies.manage"],
});

const { t, locale } = useAppLocale();
const { hasPermission, hasRole } = usePermissions();
const { showSnackbar } = useSnackbar();
const store = useCompaniesStore();
const auth = useAuthStore();

useHead({
  title: () => t("navigation.companyManagement"),
});

const canCreateAndDelete = computed(() => hasRole("admin"));
const canManage = computed(() => hasPermission("companies.manage"));
const canRestore = computed(() => hasPermission("companies.restore"));
const canForceDelete = computed(() => hasPermission("companies.force_delete"));

const showDeleted = computed(() => store.filters.trashed === "only");

const search = ref("");
const status = ref(null);
const trashedFilter = ref(null);
const page = ref(1);
const dialogOpen = ref(false);
const editingCompany = ref(null);
const actionLoading = ref(false);
const deleteDialogOpen = ref(false);
const deletingCompany = ref(null);
const forceDeleteDialogOpen = ref(false);
const forceDeletingCompany = ref(null);

const deleteTargetName = computed(() =>
  deletingCompany.value ? displayName(deletingCompany.value) : "",
);

const forceDeleteTargetName = computed(() =>
  forceDeletingCompany.value ? displayName(forceDeletingCompany.value) : "",
);

const statusItems = computed(() =>
  COMPANY_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const trashedItems = computed(() => [
  { value: null, title: t("common.showDeletedAll") },
  { value: "only", title: t("common.showDeletedOnly") },
]);

function displayName(company) {
  return companyDisplayName(company, locale.value);
}

function isActive(company) {
  return enumValue(company.status) === "active";
}

function statusLabel(company) {
  return isActive(company) ? t("company.statusActive") : t("company.statusInactive");
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
    trashed: trashedFilter.value || null,
  });
  loadPage(1, true);
}

async function handleRestore(company) {
  if (!company?.uuid) return;

  actionLoading.value = true;
  try {
    const result = await store.restore(company.uuid);
    if (!result.error) {
      showSnackbar(t("company.restored"), 200);
    }
  } finally {
    actionLoading.value = false;
  }
}

function openCreate() {
  editingCompany.value = null;
  dialogOpen.value = true;
}

async function openEdit(company) {
  editingCompany.value = company;
  dialogOpen.value = true;
}

async function handleSubmit({ payload, logoFile, applyServerErrors }) {
  actionLoading.value = true;

  try {
    if (editingCompany.value?.uuid) {
      const { error } = await store.update(
        editingCompany.value.uuid,
        payload,
        logoFile,
      );
      if (error) {
        applyServerErrors(error.errors);
        return;
      }

      showSnackbar(t("company.updated"), 200);
      dialogOpen.value = false;
      return;
    }

    const { company, error } = await store.create(payload, logoFile);
    if (error) {
      applyServerErrors(error.errors);
      return;
    }

    if (!auth.hasTenant && company) auth.setTenant(company);

    showSnackbar(t("company.created"), 200);
    dialogOpen.value = false;
  } finally {
    actionLoading.value = false;
  }
}

async function toggleStatus(company, activate) {
  actionLoading.value = true;

  try {
    const result = activate
      ? await store.activate(company.uuid)
      : await store.deactivate(company.uuid);

    if (!result.error) {
      showSnackbar(
        activate ? t("company.activated") : t("company.deactivated"),
        200,
      );
    }
  } finally {
    actionLoading.value = false;
  }
}

function confirmDelete(company) {
  deletingCompany.value = company;
  deleteDialogOpen.value = true;
}

async function handleDelete() {
  if (!deletingCompany.value?.uuid) return;

  actionLoading.value = true;

  try {
    const result = await store.destroy(deletingCompany.value.uuid);

    if (!result.error) {
      showSnackbar(t("company.deleted"), 200);
      deleteDialogOpen.value = false;
      deletingCompany.value = null;
    }
  } finally {
    actionLoading.value = false;
  }
}

function confirmForceDelete(company) {
  forceDeletingCompany.value = company;
  forceDeleteDialogOpen.value = true;
}

async function handleForceDelete() {
  if (!forceDeletingCompany.value?.uuid) return;

  actionLoading.value = true;

  try {
    const result = await store.forceDestroy(forceDeletingCompany.value.uuid);

    if (!result.error) {
      showSnackbar(t("common.permanentlyDeleted"), 200);
      forceDeleteDialogOpen.value = false;
      forceDeletingCompany.value = null;
    }
  } finally {
    actionLoading.value = false;
  }
}

onMounted(() => {
  search.value = store.filters.search || "";
  status.value = store.filters.status || null;
  trashedFilter.value = store.filters.trashed || null;
  loadPage(store.meta.current_page || 1);
});
</script>

<style scoped>
.company-toolbar {
  padding-block: 20px !important;
}

.company-table :deep(th) {
  font-weight: 600 !important;
  color: rgba(var(--v-theme-on-surface), 0.55) !important;
  white-space: nowrap;
}

.company-table :deep(td) {
  border-bottom-color: rgba(var(--v-theme-on-surface), 0.06) !important;
}

.min-width-0 {
  min-width: 0;
}
</style>
