<template>
  <v-container fluid class="dashboard-page fill-height pa-4 pa-md-8 pb-8">
    <HomeNavbar />

    <HomeStats class="auth-animate mt-8" style="--delay: 0" />

    <v-row class="auth-animate mt-0" style="--delay: 1">
      <v-col cols="12" lg="8">
        <HomeAnalytics />
      </v-col>

      <v-col cols="12" lg="4" class="d-flex flex-column">
        <HomeTimeStatus />
        <HomeActivityFeed />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import HomeNavbar from '~/components/home/HomeNavbar.vue'
import HomeStats from '~/components/home/HomeStats.vue'
import HomeAnalytics from '~/components/home/HomeAnalytics.vue'
import HomeTimeStatus from '~/components/home/HomeTimeStatus.vue'
import HomeActivityFeed from '~/components/home/HomeActivityFeed.vue'
</script>

<style scoped>
.dashboard-page {
  width: 95%;
  max-width: 100%;
  margin-inline: auto;
}
</style>
