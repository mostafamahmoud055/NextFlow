<template>
  <v-app :dir="dir">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>

<script setup>
import {
  LOCALE_COOKIE_KEY,
  LOCALE_COOKIE_OPTIONS,
  getLocaleDirection,
  resolveLocale,
} from '~/utils/localeHelpers'

const localeCookie = useCookie(LOCALE_COOKIE_KEY, LOCALE_COOKIE_OPTIONS)
const dir = computed(() => getLocaleDirection(resolveLocale(localeCookie.value)))

const i18nHead = useLocaleHead({
  dir: true,
  lang: true,
  seo: false,
})

useHead(i18nHead)
</script>
