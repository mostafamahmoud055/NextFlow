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
          icon
          variant="text"
          color="medium-emphasis"
          rounded="pill"
          width="40"
          height="40"
          :ripple="false"
        >
        </v-btn>
        <v-btn
          icon
          variant="text"
          color="medium-emphasis"
          rounded="pill"
          width="40"
          height="40"
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
          :ripple="false"
        >
          <v-badge color="error" dot>
            <v-icon size="20">mdi-bell-outline</v-icon>
          </v-badge>
        </v-btn>

        <LanguageToggle />

        <v-btn
          variant="flat"
          color="surface"
          rounded="pill"
          width="132"
          height="40"
          class="profile-toggle text-none"
          :ripple="false"
        >
          <v-avatar size="28" class="profile-toggle__avatar">
            <v-img
              src="https://i.pravatar.cc/150?img=32"
              alt="Profile"
              cover
              width="28"
              height="28"
              eager
            />
          </v-avatar>
          <span class="profile-toggle__label">{{ t('dashboard.admin') }}</span>
          <v-icon size="16" color="medium-emphasis" class="profile-toggle__icon">mdi-chevron-down</v-icon>
        </v-btn>
      </div>
    </div>
  </v-app-bar>
</template>

<script setup>
const { t } = useAppLocale()

const searchQuery = ref('')
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

  .navbar-actions .v-btn:not(.profile-toggle):first-child {
    display: none;
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
}

@media (min-width: 769px) and (max-width: 1023px) {
  .navbar-inner {
    column-gap: 12px;
  }

  .navbar-actions .v-btn:not(.profile-toggle):first-child {
    display: none;
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
