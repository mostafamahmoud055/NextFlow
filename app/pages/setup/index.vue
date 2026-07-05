<template>
  <AuthCard class="setup-page">
    <SetupWizard />
  </AuthCard>
</template>

<script setup>
definePageMeta({
  layout: "blank",
  middleware: ["auth", "verified", "setup"],
});

const { t } = useAppLocale();

useHead({
  title: () => t("setup.title"),
});
</script>

<style scoped>
.setup-page {
  width: 100%;
}

@media (min-width: 769px) and (max-width: 1023px) {
  .setup-page :deep(.auth-page__col) {
    flex: 0 0 91.666667%;
    max-width: min(720px, 100%);
    width: 100%;
  }

  .setup-page :deep(.auth-page__row) {
    justify-content: center;
  }
}

@media (min-width: 1024px) {
  .setup-page :deep(.auth-page__col) {
    flex: 0 0 66.666667%;
    max-width: min(760px, 100%);
    width: 100%;
  }

  .setup-page :deep(.auth-page__row) {
    justify-content: center;
  }
}
</style>
