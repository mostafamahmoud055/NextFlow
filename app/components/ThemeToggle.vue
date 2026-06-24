<template>
  <v-btn
    :aria-label="isDark ? t('theme.switchToLight') : t('theme.switchToDark')"
    :aria-pressed="isDark"
    variant="flat"
    color="surface"
    class="theme-toggle"
    :class="{ 'theme-toggle--active': isDark }"
    rounded="pill"
    width="40"
    height="40"
    :ripple="false"
    @click="toggleTheme"
  >
    <v-icon size="20" color="high-emphasis">
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
  background-color: rgb(var(--v-theme-surface)) !important;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.15s ease;
}

.theme-toggle :deep(.v-btn__overlay) {
  opacity: 0;
}

.theme-toggle :deep(.v-btn__content) {
  width: 40px;
  height: 40px;
  justify-content: center;
}



@media (hover: hover) {
  .theme-toggle:hover {
    background-color: rgb(var(--v-theme-surface-bright)) !important;
    transform: scale(1.06);
  }

  .theme-toggle:active {
    background-color: rgb(var(--v-theme-surface-bright)) !important;
    transform: scale(0.96);
  }
}
</style>
