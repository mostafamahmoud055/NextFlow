<template>
  <div class="fiscal-year-management">
    <!-- Fiscal Years Management -->
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4 mb-md-6">
      <div>
        <p class="text-body-2 text-medium-emphasis mb-1">
          {{ t('navigation.companySettings') }}
        </p>
        <h1 class="text-h4 font-weight-bold text-high-emphasis dashboard-page-title">
          {{ t('navigation.fiscalYearsManagement') }}
        </h1>
      </div>

      <v-btn
        v-if="canCreate"
        color="primary"
        class="text-none"
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        {{ t('fiscalYear.create') }}
      </v-btn>
    </div>

    <v-card class="dashboard-card fiscal-toolbar mb-4" elevation="0">
      <v-row density="comfortable" align="center">
        <v-col cols="12" md="5">
          <ListSearchField v-model="search" @search="applyFilters" />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="status"
            :items="statusItems"
            item-title="title"
            item-value="value"
            :label="t('fiscalYear.status')"
            clearable
            variant="outlined"
            hide-details
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" sm="6" md="2">
          <v-select
            v-model="isDefault"
            :items="defaultItems"
            item-title="title"
            item-value="value"
            :label="t('fiscalYear.isDefault')"
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
            {{ t('fiscalYear.applyFilters') }}
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
        <v-icon size="40" class="mb-3">mdi-calendar-range</v-icon>
        <div>{{ t('fiscalYear.empty') }}</div>
      </div>

      <template v-else>
        <v-table class="fiscal-table">
          <thead>
            <tr>
              <th>{{ t('fiscalYear.code') }}</th>
              <th class="d-none d-lg-table-cell">{{ t('fiscalYear.period') }}</th>
              <th>{{ t('fiscalYear.status') }}</th>
              <th class="d-none d-md-table-cell">{{ t('fiscalYear.isDefault') }}</th>
              <th class="text-end">{{ t('fiscalYear.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="fiscalYear in store.items" :key="fiscalYear.id">
              <td>
                <div class="font-weight-medium py-2">
                  {{ fiscalYear.fiscal_year_code || '—' }}
                </div>
              </td>
              <td class="d-none d-lg-table-cell text-medium-emphasis">
                {{ periodLabel(fiscalYear) }}
              </td>
              <td>
                <v-chip size="small" :color="statusColor(fiscalYear)" variant="tonal">
                  {{ statusLabel(fiscalYear) }}
                </v-chip>
              </td>
              <td class="d-none d-md-table-cell">
                <v-icon v-if="fiscalYear.is_default" color="primary" size="20">
                  mdi-check-circle
                </v-icon>
                <span v-else class="text-medium-emphasis">—</span>
              </td>
              <td class="text-end">
                <v-menu location="bottom end">
                  <template #activator="{ props: menuProps }">
                    <v-btn
                      v-bind="menuProps"
                      icon
                      variant="text"
                      size="small"
                      :aria-label="t('fiscalYear.actions')"
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
                      @click="openEdit(fiscalYear)"
                    />
                    <v-list-item
                      v-if="canOpen && statusOf(fiscalYear) !== 'open'"
                      prepend-icon="mdi-lock-open-outline"
                      :title="t('fiscalYear.open')"
                      :disabled="actionLoading"
                      @click="runAction(() => store.open(fiscalYear.id), 'opened')"
                    />
                    <v-list-item
                      v-if="canClose && statusOf(fiscalYear) === 'open'"
                      prepend-icon="mdi-lock-outline"
                      :title="t('fiscalYear.close')"
                      :disabled="actionLoading"
                      @click="runAction(() => store.close(fiscalYear.id), 'closed')"
                    />
                    <v-list-item
                      v-if="canArchive && statusOf(fiscalYear) === 'closed'"
                      prepend-icon="mdi-archive-outline"
                      :title="t('fiscalYear.archive')"
                      :disabled="actionLoading"
                      @click="runAction(() => store.archive(fiscalYear.id), 'archived')"
                    />
                    <v-list-item
                      v-if="canSetDefault && !fiscalYear.is_default"
                      prepend-icon="mdi-star-outline"
                      :title="t('fiscalYear.setDefault')"
                      :disabled="actionLoading"
                      @click="runAction(() => store.setDefault(fiscalYear.id), 'defaultSet')"
                    />
                    <v-list-item
                      v-if="canDelete"
                      prepend-icon="mdi-delete-outline"
                      :title="t('buttons.delete')"
                      class="text-error"
                      :disabled="actionLoading"
                      @click="confirmDelete(fiscalYear)"
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

    <FiscalYearFormDialog
      v-model="dialogOpen"
      :fiscal-year="editingFiscalYear"
      :saving="store.saving || actionLoading"
      @submit="handleSubmit"
    />

    <v-dialog v-model="deleteDialogOpen" max-width="440">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('fiscalYear.deleteTitle') }}
        </v-card-title>
        <v-card-text class="text-medium-emphasis">
          {{ t('fiscalYear.deleteConfirm', { name: deletingFiscalYear?.fiscal_year_code || '' }) }}
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
import FiscalYearFormDialog from "~/components/fiscalYear/FiscalYearFormDialog.vue";
import { FISCAL_YEAR_STATUSES } from "~/utils/fiscalYearConstants";
import { enumValue } from "~/utils/enumValue";
import { useSnackbar } from "~/composables/useSnackbar";

definePageMeta({
  middleware: ["auth", "tenant", "permission"],
  permission: "fiscal_years.view",
});

const { t } = useAppLocale();
const { hasPermission } = usePermissions();
const { showSnackbar } = useSnackbar();
const store = useFiscalYearsStore();

useHead({
  title: () => t("navigation.fiscalYearsManagement"),
});

const canCreate = computed(() => hasPermission("fiscal_years.create"));
const canUpdate = computed(() => hasPermission("fiscal_years.update"));
const canDelete = computed(() => hasPermission("fiscal_years.delete"));
const canOpen = computed(() => hasPermission("fiscal_years.open"));
const canClose = computed(() => hasPermission("fiscal_years.close"));
const canArchive = computed(() => hasPermission("fiscal_years.archive"));
const canSetDefault = computed(() => hasPermission("fiscal_years.set_default"));

const search = ref("");
const status = ref(null);
const isDefault = ref(null);
const page = ref(1);
const dialogOpen = ref(false);
const editingFiscalYear = ref(null);
const actionLoading = ref(false);
const deleteDialogOpen = ref(false);
const deletingFiscalYear = ref(null);

const statusItems = computed(() =>
  FISCAL_YEAR_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const defaultItems = computed(() => [
  { value: true, title: t("fiscalYear.defaultYes") },
  { value: false, title: t("fiscalYear.defaultNo") },
]);

function statusOf(fiscalYear) {
  return enumValue(fiscalYear.status);
}

function statusLabel(fiscalYear) {
  const value = statusOf(fiscalYear);
  const match = FISCAL_YEAR_STATUSES.find((item) => item.value === value);
  return match ? t(match.labelKey) : fiscalYear.status?.label || "—";
}

function statusColor(fiscalYear) {
  const value = statusOf(fiscalYear);
  if (value === "open") return "success";
  if (value === "closed") return "warning";
  if (value === "archived") return "secondary";
  return "secondary";
}

function periodLabel(fiscalYear) {
  if (!fiscalYear.start_date || !fiscalYear.end_date) return "—";
  return `${fiscalYear.start_date} → ${fiscalYear.end_date}`;
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
    is_default: isDefault.value,
  });
  loadPage(1, true);
}

