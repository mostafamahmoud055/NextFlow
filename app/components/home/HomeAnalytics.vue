<template>
  <v-card class="dashboard-card h-100" elevation="0">
    <div class="d-flex align-center justify-space-between mb-8">
      <h2 class="text-h6 font-weight-bold">{{ t('dashboard.salesAnalytics') }}</h2>
      <v-btn variant="text" color="medium-emphasis" size="small" class="text-none font-weight-medium" append-icon="mdi-chevron-down">
        {{ t('dashboard.today') }}
      </v-btn>
    </div>

    <!-- Mock Chart Area -->
    <div class="chart-container position-relative">
      <div class="chart-y-axis">
        <span class="text-caption text-medium-emphasis">$6k</span>
      </div>
      
      <div class="chart-grid">
        <div class="chart-line dashed"></div>
      </div>

      <div class="chart-bars d-flex align-end justify-space-between px-4">
        <!-- Sun -->
        <div class="bar-group">
          <div class="bar bg-success-light" style="height: 20%"></div>
        </div>
        <!-- Mon -->
        <div class="bar-group">
          <div class="bar bg-primary-light" style="height: 40%"></div>
          <div class="bar bg-success-light" style="height: 15%"></div>
        </div>
        <!-- Tue (Active) -->
        <div class="bar-group active">
          <div class="bar bg-success" style="height: 80%">
            <div class="bar-tooltip">
              <v-icon size="12" color="white">mdi-chevron-down</v-icon>
            </div>
          </div>
          <div class="active-line"></div>
        </div>
        <!-- Wed -->
        <div class="bar-group">
          <div class="bar bg-surface-variant" style="height: 35%"></div>
          <div class="bar bg-success-light" style="height: 10%"></div>
        </div>
        <!-- Thu -->
        <div class="bar-group">
          <div class="bar bg-surface-variant" style="height: 25%"></div>
        </div>
        <!-- Fri -->
        <div class="bar-group">
          <div class="bar bg-surface-variant" style="height: 30%"></div>
        </div>
      </div>

      <div class="chart-x-axis d-flex justify-space-between px-4 mt-4">
        <span class="text-caption text-medium-emphasis">Sun</span>
        <span class="text-caption text-medium-emphasis">Mon</span>
        <span class="text-caption font-weight-bold">Tue</span>
        <span class="text-caption text-medium-emphasis">Wed</span>
        <span class="text-caption text-medium-emphasis">Thu</span>
        <span class="text-caption text-medium-emphasis">Fri</span>
      </div>
    </div>
  </v-card>
</template>

<script setup>
const { t } = useAppLocale()
</script>

<style scoped>
.chart-container {
  height: 300px;
  padding-top: 20px;
}

.chart-y-axis {
  position: absolute;
  top: 0;
  left: 0;
}

[dir="rtl"] .chart-y-axis {
  left: auto;
  right: 0;
}

.chart-grid {
  position: absolute;
  top: 10px;
  left: 30px;
  right: 0;
  height: calc(100% - 40px);
}

[dir="rtl"] .chart-grid {
  left: 0;
  right: 30px;
}

.chart-line {
  width: 100%;
  border-top: 1px dashed rgba(var(--v-theme-success), 0.5);
}

.chart-bars {
  position: relative;
  height: calc(100% - 40px);
  z-index: 1;
  margin-left: 30px;
}

[dir="rtl"] .chart-bars {
  margin-left: 0;
  margin-right: 30px;
}

.bar-group {
  width: 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  position: relative;
}

.bar {
  width: 100%;
  min-height: 4px;
  border-radius: 8px;
  position: relative;
}

.bg-success-light {
  background-color: rgba(var(--v-theme-success), 0.2);
}

.bg-primary-light {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.bg-surface-variant {
  background-color: rgba(var(--v-theme-on-surface), 0.05);
}

.bar-group.active .active-line {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: calc(100% + 30px);
  background-color: rgb(var(--v-theme-success));
  z-index: -1;
}

.bar-tooltip {
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
