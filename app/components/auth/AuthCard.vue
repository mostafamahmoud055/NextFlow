<template>
  <v-container class="auth-page fill-height pa-4 pa-sm-6" fluid>
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="10" md="7" lg="5" xl="4">
        <v-card class="auth-card" elevation="0" color="surface">
          <slot />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
