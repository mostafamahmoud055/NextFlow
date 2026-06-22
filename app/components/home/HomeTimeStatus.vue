<template>
  <v-card class="dashboard-card mb-6" elevation="0">
    <h2 class="text-h6 font-weight-bold mb-6 dashboard-section-title">{{ t('dashboard.timeStatus') }}</h2>
    
    <div class="gauge-container d-flex flex-column align-center justify-center pt-4 pb-2">
      <!-- Mock Gauge Chart -->
      <div class="gauge-arc">
        <svg viewBox="0 0 200 100" class="gauge-svg">
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(var(--v-theme-on-surface), 0.05)" stroke-width="24" stroke-linecap="round" />
          <path d="M 20 100 A 80 80 0 0 1 100 20" fill="none" stroke="rgba(var(--v-theme-success), 0.2)" stroke-width="24" stroke-linecap="round" stroke-dasharray="8 4" />
        </svg>
        <div class="gauge-content text-center">
          <div class="text-h4 font-weight-bold">20 min</div>
          <div class="text-caption text-medium-emphasis">{{ t('dashboard.avgWaitTime') }}</div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
const { t } = useAppLocale()
</script>

<style scoped>
.gauge-container {
  position: relative;
  width: 100%;
}

.gauge-arc {
  position: relative;
  width: 240px;
  height: 120px;
  min-height: 120px;
}

.gauge-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.gauge-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

@media (min-width: 769px) and (max-width: 1023px) {
  .gauge-arc {
    width: 220px;
    height: 110px;
    min-height: 110px;
  }
}

@media (max-width: 768px) {
  .gauge-arc {
    width: 200px;
    height: 100px;
    min-height: 100px;
  }

  .gauge-content .text-h4 {
    font-size: 1.5rem !important;
    line-height: 1.2 !important;
  }
}
</style>
