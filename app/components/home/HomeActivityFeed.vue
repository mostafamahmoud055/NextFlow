<template>
  <v-card class="dashboard-card flex-grow-1" elevation="0">
    <div class="d-flex align-center justify-space-between mb-6">
      <h2 class="text-h6 font-weight-bold dashboard-section-title">{{ t('dashboard.liveActivityFeed') }}</h2>
      <v-btn icon variant="flat" color="background" size="small">
        <v-icon size="20">mdi-arrow-top-right</v-icon>
      </v-btn>
    </div>

    <div class="d-flex flex-column ga-4">
      <!-- Activity 1 -->
      <v-sheet color="background" rounded="xl" class="pa-3 d-flex align-center justify-space-between activity-item">
        <div class="d-flex align-center">
          <v-avatar rounded="lg" size="48" class="me-3">
            <v-img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&h=150&fit=crop" cover eager />
          </v-avatar>
          <div>
            <div class="text-body-2 font-weight-bold">{{ t('dashboard.vipRoom', ['5']) }}</div>
            <div class="text-caption text-medium-emphasis">{{ t('dashboard.waiterRequested') }}</div>
          </div>
        </div>
        <div class="d-flex flex-column align-end">
          <v-btn color="primary" rounded="pill" size="small" class="text-none px-4 mb-1" height="28">
            {{ t('dashboard.handle') }}
          </v-btn>
          <span class="text-caption text-medium-emphasis">{{ t('dashboard.minAgo', ['3']) }}</span>
        </div>
      </v-sheet>

      <!-- Activity 2 -->
      <v-sheet color="background" rounded="xl" class="pa-3 d-flex align-center justify-space-between activity-item">
        <div class="d-flex align-center">
          <v-avatar rounded="lg" size="48" class="me-3">
            <v-img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=150&h=150&fit=crop" cover eager />
          </v-avatar>
          <div>
            <div class="text-body-2 font-weight-bold">{{ t('dashboard.kitchen') }}</div>
            <div class="text-caption text-medium-emphasis">{{ t('dashboard.orderReady', ['12']) }}</div>
          </div>
        </div>
        <div class="d-flex flex-column align-end">
          <v-btn color="primary" rounded="pill" size="small" class="text-none px-4 mb-1" height="28">
            {{ t('dashboard.handle') }}
          </v-btn>
          <span class="text-caption text-medium-emphasis">{{ t('dashboard.minAgo', ['3']) }}</span>
        </div>
      </v-sheet>
    </div>
  </v-card>
</template>

<script setup>
const { t } = useAppLocale()
</script>

<style scoped>
@media (max-width: 768px) {
  .activity-item {
    flex-direction: column;
    align-items: stretch !important;
    gap: 12px;
  }

  .activity-item > .d-flex.align-center {
    min-width: 0;
  }

  .activity-item > .d-flex.flex-column.align-end {
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between;
    width: 100%;
  }

  .activity-item .v-avatar {
    width: 40px !important;
    height: 40px !important;
  }
}
</style>
