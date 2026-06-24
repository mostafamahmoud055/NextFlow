<template>
  <AuthCard>
    <div class="d-flex align-center ga-2 mb-8 auth-header__brand">
      <v-icon color="#f97316" size="30">mdi-fire</v-icon>
      <span class="text-h6 font-weight-bold text-high-emphasis">{{ t('common.appName') }}</span>
    </div>

    <v-progress-circular
      v-if="loading"
      indeterminate
      color="primary"
      class="d-block mx-auto"
      size="48"
    />

    <template v-else>
      <h1 class="text-h4 font-weight-bold text-high-emphasis mb-2 auth-header__title">
        {{ title }}
      </h1>
      <p
        v-if="subtitle"
        class="text-body-1 text-medium-emphasis mb-8 auth-header__subtitle"
      >
        {{ subtitle }}
      </p>

      <v-btn
        v-if="errorMessage"
        block
        color="primary"
        rounded="pill"
        size="large"
        class="text-none"
        to="/signin"
      >
        {{ t('auth.backToSignIn') }}
      </v-btn>
    </template>
  </AuthCard>
</template>

<script setup>
definePageMeta({
  layout: "blank",
  pageTransition: {
    name: "auth-slide",
    mode: "out-in",
  },
});

const { t } = useAppLocale();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref(true);
const errorMessage = ref("");
const title = ref(t("common.loading"));
const subtitle = ref("");

onMounted(async () => {
  const error = route.query.error;

  if (error) {
    loading.value = false;
    title.value = t("auth.googleAuthErrorTitle");
    errorMessage.value =
      error === "google_email_missing"
        ? t("auth.googleEmailMissing")
        : t("auth.googleAuthFailed");
    subtitle.value = errorMessage.value;
    return;
  }

  const result = await authStore.fetchUser();

  if (result.error || !authStore.isAuthenticated) {
    loading.value = false;
    title.value = t("auth.googleAuthErrorTitle");
    errorMessage.value = t("auth.googleAuthFailed");
    subtitle.value = errorMessage.value;
    return;
  }

  if (!authStore.user?.email_verified_at) {
    await navigateTo("/verify-email");
    return;
  }

  await navigateTo("/");
});
</script>
