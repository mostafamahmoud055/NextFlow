<template>
  <div class="tax-management">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4 mb-md-6">
      <div>
        <p class="text-body-2 text-medium-emphasis mb-1">
          {{ t('navigation.financialSetup') }}
        </p>
        <h1 class="text-h4 font-weight-bold text-high-emphasis dashboard-page-title">
          {{ t('navigation.taxManagement') }}
        </h1>
      </div>

      <v-btn
        v-if="canCreate"
        color="primary"
        class="text-none"
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        {{ t('tax.create') }}
      </v-btn>
    </div>

    <v-card class="dashboard-card tax-toolbar mb-4" elevation="0">
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
            :label="t('tax.status')"
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
            :label="t('tax.type')"
            clearable
            variant="outlined"
            hide-details
            @update:model-value="applyFilters"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="scope"
            :items="scopeItems"
            item-title="title"
            item-value="value"
            :label="t('tax.scope')"
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
            {{ t('tax.applyFilters') }}
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
        <v-icon size="40" class="mb-3">mdi-percent-outline</v-icon>
        <div>{{ t('tax.empty') }}</div>
      </div>

      <template v-else>
        <v-table class="tax-table">
          <thead>
            <tr>
              <th>{{ t('tax.tax') }}</th>
              <th class="d-none d-md-table-cell">{{ t('tax.code') }}</th>
              <th class="d-none d-lg-table-cell">{{ t('tax.type') }}</th>
              <th>{{ t('tax.rate') }}</th>
              <th class="d-none d-lg-table-cell">{{ t('tax.scope') }}</th>
              <th>{{ t('tax.status') }}</th>
              <th class="text-end">{{ t('tax.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tax in store.items" :key="tax.id">
              <td>
                <div class="py-2">
                  <div class="font-weight-medium">
                    {{ displayName(tax) }}
                  </div>
                  <div
                    v-if="tax.version > 1"
                    class="text-caption text-medium-emphasis"
                  >
                    {{ t('tax.version', { version: tax.version }) }}
                  </div>
                </div>
              </td>
              <td class="d-none d-md-table-cell text-medium-emphasis">
                {{ tax.tax_code || '—' }}
              </td>
              <td class="d-none d-lg-table-cell text-medium-emphasis">
                {{ typeLabel(tax) }}
              </td>
              <td>
                {{ rateLabel(tax) }}
              </td>
              <td class="d-none d-lg-table-cell text-medium-emphasis">
                {{ scopeLabel(tax) }}
              </td>
              <td>
                <v-chip
                  size="small"
                  :color="isActive(tax) ? 'success' : 'secondary'"
                  variant="tonal"
                >
                  {{ statusLabel(tax) }}
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
                      :aria-label="t('tax.actions')"
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
                      @click="openEdit(tax)"
                    />
                    <v-list-item
                      v-if="canActivate && !isActive(tax)"
                      prepend-icon="mdi-check-circle-outline"
                      :title="t('tax.activate')"
                      :disabled="actionLoading"
                      @click="toggleStatus(tax, true)"
                    />
                    <v-list-item
                      v-if="canDeactivate && isActive(tax)"
                      prepend-icon="mdi-cancel"
                      :title="t('tax.deactivate')"
                      :disabled="actionLoading"
                      @click="toggleStatus(tax, false)"
                    />
                    <v-list-item
                      v-if="canDelete"
                      prepend-icon="mdi-delete-outline"
                      :title="t('buttons.delete')"
                      class="text-error"
                      :disabled="actionLoading"
                      @click="confirmDelete(tax)"
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

    <TaxFormDialog
      v-model="dialogOpen"
      :tax="editingTax"
      :saving="store.saving || actionLoading"
      @submit="handleSubmit"
    />

    <v-dialog v-model="deleteDialogOpen" max-width="440">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('tax.deleteTitle') }}
        </v-card-title>
        <v-card-text class="text-medium-emphasis">
          {{ t('tax.deleteConfirm', { name: deleteTargetName }) }}
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
import TaxFormDialog from "~/components/tax/TaxFormDialog.vue";
import {
  TAX_SCOPES,
  TAX_STATUSES,
  TAX_TYPES,
  taxDisplayName,
} from "~/utils/taxConstants";
import { enumValue } from "~/utils/enumValue";
import { useSnackbar } from "~/composables/useSnackbar";

definePageMeta({
  middleware: ["auth", "tenant"],
});

const { t, locale } = useAppLocale();
const { hasPermission } = usePermissions();
const { showSnackbar } = useSnackbar();
const store = useTaxesStore();

useHead({
  title: () => t("navigation.taxManagement"),
});

const canCreate = computed(() => hasPermission("taxes.create"));
const canUpdate = computed(() => hasPermission("taxes.update"));
const canDelete = computed(() => hasPermission("taxes.delete"));
const canActivate = computed(() => hasPermission("taxes.activate"));
const canDeactivate = computed(() => hasPermission("taxes.deactivate"));

const search = ref("");
const status = ref(null);
const type = ref(null);
const scope = ref(null);
const page = ref(1);
const dialogOpen = ref(false);
const editingTax = ref(null);
const actionLoading = ref(false);
const deleteDialogOpen = ref(false);
const deletingTax = ref(null);

const deleteTargetName = computed(() =>
  deletingTax.value ? displayName(deletingTax.value) : "",
);

const statusItems = computed(() =>
  TAX_STATUSES.map((item) => ({ value: item.value, title: t(item.labelKey) })),
);
const typeItems = computed(() =>
  TAX_TYPES.map((item) => ({ value: item.value, title: t(item.labelKey) })),
);
const scopeItems = computed(() =>
  TAX_SCOPES.map((item) => ({ value: item.value, title: t(item.labelKey) })),
);

function displayName(tax) {
  return taxDisplayName(tax, locale.value);
}

function isActive(tax) {
  if (typeof tax.is_active === "boolean") return tax.is_active;
  return enumValue(tax.status) === "active";
}

function statusLabel(tax) {
  return isActive(tax) ? t("tax.statusActive") : t("tax.statusInactive");
}

function typeLabel(tax) {
  const value = enumValue(tax.type);
  const match = TAX_TYPES.find((item) => item.value === value);
  return match ? t(match.labelKey) : tax.type?.label || "—";
}

function scopeLabel(tax) {
  const value = enumValue(tax.scope);
  const match = TAX_SCOPES.find((item) => item.value === value);
  return match ? t(match.labelKey) : tax.scope?.label || "—";
}

function rateLabel(tax) {
  if (tax.rate == null) return "—";
  const method = enumValue(tax.method);
  return method === "percentage" ? `${tax.rate}%` : String(tax.rate);
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
    scope: scope.value || null,
  });
  loadPage(1, true);
}