function openCreate() {
  editingFiscalYear.value = null;
  dialogOpen.value = true;
}

function openEdit(fiscalYear) {
  editingFiscalYear.value = fiscalYear;
  dialogOpen.value = true;
}

async function handleSubmit({ payload, applyServerErrors }) {
  actionLoading.value = true;

  try {
    if (editingFiscalYear.value?.id) {
      const { error } = await store.update(editingFiscalYear.value.id, payload);
      if (error) {
        applyServerErrors(error.errors);
        return;
      }
      showSnackbar(t("fiscalYear.updated"), 200);
      dialogOpen.value = false;
      return;
    }

    const { error } = await store.create(payload);
    if (error) {
      applyServerErrors(error.errors);
      return;
    }
    showSnackbar(t("fiscalYear.created"), 200);
    dialogOpen.value = false;
  } finally {
    actionLoading.value = false;
  }
}

async function runAction(action, messageKey) {
  actionLoading.value = true;
  try {
    const result = await action();
    if (!result.error) showSnackbar(t(`fiscalYear.${messageKey}`), 200);
  } finally {
    actionLoading.value = false;
  }
}

function confirmDelete(fiscalYear) {
  deletingFiscalYear.value = fiscalYear;
  deleteDialogOpen.value = true;
}

async function handleDelete() {
  if (!deletingFiscalYear.value?.id) return;

  actionLoading.value = true;
  try {
    const result = await store.destroy(deletingFiscalYear.value.id);
    if (!result.error) {
      showSnackbar(t("fiscalYear.deleted"), 200);
      deleteDialogOpen.value = false;
      deletingFiscalYear.value = null;
    }
  } finally {
    actionLoading.value = false;
  }
}

onMounted(() => {
  search.value = store.filters.search || "";
  status.value = store.filters.status || null;
  isDefault.value = store.filters.is_default;
  loadPage(store.meta.current_page || 1);
});
</script>

<style scoped>
.fiscal-toolbar {
  padding-block: 20px !important;
}

.fiscal-table :deep(th) {
  font-weight: 600 !important;
  color: rgba(var(--v-theme-on-surface), 0.55) !important;
  white-space: nowrap;
}

.fiscal-table :deep(td) {
  border-bottom-color: rgba(var(--v-theme-on-surface), 0.06) !important;
}
</style>
