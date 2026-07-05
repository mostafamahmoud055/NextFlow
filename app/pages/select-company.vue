<template>
  <AuthCard>
    <AuthHeader
      :title="t('tenant.selectTitle')"
      :subtitle="t('tenant.selectSubtitle')"
    />

    <div v-if="loading" class="d-flex justify-center py-8">
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
            <v-img v-if="company.logo" :src="company.logo" cover />
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
  middleware: ["auth", "verified"],
});

const { t } = useAppLocale();
const auth = useAuthStore();

const { fetchApi } = useApi();

const companies = ref([]);
const loading = ref(true);

async function loadCompanies() {
  loading.value = true;

  const result = await fetchApi("/companies", { silent: true });

  const payload = result.data?.data ?? result.data ?? {};
  companies.value = payload.items ?? (Array.isArray(payload) ? payload : []);

  loading.value = false;
}

async function handleSelect(company) {
  await auth.setTenant(company);
  await auth.fetchUser();
}

onMounted(loadCompanies);
</script>

<style scoped>
.company-list__item {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.company-list__item.v-list-item--active {
  border-color: rgb(var(--v-theme-primary));
}
</style>
