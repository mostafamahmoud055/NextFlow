<template>
  <div class="accounting-period-management">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4 mb-md-6">
      <div>
        <p class="text-body-2 text-medium-emphasis mb-1">
          {{ t('navigation.financialSetup') }}
        </p>
        <h1 class="text-h4 font-weight-bold text-high-emphasis dashboard-page-title">
          {{ t('navigation.accountingPeriodsManagement') }}
        </h1>
      </div>

      <div class="d-flex flex-wrap align-center ga-2">
        <v-btn
          v-if="canGenerate && !showDeleted"
          variant="tonal"
          class="text-none"
          prepend-icon="mdi-calendar-month-outline"
          @click="generateOpen = true"
        >
          {{ t('accountingPeriod.generate') }}
        </v-btn>
        <v-btn
          v-if="canCreate && !showDeleted"
          color="primary"
          class="text-none"
          prepend-icon="mdi-plus"
          @click="openCreate"
        >
          {{ t('accountingPeriod.create') }}
        </v-btn>
      </div>
    </div>

    <v-card class="dashboard-card period-toolbar mb-4" elevation="0">
      <v-row density="comfortable" align="center">
        <v-col cols="12" md="3">
          <ListSearchField v-model="search" @search="applyFilters" />
        </v-col>
        <v-col cols="12" sm="6" md="2">
          <v-select
            v-model="fiscalYearId"
            :items="fiscalYearItems"
            item-title="title"
            item-value="value"
            :label="t('accountingPeriod.fiscalYear')"
            clearable
            variant="outlined"
            hide-details
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" sm="6" md="2">
          <v-select
            v-model="status"
            :items="statusItems"
            item-title="title"
            item-value="value"
            :label="t('accountingPeriod.status')"
            clearable
            variant="outlined"
            hide-details
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" sm="6" md="2">
          <v-select
            v-model="closingFilter"
            :items="closingItems"
            item-title="title"
            item-value="value"
            :label="t('accountingPeriod.closingPeriod')"
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
        <v-col cols="12" md="1" class="d-flex justify-end">
          <v-btn
            variant="tonal"
            class="text-none"
            prepend-icon="mdi-filter-outline"
            @click="applyFilters"
          >
            {{ t('accountingPeriod.applyFilters') }}
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
        <v-icon size="40" class="mb-3">mdi-calendar-clock</v-icon>
        <div>{{ t('accountingPeriod.empty') }}</div>
      </div>

      <template v-else>
        <v-table class="period-table">
          <thead>
            <tr>
              <th>{{ t('accountingPeriod.period') }}</th>
              <th class="d-none d-md-table-cell">{{ t('accountingPeriod.code') }}</th>
              <th class="d-none d-lg-table-cell">{{ t('accountingPeriod.fiscalYear') }}</th>
              <th class="d-none d-lg-table-cell">{{ t('accountingPeriod.dates') }}</th>
              <th>{{ t('accountingPeriod.status') }}</th>
              <th class="d-none d-md-table-cell">{{ t('accountingPeriod.closingPeriod') }}</th>
              <th class="text-end">{{ t('accountingPeriod.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="period in store.items" :key="period.id">
              <td>
                <div class="font-weight-medium py-2">
                  {{ displayName(period) }}
                </div>
              </td>
              <td class="d-none d-md-table-cell text-medium-emphasis">
                {{ period.period_code || '—' }}
              </td>
              <td class="d-none d-lg-table-cell text-medium-emphasis">
                {{ fiscalYearLabel(period) }}
              </td>
              <td class="d-none d-lg-table-cell text-medium-emphasis">
                {{ datesLabel(period) }}
              </td>
              <td>
                <v-chip size="small" :color="statusColor(period)" variant="tonal">
                  {{ statusLabel(period) }}
                </v-chip>
              </td>
              <td class="d-none d-md-table-cell">
                <v-icon v-if="period.is_closing_period" color="primary" size="20">
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
                      :aria-label="t('accountingPeriod.actions')"
                    >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>

                  <v-list density="compact" min-width="220">
                    <template v-if="!showDeleted">
                      <v-list-item
                        v-if="canUpdate && statusOf(period) !== 'archived'"
                        prepend-icon="mdi-pencil-outline"
                        :title="t('buttons.edit')"
                        :disabled="actionLoading"
                        @click="openEdit(period)"
                      />
                      <v-list-item
                        v-if="canOpen && statusOf(period) === 'closed'"
                        prepend-icon="mdi-lock-open-outline"
                        :title="t('accountingPeriod.open')"
                        :disabled="actionLoading"
                        @click="runAction(() => store.open(period.id), 'opened')"
                      />
                      <v-list-item
                        v-if="canClose && statusOf(period) === 'open'"
                        prepend-icon="mdi-lock-outline"
                        :title="t('accountingPeriod.close')"
                        :disabled="actionLoading"
                        @click="runAction(() => store.close(period.id), 'closed')"
                      />
                      <v-list-item
                        v-if="canReopen && statusOf(period) === 'closed'"
                        prepend-icon="mdi-restore"
                        :title="t('accountingPeriod.reopen')"
                        :disabled="actionLoading"
                        @click="runAction(() => store.reopen(period.id), 'reopened')"
                      />
                      <v-list-item
                        v-if="canArchive && statusOf(period) === 'closed'"
                        prepend-icon="mdi-archive-outline"
                        :title="t('accountingPeriod.archive')"
                        :disabled="actionLoading"
                        @click="runAction(() => store.archive(period.id), 'archived')"
                      />
                      <v-list-item
                        v-if="canDelete"
                        prepend-icon="mdi-delete-outline"
                        :title="t('buttons.delete')"
                        class="text-error"
                        :disabled="actionLoading"
                        @click="confirmDelete(period)"
                      />
                    </template>
                    <template v-else>
                      <v-list-item
                        v-if="canRestore"
                        prepend-icon="mdi-delete-restore"
                        :title="t('buttons.restore')"
                        :disabled="actionLoading"
                        @click="handleRestore(period)"
                      />
                      <v-list-item
                        v-if="canForceDelete"
                        prepend-icon="mdi-delete-forever-outline"
                        :title="t('buttons.permanentDelete')"
                        class="text-error"
                        :disabled="actionLoading"
                        @click="confirmForceDelete(period)"
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

    <AccountingPeriodFormDialog
      v-model="dialogOpen"
      :period="editingPeriod"
      :fiscal-year-items="fiscalYearItems"
      :saving="store.saving || actionLoading"
      @submit="handleSubmit"
    />

    <AccountingPeriodGenerateDialog
      v-model="generateOpen"
      :fiscal-year-items="fiscalYearItems"
      :default-fiscal-year-id="fiscalYearId"
      :saving="store.saving || actionLoading"
      @submit="handleGenerate"
    />

    <v-dialog v-model="deleteDialogOpen" max-width="440">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('accountingPeriod.deleteTitle') }}
        </v-card-title>
        <v-card-text class="text-medium-emphasis">
          {{ t('accountingPeriod.deleteConfirm', { name: deleteTargetName }) }}
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
import AccountingPeriodFormDialog from "~/components/accountingPeriod/AccountingPeriodFormDialog.vue";
import AccountingPeriodGenerateDialog from "~/components/accountingPeriod/AccountingPeriodGenerateDialog.vue";
import {
  ACCOUNTING_PERIOD_STATUSES,
  accountingPeriodDisplayName,
} from "~/utils/accountingPeriodConstants";
import { enumValue } from "~/utils/enumValue";
import { useSnackbar } from "~/composables/useSnackbar";

definePageMeta({
  middleware: ["auth", "tenant", "permission"],
  permission: "accounting_periods.view",
});

const { t, locale } = useAppLocale();
const { hasPermission } = usePermissions();
const { showSnackbar } = useSnackbar();
const store = useAccountingPeriodsStore();
const fiscalYearsStore = useFiscalYearsStore();

useHead({
  title: () => t("navigation.accountingPeriodsManagement"),
});

const canCreate = computed(() => hasPermission("accounting_periods.create"));
const canUpdate = computed(() => hasPermission("accounting_periods.update"));
const canDelete = computed(() => hasPermission("accounting_periods.delete"));
const canRestore = computed(() => hasPermission("accounting_periods.restore"));
const canForceDelete = computed(() => hasPermission("accounting_periods.force_delete"));
const canGenerate = computed(() =>
  hasPermission("accounting_periods.generate"),
);
const canOpen = computed(() => hasPermission("accounting_periods.open"));
const canClose = computed(() => hasPermission("accounting_periods.close"));
const canReopen = computed(() => hasPermission("accounting_periods.reopen"));
const canArchive = computed(() => hasPermission("accounting_periods.archive"));

const showDeleted = computed(() => store.filters.trashed === "only");

const search = ref("");
const status = ref(null);
const fiscalYearId = ref(null);
const closingFilter = ref(null);
const trashedFilter = ref(null);
const page = ref(1);
const dialogOpen = ref(false);
const generateOpen = ref(false);
const editingPeriod = ref(null);
const actionLoading = ref(false);
const deleteDialogOpen = ref(false);
const deletingPeriod = ref(null);
const forceDeleteDialogOpen = ref(false);
const forceDeletingPeriod = ref(null);

const deleteTargetName = computed(() =>
  deletingPeriod.value ? displayName(deletingPeriod.value) : "",
);

const forceDeleteTargetName = computed(() =>
  forceDeletingPeriod.value ? displayName(forceDeletingPeriod.value) : "",
);

const statusItems = computed(() =>
  ACCOUNTING_PERIOD_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const closingItems = computed(() => [
  { value: true, title: t("accountingPeriod.closingYes") },
  { value: false, title: t("accountingPeriod.closingNo") },
]);

const trashedItems = computed(() => [
  { value: null, title: t("common.showDeletedAll") },
  { value: "only", title: t("common.showDeletedOnly") },
]);

const fiscalYearItems = computed(() =>
  fiscalYearsStore.optionsItems.map((item) => {
    const code = item.fiscal_year_code || String(item.id);
    const range =
      item.start_date && item.end_date
        ? ` (${item.start_date} → ${item.end_date})`
        : "";
    return {
      value: item.id,
      title: `${code}${range}`,
    };
  }),
);

function displayName(period) {
  return accountingPeriodDisplayName(period, locale.value);
}

function statusOf(period) {
  return enumValue(period.status);
}

function statusLabel(period) {
  const value = statusOf(period);
  const match = ACCOUNTING_PERIOD_STATUSES.find((item) => item.value === value);
  return match ? t(match.labelKey) : period.status?.label || "—";
}

function statusColor(period) {
  const value = statusOf(period);
  if (value === "open") return "success";
  if (value === "closed") return "warning";
  if (value === "archived") return "secondary";
  return "secondary";
}

function datesLabel(period) {
  if (!period.start_date || !period.end_date) return "—";
  return `${period.start_date} → ${period.end_date}`;
}

function fiscalYearLabel(period) {
  return (
    period.fiscal_year?.fiscal_year_code ||
    fiscalYearItems.value.find((item) => item.value === period.fiscal_year_id)
      ?.title ||
    "—"
  );
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
    fiscal_year_id: fiscalYearId.value || null,
    is_closing_period: closingFilter.value,
    trashed: trashedFilter.value || null,
  });
  loadPage(1, true);
}

