<template>
  <v-app :dir="dir">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>

<script setup>
import {
  getLocaleDirection,
  resolveLocale,
} from '~/utils/localeHelpers'

const { locale } = useI18n()
const dir = computed(() => getLocaleDirection(resolveLocale(locale.value)))

const i18nHead = useLocaleHead({
  dir: true,
  lang: true,
  seo: false,
})

useHead(i18nHead)
</script>
