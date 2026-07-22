<template>
  <v-dialog
    :model-value="modelValue"
    max-width="900"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="tax-history-card" rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
        <div>
          <div class="text-h6 font-weight-bold">
            {{ t('tax.historyTitle') }}
          </div>
          <div v-if="taxLabel" class="text-body-2 text-medium-emphasis">
            {{ taxLabel }}
          </div>
        </div>
        <v-btn
          icon
          variant="text"
          size="small"
          :aria-label="t('buttons.cancel')"
          @click="close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-6 pt-2">
        <div v-if="loading" class="d-flex justify-center py-10">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <div
          v-else-if="!items.length"
          class="text-center text-medium-emphasis py-10"
        >
          {{ t('tax.historyEmpty') }}
        </div>

        <v-table v-else class="tax-history-table">
          <thead>
            <tr>
              <th>{{ t('tax.versionLabel') }}</th>
              <th>{{ t('tax.rate') }}</th>
              <th class="d-none d-md-table-cell">{{ t('tax.type') }}</th>
              <th class="d-none d-lg-table-cell">{{ t('tax.method') }}</th>
              <th>{{ t('tax.effectiveDate') }}</th>
              <th class="d-none d-md-table-cell">{{ t('tax.expiryDate') }}</th>
              <th>{{ t('tax.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>
                <span class="font-weight-medium">
                  {{ t('tax.version', { version: item.version }) }}
                </span>
              </td>
              <td>{{ rateLabel(item) }}</td>
              <td class="d-none d-md-table-cell text-medium-emphasis">
                {{ typeLabel(item) }}
              </td>
              <td class="d-none d-lg-table-cell text-medium-emphasis">
                {{ methodLabel(item) }}
              </td>
              <td>{{ item.effective_date || '—' }}</td>
              <td class="d-none d-md-table-cell">
                {{ item.expiry_date || '—' }}
              </td>
              <td>
                <v-chip
                  size="small"
                  :color="isActive(item) ? 'success' : 'secondary'"
                  variant="tonal"
                >
                  {{
                    isActive(item)
                      ? t('tax.statusActive')
                      : t('tax.statusInactive')
                  }}
                </v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn variant="text" class="text-none" @click="close">
          {{ t('buttons.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {
  TAX_METHODS,
  TAX_TYPES,
  taxDisplayName,
} from "~/utils/taxConstants";
import { enumValue } from "~/utils/enumValue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  tax: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue"]);

const { t, locale } = useAppLocale();
const store = useTaxesStore();

const loading = ref(false);
const items = ref([]);

const taxLabel = computed(() => {
  if (!props.tax) return "";
  const name = taxDisplayName(props.tax, locale.value);
  const code = props.tax.tax_code || "";
  return [code, name].filter(Boolean).join(" — ");
});

function isActive(tax) {
  if (typeof tax.is_active === "boolean") return tax.is_active;
  return enumValue(tax.status) === "active";
}

function rateLabel(tax) {
  if (tax.rate == null) return "—";
  return enumValue(tax.method) === "percentage"
    ? `${tax.rate}%`
    : String(tax.rate);
}

function typeLabel(tax) {
  const value = enumValue(tax.type);
  const match = TAX_TYPES.find((item) => item.value === value);
  return match ? t(match.labelKey) : tax.type?.label || "—";
}

function methodLabel(tax) {
  const value = enumValue(tax.method);
  const match = TAX_METHODS.find((item) => item.value === value);
  return match ? t(match.labelKey) : tax.method?.label || "—";
}

function close() {
  emit("update:modelValue", false);
}

async function loadHistory() {
  if (!props.tax?.id) {
    items.value = [];
    return;
  }

  loading.value = true;
  try {
    const { items: historyItems, error } = await store.fetchHistory(props.tax.id);
    items.value = error ? [] : historyItems;
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) loadHistory();
  },
);
</script>

<style scoped>
.tax-history-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.tax-history-table :deep(th) {
  font-weight: 600 !important;
  color: rgba(var(--v-theme-on-surface), 0.55) !important;
  white-space: nowrap;
}
</style>
