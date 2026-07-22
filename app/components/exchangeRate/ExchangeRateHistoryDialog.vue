<template>
  <v-dialog
    :model-value="modelValue"
    max-width="820"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
        <span class="text-h6 font-weight-bold">
          {{ t('exchangeRate.historyTitle') }}
          <span v-if="currencyCode" class="text-medium-emphasis">
            — {{ currencyCode }}
          </span>
        </span>
        <v-btn
          icon
          variant="text"
          size="small"
          :aria-label="t('buttons.close')"
          @click="emit('update:modelValue', false)"
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
          {{ t('exchangeRate.historyEmpty') }}
        </div>

        <v-table v-else>
          <thead>
            <tr>
              <th>{{ t('exchangeRate.rate') }}</th>
              <th>{{ t('exchangeRate.rateType') }}</th>
              <th>{{ t('exchangeRate.effectiveDate') }}</th>
              <th>{{ t('exchangeRate.expiryDate') }}</th>
              <th>{{ t('exchangeRate.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in items" :key="row.id">
              <td class="font-weight-medium">{{ row.rate }}</td>
              <td>{{ typeLabel(row) }}</td>
              <td>{{ row.effective_date || '—' }}</td>
              <td>{{ row.expiry_date || '—' }}</td>
              <td>
                <v-chip
                  size="small"
                  :color="isActive(row) ? 'success' : 'secondary'"
                  variant="tonal"
                >
                  {{
                    isActive(row)
                      ? t('exchangeRate.statusActive')
                      : t('exchangeRate.statusInactive')
                  }}
                </v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { EXCHANGE_RATE_TYPES } from "~/utils/exchangeRateConstants";
import { enumValue } from "~/utils/enumValue";

defineProps({
  modelValue: { type: Boolean, default: false },
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  currencyCode: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);
const { t } = useAppLocale();

function isActive(row) {
  return enumValue(row.status) === "active";
}

function typeLabel(row) {
  const value = enumValue(row.rate_type) || row.rate_type;
  const match = EXCHANGE_RATE_TYPES.find((item) => item.value === value);
  return match ? t(match.labelKey) : value || "—";
}
</script>
