<template>
  <HomeStats class="animate mt-4 mt-sm-6 mt-md-8" style="--delay: 0" />

  <v-row class="animate mt-0 dashboard-content-row" style="--delay: 1">
    <v-col cols="12" lg="8">
      <HomeAnalytics />
    </v-col>

    <v-col cols="12" lg="4" class="d-flex flex-column">
      <HomeTimeStatus />
      <HomeActivityFeed />
    </v-col>
  </v-row>
</template>

<script setup>
import HomeStats from '~/components/home/HomeStats.vue'
import HomeAnalytics from '~/components/home/HomeAnalytics.vue'
import HomeTimeStatus from '~/components/home/HomeTimeStatus.vue'
import HomeActivityFeed from '~/components/home/HomeActivityFeed.vue'

const { t } = useAppLocale()

definePageMeta({
  middleware: ['auth', 'verified'],
})

useHead({
  title: () => t('dashboard.title'),
})
</script>
