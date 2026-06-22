<template>
  <v-container class="auth-page pa-4 pa-sm-6 pa-md-8" fluid>
    <v-row align="start" align-sm="center" justify="center" class="auth-page__row ma-0">
      <v-col cols="12" sm="10" md="7" lg="5" xl="4" class="auth-page__col pa-0">
        <v-card class="auth-card" elevation="0" color="surface">
          <slot />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
