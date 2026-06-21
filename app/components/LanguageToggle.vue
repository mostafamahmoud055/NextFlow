<template>
  <v-btn
    :aria-label="t('locale.switch')"
    variant="flat"
    color="surface"
    class="language-toggle"
    rounded="pill"
    width="40"
    height="40"
    :ripple="false"
    @click="toggleLocale"
  >
    <span class="language-toggle__label">{{ localeLabel }}</span>
  </v-btn>
</template>

<script setup>
const { t } = useAppLocale()
const { locale, toggleLocale } = useLocaleSwitcher()

const localeLabel = computed(() => (locale.value === 'ar' ? 'EN' : 'ع'))
</script>

<style scoped>
.language-toggle {
  flex: none;
  padding: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0;
}

.language-toggle :deep(.v-btn__content) {
  width: 40px;
  height: 40px;
  justify-content: center;
}

.language-toggle__label {
  display: block;
  width: 16px;
  text-align: center;
}

@media (hover: hover) {
  .language-toggle:hover {
    transform: scale(1.06);
  }

  .language-toggle:active {
    transform: scale(0.96);
  }
}
</style>
