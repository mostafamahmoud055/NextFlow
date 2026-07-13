<template>
  <AuthCard>
    <AuthHeader
      :title="t('tenant.selectTitle')"
      :subtitle="t('tenant.selectSubtitle')"
    />

    <div v-if="!auth.initialized" class="d-flex justify-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-list v-else-if="companies.length" class="company-list pa-0" nav>
      <v-list-item
        v-for="company in companies"
        :key="company.uuid"
        :active="company.uuid === auth.tenantId"
        rounded="lg"
        class="company-list__item mb-2"
        @click="handleSelect(company)"
      >
        <template #prepend>
          <v-avatar size="40" color="surface-bright" class="me-2">
            <v-img v-if="company.logo_url" :src="company.logo_url" cover />
            <v-icon v-else size="22">mdi-office-building-outline</v-icon>
          </v-avatar>
        </template>

        <v-list-item-title class="font-weight-medium">
          {{ company.name_en || company.name_ar || t('tenant.companyFallback', 'Company') }}
        </v-list-item-title>

        <template #append>
          <v-icon v-if="company.uuid === auth.tenantId" color="primary">mdi-check-circle</v-icon>
        </template>
      </v-list-item>
    </v-list>

    <div v-else class="text-center text-medium-emphasis py-8">
      {{ t('tenant.noCompanies') }}
    </div>
  </AuthCard>
</template>

<script setup>
definePageMeta({
  layout: "blank",
  middleware: ["auth"],
});

const { t } = useAppLocale();
const auth = useAuthStore();
const route = useRoute();

const companies = computed(() => auth.companies);

function resolveRedirect() {
  const redirect = route.query.redirect;

  if (typeof redirect !== "string") return "/";
  if (!redirect.startsWith("/") || redirect.startsWith("//")) return "/";
  if (redirect === "/select-company" || redirect.startsWith("/select-company?")) {
    return "/";
  }

  return redirect;
}

async function handleSelect(company) {
  auth.setTenant(company);
  await navigateTo(resolveRedirect());
}

onMounted(async () => {
  if (!auth.initialized) {
    await auth.initAuth();
  }
});
</script>

<style scoped>
.company-list__item {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.company-list__item.v-list-item--active {
  border-color: rgb(var(--v-theme-primary));
}
</style>
