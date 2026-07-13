<template>
  <v-app-bar flat color="background" height="80" class="dashboard-navbar px-0" :order="0">
    <div class="navbar-inner px-4 px-md-8">
      <div class="d-flex align-center ga-2 navbar-brand">
        <v-icon color="#f97316" size="32">mdi-fire</v-icon>
        <span class="text-h6 font-weight-bold text-high-emphasis">{{ t('common.appName') }}</span>
      </div>

      <AppBarSearch v-model="searchQuery" />

      <div class="d-flex align-center ga-2 navbar-actions">
        <v-btn
          v-if="authStore.hasCompanies"
          :to="selectCompanyTo"
          variant="flat"
          color="surface"
          rounded="pill"
          height="40"
          class="company-switch text-none"
          :aria-label="t('tenant.switch')"
          :ripple="false"
        >
          <v-icon size="18" start>mdi-office-building-outline</v-icon>
          <span class="company-switch__label">{{ currentCompanyName }}</span>
          <v-icon size="16" color="medium-emphasis" end>mdi-swap-horizontal</v-icon>
        </v-btn>

        <v-btn
          icon
          variant="text"
          color="medium-emphasis"
          rounded="pill"
          width="40"
          height="40"
          class="navbar-actions__icon"
          :aria-label="t('dashboard.settings')"
          :ripple="false"
        >
          <v-icon size="20">mdi-cog-outline</v-icon>
        </v-btn>
        <v-btn
          icon
          variant="text"
          color="medium-emphasis"
          rounded="pill"
          width="40"
          height="40"
          class="navbar-actions__icon"
          :aria-label="t('dashboard.notifications')"
          :ripple="false"
        >
          <v-badge color="error" dot>
            <v-icon size="20">mdi-bell-outline</v-icon>
          </v-badge>
        </v-btn>

        <div class="d-flex align-center ga-1 navbar-locale-group">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        <v-menu location="bottom end" offset="8">
          <template #activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              variant="flat"
              color="surface"
              rounded="pill"
              width="132"
              height="40"
              class="profile-toggle text-none"
              :aria-label="t('dashboard.profileMenu')"
              :ripple="false"
            >
              <v-avatar size="28" class="profile-toggle__avatar">
                <v-img
                  :src="profileAvatar"
                  :alt="profileLabel"
                  cover
                  width="28"
                  height="28"
                />
              </v-avatar>
              <span class="profile-toggle__label">{{ profileLabel }}</span>
              <v-icon size="16" color="medium-emphasis" class="profile-toggle__icon">mdi-chevron-down</v-icon>
            </v-btn>
          </template>

          <v-list class="profile-menu py-2" density="compact" min-width="200" rounded="lg">
            <v-list-item
              prepend-icon="mdi-account-outline"
              title="Profile"
              rounded="lg"
              @click="handleProfile"
            />
            <v-list-item
              prepend-icon="mdi-logout"
              title="Logout"
              rounded="lg"
              :loading="loggingOut"
              :disabled="loggingOut"
              @click="handleLogout"
            />
          </v-list>
        </v-menu>
      </div>
    </div>
  </v-app-bar>
</template>

<script setup>
const { t } = useAppLocale()
const authStore = useAuthStore()
const route = useRoute()

const searchQuery = ref('')
const loggingOut = ref(false)

const profileLabel = computed(() => authStore.user?.name || t('dashboard.admin'))
const profileAvatar = computed(() => authStore.user?.avatar || 'https://i.pravatar.cc/150?img=32')
const currentCompanyName = computed(() => authStore.tenant?.name || t('tenant.switch'))

const selectCompanyTo = computed(() => {
  const current = route.fullPath

  if (!current || current === '/select-company' || current.startsWith('/select-company?')) {
    return '/select-company'
  }

  return {
    path: '/select-company',
    query: { redirect: current },
  }
})



async function handleLogout() {
  if (loggingOut.value) return

  loggingOut.value = true

  try {
    await authStore.logout()
    await navigateTo('/signin')
  } finally {
    loggingOut.value = false
  }
}
</script>

<style scoped>
.dashboard-navbar {
  flex: none;
  min-height: 80px;
}

@media (max-width: 768px) {
  .dashboard-navbar {
    min-height: 64px;
  }
}

.dashboard-navbar :deep(.v-toolbar__content) {
  display: block;
  width: 100%;
  height: 80px;
  padding-inline: 0;
}

.navbar-inner {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  width: 100%;
  height: 80px;
  column-gap: 16px;
}

.navbar-brand,
.navbar-actions {
  flex: none;
}

.navbar-locale-group {
  flex: none;
  flex-shrink: 0;
}

.profile-toggle {
  flex: none;
  min-width: 132px !important;
  width: 132px !important;
  padding: 0 !important;
}

.profile-toggle :deep(.v-btn__content) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 132px;
  height: 40px;
  gap: 4px;
}

.profile-toggle__avatar {
  flex: none;
  width: 28px !important;
  height: 28px !important;
  min-width: 28px;
}

.profile-toggle__avatar :deep(.v-responsive) {
  width: 28px !important;
  height: 28px !important;
}

.profile-toggle__avatar :deep(.v-img__img) {
  width: 28px;
  height: 28px;
}

.profile-toggle__label {
  flex: none;
  width: 52px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-toggle__icon {
  flex: none;
  width: 16px;
  height: 16px;
}

.company-switch {
  flex: none;
  /* max-width: 200px; */
  padding-inline: 12px !important;
}

.company-switch__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 500;
}

.profile-menu {
  border: unset;
  box-shadow: unset;
}

.profile-menu :deep(.v-list-item) {
  min-height: 40px;
}

@media (max-width: 768px) {
  .dashboard-navbar :deep(.v-toolbar__content) {
    height: 64px;
  }

  .navbar-inner {
    grid-template-columns: auto minmax(0, 1fr) auto;
    height: 64px;
    column-gap: 8px;
  }

  .navbar-brand span {
    display: none;
  }

  .navbar-brand .v-icon {
    font-size: 28px !important;
  }

  .navbar-actions .navbar-actions__icon {
    display: none;
  }

  .navbar-locale-group {
    display: flex;
  }

  .profile-toggle {
    min-width: 40px !important;
    width: 40px !important;
  }

  .profile-toggle :deep(.v-btn__content) {
    width: 40px;
  }

  .profile-toggle__label,
  .profile-toggle__icon {
    display: none;
  }

  .company-switch__label {
    display: none;
  }
}

@media (min-width: 769px) and (max-width: 1023px) {
  .navbar-inner {
    column-gap: 12px;
  }

  .navbar-actions .navbar-actions__icon {
    display: none;
  }

  .navbar-locale-group {
    display: flex;
  }

  .profile-toggle {
    min-width: 40px !important;
    width: 40px !important;
  }

  .profile-toggle :deep(.v-btn__content) {
    width: 40px;
    gap: 0;
  }

  .profile-toggle__label,
  .profile-toggle__icon {
    display: none;
  }
}
</style>