function clearSearch() {
  search.value = "";
  applyFilters();
}

function openCreate() {
  editingTax.value = null;
  dialogOpen.value = true;
}

function openEdit(tax) {
  editingTax.value = tax;
  dialogOpen.value = true;
}

async function handleSubmit({ payload, applyServerErrors }) {
  actionLoading.value = true;

  try {
    if (editingTax.value?.id) {
      const { error } = await store.update(editingTax.value.id, payload);

      if (error) {
        applyServerErrors(error.errors);
        return;
      }

      showSnackbar(t("tax.updated"), 200);
      dialogOpen.value = false;
      return;
    }

    const { error } = await store.create(payload);

    if (error) {
      applyServerErrors(error.errors);
      return;
    }

    showSnackbar(t("tax.created"), 200);
    dialogOpen.value = false;
  } finally {
    actionLoading.value = false;
  }
}

async function toggleStatus(tax, activate) {
  actionLoading.value = true;

  try {
    const result = activate
      ? await store.activate(tax.id)
      : await store.deactivate(tax.id);

    if (!result.error) {
      showSnackbar(
        activate ? t("tax.activated") : t("tax.deactivated"),
        200,
      );
    }
  } finally {
    actionLoading.value = false;
  }
}

function confirmDelete(tax) {
  deletingTax.value = tax;
  deleteDialogOpen.value = true;
}

async function handleDelete() {
  if (!deletingTax.value?.id) return;

  actionLoading.value = true;

  try {
    const result = await store.destroy(deletingTax.value.id);

    if (!result.error) {
      showSnackbar(t("tax.deleted"), 200);
      deleteDialogOpen.value = false;
      deletingTax.value = null;
    }
  } finally {
    actionLoading.value = false;
  }
}

onMounted(() => {
  search.value = store.filters.search || "";
  status.value = store.filters.status || null;
  type.value = store.filters.type || null;
  scope.value = store.filters.scope || null;
  loadPage(store.meta.current_page || 1);
});
</script>

<style scoped>
.tax-toolbar {
  padding-block: 20px !important;
}

.tax-table :deep(th) {
  font-weight: 600 !important;
  color: rgba(var(--v-theme-on-surface), 0.55) !important;
  white-space: nowrap;
}

.tax-table :deep(td) {
  border-bottom-color: rgba(var(--v-theme-on-surface), 0.06) !important;
}
</style>
