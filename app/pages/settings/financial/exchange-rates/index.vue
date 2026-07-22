<template>
  <div class="exchange-rate-management">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4 mb-md-6">
      <div>
        <p class="text-body-2 text-medium-emphasis mb-1">
          {{ t('navigation.financialSetup') }}
        </p>
        <h1 class="text-h4 font-weight-bold text-high-emphasis dashboard-page-title">
          {{ t('navigation.exchangeRatesManagement') }}
        </h1>
      </div>

      <v-btn
        v-if="canCreate && !showDeleted"
        color="primary"
        class="text-none"
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        {{ t('exchangeRate.create') }}
      </v-btn>
    </div>

    <v-card class="dashboard-card exchange-rate-toolbar mb-4" elevation="0">
      <v-row density="comfortable" align="center">
        <v-col cols="12" md="3">
          <ListSearchField v-model="search" @search="applyFilters" />
        </v-col>
        <v-col cols="12" sm="6" md="2">
          <v-select
            v-model="currencyId"
            :items="currencyFilterItems"
            item-title="title"
            item-value="value"
            :label="t('exchangeRate.currency')"
            clearable
            variant="outlined"
            hide-details
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" sm="6" md="2">
          <v-select
            v-model="rateType"
            :items="typeItems"
            item-title="title"
            item-value="value"
            :label="t('exchangeRate.rateType')"
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
            :label="t('exchangeRate.status')"
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
            {{ t('exchangeRate.applyFilters') }}
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
        <v-icon size="40" class="mb-3">mdi-swap-horizontal</v-icon>
        <div>{{ t('exchangeRate.empty') }}</div>
      </div>

      <template v-else>
        <v-table class="exchange-rate-table">
          <thead>
            <tr>
              <th>{{ t('exchangeRate.currency') }}</th>
              <th>{{ t('exchangeRate.rate') }}</th>
              <th class="d-none d-md-table-cell">{{ t('exchangeRate.rateType') }}</th>
              <th class="d-none d-md-table-cell">{{ t('exchangeRate.baseCurrency') }}</th>
              <th class="d-none d-lg-table-cell">{{ t('exchangeRate.effectiveDate') }}</th>
              <th class="d-none d-lg-table-cell">{{ t('exchangeRate.expiryDate') }}</th>
              <th>{{ t('exchangeRate.status') }}</th>
              <th class="text-end">{{ t('exchangeRate.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rate in store.items" :key="rate.id">
              <td>
                <div class="font-weight-medium py-2">
                  {{ rate.currency?.code || '—' }}
                </div>
              </td>
              <td class="font-weight-medium">{{ rate.rate }}</td>
              <td class="d-none d-md-table-cell text-medium-emphasis">
                {{ typeLabel(rate) }}
              </td>
              <td class="d-none d-md-table-cell text-medium-emphasis">
                {{ rate.base_currency?.code || '—' }}
              </td>
              <td class="d-none d-lg-table-cell text-medium-emphasis">
                {{ rate.effective_date || '—' }}
              </td>
              <td class="d-none d-lg-table-cell text-medium-emphasis">
                {{ rate.expiry_date || '—' }}
              </td>
              <td>
                <v-chip
                  size="small"
                  :color="isActive(rate) ? 'success' : 'secondary'"
                  variant="tonal"
                >
                  {{ statusLabel(rate) }}
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
                      :aria-label="t('exchangeRate.actions')"
                    >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>

                  <v-list density="compact" min-width="220">
                    <template v-if="!showDeleted">
                      <v-list-item
                        v-if="canViewHistory && rate.currency_id"
                        prepend-icon="mdi-history"
                        :title="t('exchangeRate.viewHistory')"
                        :disabled="actionLoading"
                        @click="openHistory(rate)"
                      />
                      <v-list-item
                        v-if="canUpdate"
                        prepend-icon="mdi-pencil-outline"
                        :title="t('buttons.edit')"
                        :disabled="actionLoading"
                        @click="openEdit(rate)"
                      />
                      <v-list-item
                        v-if="canActivate && !isActive(rate)"
                        prepend-icon="mdi-check-circle-outline"
                        :title="t('exchangeRate.activate')"
                        :disabled="actionLoading"
                        @click="toggleStatus(rate, true)"
                      />
                      <v-list-item
                        v-if="canDeactivate && isActive(rate)"
                        prepend-icon="mdi-cancel"
                        :title="t('exchangeRate.deactivate')"
                        :disabled="actionLoading"
                        @click="toggleStatus(rate, false)"
                      />
                      <v-list-item
                        v-if="canDelete"
                        prepend-icon="mdi-delete-outline"
                        :title="t('buttons.delete')"
                        class="text-error"
                        :disabled="actionLoading"
                        @click="confirmDelete(rate)"
                      />
                    </template>
                    <template v-else>
                      <v-list-item
                        v-if="canRestore"
                        prepend-icon="mdi-delete-restore"
                        :title="t('buttons.restore')"
                        :disabled="actionLoading"
                        @click="handleRestore(rate)"
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

    <ExchangeRateFormDialog
      v-model="dialogOpen"
      :exchange-rate="editingRate"
      :currency-options="currenciesStore.items"
      :base-currency-id="baseCurrencyId"
      :saving="store.saving || actionLoading"
      @submit="handleSubmit"
    />

    <ExchangeRateHistoryDialog
      v-model="historyOpen"
      :items="store.historyItems"
      :loading="store.historyLoading"
      :currency-code="historyCurrencyCode"
    />

    <v-dialog v-model="deleteDialogOpen" max-width="440">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('exchangeRate.deleteTitle') }}
        </v-card-title>
        <v-card-text class="text-medium-emphasis">
          {{ t('exchangeRate.deleteConfirm', { name: deleteTargetName }) }}
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
import ExchangeRateFormDialog from "~/components/exchangeRate/ExchangeRateFormDialog.vue";
import ExchangeRateHistoryDialog from "~/components/exchangeRate/ExchangeRateHistoryDialog.vue";
import {
  EXCHANGE_RATE_STATUSES,
  EXCHANGE_RATE_TYPES,
  currencyLabel,
} from "~/utils/exchangeRateConstants";
import { enumValue } from "~/utils/enumValue";
import { useSnackbar } from "~/composables/useSnackbar";

definePageMeta({
  middleware: ["auth", "tenant", "permission"],
  permission: "exchange_rates.view",
});

const { t, locale } = useAppLocale();
const { hasPermission } = usePermissions();
const { showSnackbar } = useSnackbar();
const store = useExchangeRatesStore();
const currenciesStore = useCurrenciesStore();

useHead({
  title: () => t("navigation.exchangeRatesManagement"),
});

const canCreate = computed(() => hasPermission("exchange_rates.create"));
const canUpdate = computed(() => hasPermission("exchange_rates.update"));
const canDelete = computed(() => hasPermission("exchange_rates.delete"));
const canRestore = computed(() => hasPermission("exchange_rates.restore"));
const canActivate = computed(() => hasPermission("exchange_rates.activate"));
const canDeactivate = computed(() =>
  hasPermission("exchange_rates.deactivate"),
);
const canViewHistory = computed(() =>
  hasPermission("exchange_rates.view_history"),
);

const search = ref("");
const currencyId = ref(null);
const rateType = ref(null);
const status = ref(null);
const trashedFilter = ref(null);
const page = ref(1);
const dialogOpen = ref(false);
const editingRate = ref(null);
const actionLoading = ref(false);
const deleteDialogOpen = ref(false);
const deletingRate = ref(null);
const historyOpen = ref(false);
const historyCurrencyCode = ref("");

const showDeleted = computed(() => store.filters.trashed === "only");

const deleteTargetName = computed(() => {
  if (!deletingRate.value) return "";
  return `${deletingRate.value.currency?.code || ""} @ ${deletingRate.value.rate || ""}`.trim();
});

const statusItems = computed(() =>
  EXCHANGE_RATE_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const typeItems = computed(() =>
  EXCHANGE_RATE_TYPES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const trashedItems = computed(() => [
  { value: null, title: t("common.showDeletedAll") },
  { value: "only", title: t("common.showDeletedOnly") },
]);

const currencyFilterItems = computed(() =>
  currenciesStore.items
    .map((row) => row.currency || row)
    .filter((currency) => currency?.id)
    .map((currency) => ({
      value: currency.id,
      title: currencyLabel(currency, locale.value),
    })),
);

const baseCurrencyId = computed(() => {
  const base = currenciesStore.items.find((row) => row.is_base);
  return base?.currency?.id ?? base?.currency_id ?? null;
});

function isActive(rate) {
  return enumValue(rate.status) === "active";
}

function statusLabel(rate) {
  return isActive(rate)
    ? t("exchangeRate.statusActive")
    : t("exchangeRate.statusInactive");
}

function typeLabel(rate) {
  const value = enumValue(rate.rate_type);
  const match = EXCHANGE_RATE_TYPES.find((item) => item.value === value);
  return match ? t(match.labelKey) : value || "—";
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
    currency_id: currencyId.value || null,
    rate_type: rateType.value || null,
    status: status.value || null,
    trashed: trashedFilter.value || null,
  });
  loadPage(1, true);
}

function openCreate() {
  editingRate.value = null;
  dialogOpen.value = true;
}

async function openEdit(rate) {
  actionLoading.value = true;
  try {
    const { exchangeRate, error } = await store.show(rate.id);
    if (error || !exchangeRate) return;
    editingRate.value = exchangeRate;
    dialogOpen.value = true;
  } finally {
    actionLoading.value = false;
  }
}

async function openHistory(rate) {
  historyCurrencyCode.value = rate.currency?.code || "";
  historyOpen.value = true;
  await store.fetchHistory(rate.currency_id);
}

async function handleSubmit({ payload, applyServerErrors }) {
  actionLoading.value = true;
  try {
    if (editingRate.value?.id) {
      const { error } = await store.update(editingRate.value.id, payload);
      if (error) {
        applyServerErrors(error.errors);
        return;
      }
      showSnackbar(t("exchangeRate.updated"), 200);
      dialogOpen.value = false;
      return;
    }

    const { error } = await store.create(payload);
    if (error) {
      applyServerErrors(error.errors);
      return;
    }
    showSnackbar(t("exchangeRate.created"), 200);
    dialogOpen.value = false;
  } finally {
    actionLoading.value = false;
  }
}

async function toggleStatus(rate, activate) {
  actionLoading.value = true;
  try {
    const result = activate
      ? await store.activate(rate.id)
      : await store.deactivate(rate.id);
    if (!result.error) {
      showSnackbar(
        activate
          ? t("exchangeRate.activated")
          : t("exchangeRate.deactivated"),
        200,
      );
    }
  } finally {
    actionLoading.value = false;
  }
}

function confirmDelete(rate) {
  deletingRate.value = rate;
  deleteDialogOpen.value = true;
}

async function handleDelete() {
  if (!deletingRate.value?.id) return;
  actionLoading.value = true;
  try {
    const result = await store.destroy(deletingRate.value.id);
    if (!result.error) {
      showSnackbar(t("exchangeRate.deleted"), 200);
      deleteDialogOpen.value = false;
      deletingRate.value = null;
    }
  } finally {
    actionLoading.value = false;
  }
}

async function handleRestore(rate) {
  if (!rate?.id) return;
  actionLoading.value = true;
  try {
    const result = await store.restore(rate.id);
    if (!result.error) showSnackbar(t("exchangeRate.restored"), 200);
  } finally {
    actionLoading.value = false;
  }
}

onMounted(async () => {
  search.value = store.filters.search || "";
  currencyId.value = store.filters.currency_id || null;
  rateType.value = store.filters.rate_type || null;
  status.value = store.filters.status || null;
  trashedFilter.value = store.filters.trashed || null;

  await Promise.all([
    loadPage(store.meta.current_page || 1),
    currenciesStore.fetchList(),
  ]);
});
</script>

<style scoped>
.exchange-rate-toolbar {
  padding-block: 20px !important;
}

.exchange-rate-table :deep(th) {
  font-weight: 600 !important;
  color: rgba(var(--v-theme-on-surface), 0.55) !important;
  white-space: nowrap;
}

.exchange-rate-table :deep(td) {
  border-bottom-color: rgba(var(--v-theme-on-surface), 0.06) !important;
}
</style>
