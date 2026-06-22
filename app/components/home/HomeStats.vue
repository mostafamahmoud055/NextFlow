<template>
  <div class="mb-4 mb-md-6">
    <div class="d-flex align-center justify-space-between mb-4 mb-md-6">
      <h1 class="text-h4 font-weight-bold text-high-emphasis dashboard-page-title">
        {{ t('dashboard.title') }}
      </h1>
    </div>

    <v-row class="home-stats-row">
      <v-col cols="12" md="4">
        <v-card class="dashboard-card" elevation="0">
          <div class="d-flex align-center mb-4">
            <v-sheet color="background" rounded="lg" class="pa-2 me-4">
              <v-icon size="24" color="medium-emphasis">mdi-receipt-outline</v-icon>
            </v-sheet>
            <span class="text-h4 font-weight-bold dashboard-stat-value">134</span>
          </div>
          <div class="text-body-2 text-medium-emphasis">{{ t('dashboard.totalActiveOrders') }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="dashboard-card" elevation="0">
          <div class="d-flex align-center mb-4">
            <v-sheet color="background" rounded="lg" class="pa-2 me-4">
              <v-icon size="24" color="medium-emphasis">mdi-table-furniture</v-icon>
            </v-sheet>
            <span class="text-h4 font-weight-bold dashboard-stat-value">12/40</span>
          </div>
          <div class="text-body-2 text-medium-emphasis">{{ t('dashboard.occupiedTables') }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="dashboard-card" elevation="0">
          <div class="d-flex align-center mb-4">
            <v-sheet color="background" rounded="lg" class="pa-2 me-4">
              <v-icon size="24" color="medium-emphasis">mdi-chart-line</v-icon>
            </v-sheet>
            <span class="text-h4 font-weight-bold dashboard-stat-value">$18,423</span>
          </div>
          <div class="text-body-2 text-medium-emphasis">{{ t('dashboard.totalRevenue') }}</div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
const { t } = useAppLocale()
</script>