async function handleRestore(period) {
  if (!period?.id) return;

  actionLoading.value = true;
  try {
    const result = await store.restore(period.id);
    if (!result.error) {
      showSnackbar(t("accountingPeriod.restored"), 200);
    }
  } finally {
    actionLoading.value = false;
  }
}

function openCreate() {
  editingPeriod.value = null;
  dialogOpen.value = true;
}

async function openEdit(period) {
  actionLoading.value = true;
  try {
    const { period: fresh, error } = await store.show(period.id);
    if (error || !fresh) return;
    editingPeriod.value = fresh;
    dialogOpen.value = true;
  } finally {
    actionLoading.value = false;
  }
}

async function handleSubmit({ payload, applyServerErrors }) {
  actionLoading.value = true;

  try {
    if (editingPeriod.value?.id) {
      const { error } = await store.update(editingPeriod.value.id, payload);
      if (error) {
        applyServerErrors(error.errors);
        return;
      }
      showSnackbar(t("accountingPeriod.updated"), 200);
      dialogOpen.value = false;
      return;
    }

    const { error } = await store.create(payload);
    if (error) {
      applyServerErrors(error.errors);
      return;
    }
    showSnackbar(t("accountingPeriod.created"), 200);
    dialogOpen.value = false;
  } finally {
    actionLoading.value = false;
  }
}

