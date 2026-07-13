<template>
  <div class="currency-management">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4 mb-md-6">
      <div>
        <p class="text-body-2 text-medium-emphasis mb-1">
          {{ t('navigation.financialSetup') }}
        </p>
        <h1 class="text-h4 font-weight-bold text-high-emphasis dashboard-page-title">
          {{ t('navigation.currencyManagement') }}
        </h1>
      </div>

      <v-chip
        v-if="store.baseCurrency"
        color="primary"
        variant="tonal"
        prepend-icon="mdi-currency-usd"
      >
        {{ t('currency.currentBase') }}: {{ store.baseCurrency }}
      </v-chip>
    </div>

    <v-card class="dashboard-card currency-toolbar mb-4" elevation="0">
      <v-row density="comfortable" align="center">
        <v-col cols="12" md="8">
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
        <v-col cols="12" md="4" class="d-flex justify-end">
          <v-btn
            variant="tonal"
            class="text-none"
            prepend-icon="mdi-filter-outline"
            @click="applyFilters"
          >
            {{ t('currency.applyFilters') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="dashboard-card" elevation="0">
      <div v-if="store.loading && !store.loaded" class="d-flex justify-center py-12">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <div
        v-else-if="!store.filteredItems.length"
        class="text-center text-medium-emphasis py-12"
      >
        <v-icon size="40" class="mb-3">mdi-cash-multiple</v-icon>
        <div>{{ t('currency.empty') }}</div>
      </div>

      <template v-else>
        <v-table class="currency-table">
          <thead>
            <tr>
              <th>{{ t('currency.code') }}</th>
              <th>{{ t('currency.name') }}</th>
              <th class="d-none d-md-table-cell">{{ t('currency.country') }}</th>
              <th class="d-none d-lg-table-cell">{{ t('currency.decimalPlaces') }}</th>
              <th>{{ t('currency.base') }}</th>
              <th class="text-end">{{ t('currency.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="currency in store.filteredItems" :key="currency.code">
              <td>
                <div class="font-weight-medium py-2">
                  {{ currency.code }}
                </div>
              </td>
              <td>{{ currencyName(currency) }}</td>
              <td class="d-none d-md-table-cell text-medium-emphasis">
                {{ currency.country_code }}
              </td>
              <td class="d-none d-lg-table-cell text-medium-emphasis">
                {{ currency.decimal_places }}
              </td>
              <td>
                <v-chip
                  v-if="isBase(currency)"
                  size="small"
                  color="primary"
                  variant="tonal"
                >
                  {{ t('currency.base') }}
                </v-chip>
                <span v-else class="text-medium-emphasis">—</span>
              </td>
              <td class="text-end">
                <v-btn
                  v-if="canUpdate && !isBase(currency)"
                  variant="text"
                  size="small"
                  class="text-none"
                  prepend-icon="mdi-star-outline"
                  :disabled="actionLoading || store.saving"
                  @click="confirmSetBase(currency)"
                >
                  {{ t('currency.setBase') }}
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </template>
    </v-card>

    <v-dialog v-model="baseDialogOpen" max-width="480">
      <v-card>
        <v-card-title class="text-h6  pt-6">
          {{ t('currency.setBaseTitle') }}
        </v-card-title>
        <v-card-text>
          {{
            t('currency.setBaseConfirm', {
              code: pendingCurrency?.code,
              name: pendingCurrency ? currencyName(pendingCurrency) : '',
            })
          }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            class="text-none"
            :disabled="actionLoading"
            @click="baseDialogOpen = false"
          >
            {{ t('buttons.cancel') }}
          </v-btn>
          <v-btn
            class="text-error"
            :loading="actionLoading"
            @click="handleSetBase"
          >
            {{ t('currency.setBase') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { useSnackbar } from "~/composables/useSnackbar";

definePageMeta({
  middleware: ["auth", "tenant"],
});

const { t, locale } = useAppLocale();
const { hasPermission } = usePermissions();
const { showSnackbar } = useSnackbar();
const store = useCurrenciesStore();

useHead({
  title: () => t("navigation.currencyManagement"),
});

const canUpdate = computed(() => hasPermission("currencies.update"));

const search = ref("");
const actionLoading = ref(false);
const baseDialogOpen = ref(false);
const pendingCurrency = ref(null);

function currencyName(currency) {
  return locale.value === "ar" ? currency.name_ar : currency.name_en;
}

function isBase(currency) {
  return store.baseCurrency === currency.code;
}

function applyFilters() {
  store.setFilters({ search: search.value || "" });
}

function clearSearch() {
  search.value = "";
  applyFilters();
}

function confirmSetBase(currency) {
  pendingCurrency.value = currency;
  baseDialogOpen.value = true;
}

async function handleSetBase() {
  if (!pendingCurrency.value?.code) return;

  actionLoading.value = true;
  try {
    const result = await store.setBaseCurrency(pendingCurrency.value.code);
    if (!result.error) {
      showSnackbar(t("currency.baseSet"), 200);
      baseDialogOpen.value = false;
      pendingCurrency.value = null;
    }
  } finally {
    actionLoading.value = false;
  }
}

onMounted(() => {
  search.value = store.filters.search || "";
  store.fetchList();
});
</script>

<style scoped>
.currency-toolbar {
  padding-block: 20px !important;
}

.currency-table :deep(th) {
  font-weight: 600 !important;
  color: rgba(var(--v-theme-on-surface), 0.55) !important;
  white-space: nowrap;
}

.currency-table :deep(td) {
  border-bottom-color: rgba(var(--v-theme-on-surface), 0.06) !important;
}
</style>
