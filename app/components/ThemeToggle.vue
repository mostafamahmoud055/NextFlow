<template>
  <v-btn
    :aria-label="isDark ? t('theme.switchToLight') : t('theme.switchToDark')"
    variant="flat"
    color="surface"
    class="theme-toggle"
    rounded="pill"
    width="40"
    height="40"
    :ripple="false"
    @click="toggleTheme"
  >
    <v-icon size="20">
      {{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}
    </v-icon>
  </v-btn>
</template>

<script setup>
const { t } = useAppLocale()
const { isDark, toggleTheme } = useAppTheme()
</script>

<style scoped>
.theme-toggle {
  flex: none;
  padding: 0;
}

.theme-toggle :deep(.v-btn__content) {
  width: 40px;
  height: 40px;
  justify-content: center;
}

@media (hover: hover) {
  .theme-toggle:hover {
    transform: scale(1.06);
  }

  .theme-toggle:active {
    transform: scale(0.96);
  }
}
</style>