async function handleGenerate({ payload, applyServerErrors }) {
  actionLoading.value = true;
  try {
    const { error } = await store.generate(payload);
    if (error) {
      applyServerErrors(error.errors);
      return;
    }
    showSnackbar(t("accountingPeriod.generated"), 200);
    generateOpen.value = false;
  } finally {
    actionLoading.value = false;
  }
}

async function runAction(action, messageKey) {
  actionLoading.value = true;
  try {
    const result = await action();
    if (!result.error) showSnackbar(t(`accountingPeriod.${messageKey}`), 200);
  } finally {
    actionLoading.value = false;
  }
}

function confirmDelete(period) {
  deletingPeriod.value = period;
  deleteDialogOpen.value = true;
}

async function handleDelete() {
  if (!deletingPeriod.value?.id) return;

  actionLoading.value = true;
  try {
    const result = await store.destroy(deletingPeriod.value.id);
    if (!result.error) {
      showSnackbar(t("accountingPeriod.deleted"), 200);
      deleteDialogOpen.value = false;
      deletingPeriod.value = null;
    }
  } finally {
    actionLoading.value = false;
  }
}

function confirmForceDelete(period) {
  forceDeletingPeriod.value = period;
  forceDeleteDialogOpen.value = true;
}

async function handleForceDelete() {
  if (!forceDeletingPeriod.value?.id) return;

  actionLoading.value = true;
  try {
    const result = await store.forceDestroy(forceDeletingPeriod.value.id);
    if (!result.error) {
      showSnackbar(t("common.permanentlyDeleted"), 200);
      forceDeleteDialogOpen.value = false;
      forceDeletingPeriod.value = null;
    }
  } finally {
    actionLoading.value = false;
  }
}

onMounted(async () => {
  search.value = store.filters.search || "";
  status.value = store.filters.status || null;
  fiscalYearId.value = store.filters.fiscal_year_id || null;
  closingFilter.value = store.filters.is_closing_period;
  trashedFilter.value = store.filters.trashed || null;

  await Promise.all([
    fiscalYearsStore.fetchAll(),
    loadPage(store.meta.current_page || 1),
  ]);
});
</script>

<style scoped>
.period-toolbar {
  padding-block: 20px !important;
}

.period-table :deep(th) {
  font-weight: 600 !important;
  color: rgba(var(--v-theme-on-surface), 0.55) !important;
  white-space: nowrap;
}

.period-table :deep(td) {
  border-bottom-color: rgba(var(--v-theme-on-surface), 0.06) !important;
}
</style>
