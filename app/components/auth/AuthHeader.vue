<template>
  <div class="mb-2">
    <div class="d-flex align-center ga-2 mb-8 auth-header__brand">
      <v-icon color="#f97316" size="30">mdi-fire</v-icon>
      <span class="text-h6 font-weight-bold text-high-emphasis">{{ t('common.appName') }}</span>
    </div>
    <h1 class="text-h4 font-weight-bold text-high-emphasis mb-2 auth-header__title">
      {{ title }}
    </h1>
    <p class="text-body-1 text-medium-emphasis mb-8 auth-header__subtitle">
      {{ subtitle }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
})

const { t } = useAppLocale()
</script>
