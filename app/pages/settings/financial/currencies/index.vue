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

      <div class="d-flex flex-wrap align-center ga-3">
        <v-chip
          v-if="store.baseCurrency"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-currency-usd"
        >
          {{ t('currency.currentBase') }}: {{ store.baseCurrency }}
        </v-chip>

        <v-btn
          v-if="canAttach"
          color="primary"
          class="text-none"
          prepend-icon="mdi-plus"
          @click="openAttach"
        >
          {{ t('currency.attach') }}
        </v-btn>
      </div>
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
      <div v-if="store.loading && !store.items.length" class="d-flex justify-center py-12">
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
              <th class="d-none d-md-table-cell">{{ t('currency.symbol') }}</th>
              <th class="d-none d-lg-table-cell">{{ t('currency.decimalPlaces') }}</th>
              <th class="d-none d-lg-table-cell">{{ t('currency.roundingMode') }}</th>
              <th>{{ t('currency.base') }}</th>
              <th v-if="canMutate" class="text-end">{{ t('currency.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in store.filteredItems" :key="row.id">
              <td>
                <div class="font-weight-medium py-2">
                  {{ row.currency?.code }}
                </div>
              </td>
              <td>{{ currencyName(row) }}</td>
              <td class="d-none d-md-table-cell text-medium-emphasis">
                {{ row.currency?.symbol }}
              </td>
              <td class="d-none d-lg-table-cell text-medium-emphasis">
                {{ row.decimal_places }}
              </td>
              <td class="d-none d-lg-table-cell text-medium-emphasis">
                {{ roundingLabel(row.rounding_mode) }}
              </td>
              <td>
                <v-chip
                  v-if="row.is_base"
                  size="small"
                  color="primary"
                  variant="tonal"
                >
                  {{ t('currency.base') }}
                </v-chip>
                <span v-else class="text-medium-emphasis">—</span>
              </td>
              <td v-if="canMutate" class="text-end">
                <v-menu location="bottom end">
                  <template #activator="{ props: menuProps }">
                    <v-btn
                      v-bind="menuProps"
                      icon
                      variant="text"
                      size="small"
                      :aria-label="t('currency.actions')"
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
                      @click="openEdit(row)"
                    />
                    <v-list-item
                      v-if="canUpdate && !row.is_base"
                      prepend-icon="mdi-star-outline"
                      :title="t('currency.setBase')"
                      :disabled="actionLoading || store.saving"
                      @click="confirmSetBase(row)"
                    />
                    <v-list-item
                      v-if="canDetach && !row.is_base"
                      prepend-icon="mdi-delete-outline"
                      :title="t('currency.detach')"
                      class="text-error"
                      :disabled="actionLoading || store.saving"
                      @click="confirmDetach(row)"
                    />
                  </v-list>
                </v-menu>
              </td>
            </tr>
          </tbody>
        </v-table>
      </template>
    </v-card>

    <CurrencyFormDialog
      v-model="formOpen"
      :currency="editingRow"
      :attached-codes="attachedCodes"
      :saving="store.saving"
      @submit="handleFormSubmit"
    />

    <v-dialog v-model="baseDialogOpen" max-width="480">
      <v-card>
        <v-card-title class="text-h6 pt-6">
          {{ t('currency.setBaseTitle') }}
        </v-card-title>
        <v-card-text>
          {{
            t('currency.setBaseConfirm', {
              code: pendingRow?.currency?.code,
              name: pendingRow ? currencyName(pendingRow) : '',
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
            color="primary"
            class="text-none"
            :loading="actionLoading"
            @click="handleSetBase"
          >
            {{ t('currency.setBase') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="detachDialogOpen" max-width="480">
      <v-card>
        <v-card-title class="text-h6 pt-6">
          {{ t('currency.detachTitle') }}
        </v-card-title>
        <v-card-text>
          {{
            t('currency.detachConfirm', {
              code: pendingRow?.currency?.code,
              name: pendingRow ? currencyName(pendingRow) : '',
            })
          }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            class="text-none"
            :disabled="actionLoading"
            @click="detachDialogOpen = false"
          >
            {{ t('buttons.cancel') }}
          </v-btn>
          <v-btn
            color="error"
            class="text-none"
            :loading="actionLoading"
            @click="handleDetach"
          >
            {{ t('currency.detach') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import CurrencyFormDialog from "~/components/currency/CurrencyFormDialog.vue";
import { ROUNDING_MODES } from "~/utils/currencyConstants";
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

const canView = computed(() => hasPermission("currencies.view"));
const canAttach = computed(() => hasPermission("currencies.attach"));
const canDetach = computed(() => hasPermission("currencies.detach"));
const canUpdate = computed(() => hasPermission("currencies.update"));
const canMutate = computed(() => canAttach.value || canDetach.value || canUpdate.value);

const search = ref("");
const actionLoading = ref(false);
const formOpen = ref(false);
const editingRow = ref(null);
const baseDialogOpen = ref(false);
const detachDialogOpen = ref(false);
const pendingRow = ref(null);

const attachedCodes = computed(() =>
  store.allItems.map((row) => row.currency?.code).filter(Boolean),
);

function currencyName(row) {
  const currency = row?.currency;
  if (!currency) return "—";
  return locale.value === "ar" ? currency.name_ar : currency.name_en;
}

function roundingLabel(mode) {
  const match = ROUNDING_MODES.find((item) => item.value === mode);
  return match ? t(match.labelKey) : mode || "—";
}

function applyFilters() {
  store.setFilters({ search: search.value || "" });
}

function clearSearch() {
  search.value = "";
  applyFilters();
}

async function openAttach() {
  editingRow.value = null;
  formOpen.value = true;
}

function openEdit(row) {
  editingRow.value = row;
  formOpen.value = true;
}

function confirmSetBase(row) {
  pendingRow.value = row;
  baseDialogOpen.value = true;
}

function confirmDetach(row) {
  pendingRow.value = row;
  detachDialogOpen.value = true;
}

async function handleFormSubmit({ payload, applyServerErrors }) {
  const result = editingRow.value
    ? await store.update(editingRow.value.currency.code, payload)
    : await store.attach(payload);

  if (result.error) {
    applyServerErrors(result.error.errors);
    return;
  }

  showSnackbar(
    editingRow.value ? t("currency.updated") : t("currency.attached"),
    200,
  );
  formOpen.value = false;
  editingRow.value = null;
}

async function handleSetBase() {
  const code = pendingRow.value?.currency?.code;
  if (!code) return;

  actionLoading.value = true;
  try {
    const result = await store.setBaseCurrency(code);
    if (!result.error) {
      showSnackbar(t("currency.baseSet"), 200);
      baseDialogOpen.value = false;
      pendingRow.value = null;
    }
  } finally {
    actionLoading.value = false;
  }
}

async function handleDetach() {
  const code = pendingRow.value?.currency?.code;
  if (!code) return;

  actionLoading.value = true;
  try {
    const result = await store.detach(code);
    if (!result.error) {
      showSnackbar(t("currency.detached"), 200);
      detachDialogOpen.value = false;
      pendingRow.value = null;
    }
  } finally {
    actionLoading.value = false;
  }
}

onMounted(() => {
  search.value = store.filters.search || "";
  if (canView.value) store.fetchList();
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
