<template>
  <v-app :dir="dir">
    <NuxtLayout>
      <GlobalSnackbar />
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>

<script setup>
import {
  getLocaleDirection,
  resolveLocale,
} from '~/utils/localeHelpers'

const { locale, t } = useI18n()
const dir = computed(() => getLocaleDirection(resolveLocale(locale.value)))

const i18nHead = useLocaleHead({
  dir: true,
  lang: true,
  seo: true,
})

useHead(i18nHead)

useHead({
  titleTemplate: (title) => (title ? `${title} · ${t('common.appName')}` : t('common.appName')),
})

useSeoMeta({
  description: () => t('common.metaDescription'),
  ogTitle: () => t('common.appName'),
  ogDescription: () => t('common.metaDescription'),
})
</script>
