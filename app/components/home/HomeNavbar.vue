<template>
  <v-toolbar flat color="transparent" height="80" class="dashboard-navbar px-0">
    <div class="navbar-inner">
      <div class="d-flex align-center ga-2 navbar-brand">
        <v-icon color="#f97316" size="32">mdi-fire</v-icon>
        <span class="text-h6 font-weight-bold text-high-emphasis">{{ t('common.appName') }}</span>
      </div>

      <div class="navbar-nav-slot">
        <v-sheet
          color="surface"
          rounded="pill"
          class="navbar-nav-group align-center px-4 py-2"
          elevation="0"
          border
        >
          <v-btn
            v-for="item in navItems"
            :key="item.key"
            :variant="item.active ? 'flat' : 'text'"
            :color="item.active ? 'primary' : 'medium-emphasis'"
            rounded="pill"
            size="small"
            height="40"
            class="navbar-nav-btn text-none font-weight-medium px-4"
            :ripple="false"
          >
            {{ t(`dashboard.${item.key}`) }}
          </v-btn>
        </v-sheet>
      </div>

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
          <v-icon size="20">mdi-headset</v-icon>
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
        <ThemeToggle />

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
  </v-toolbar>
</template>

<script setup>
const { t } = useAppLocale()

const navItems = [
  { key: 'dashboard', active: true },
  { key: 'menu', active: false },
  { key: 'order', active: false },
  { key: 'tables', active: false },
  { key: 'vipRooms', active: false },
  { key: 'sales', active: false },
]
</script>

<style scoped>
.dashboard-navbar {
  flex: none;
  min-height: 80px;
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

.navbar-nav-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
  height: 44px;
}

.navbar-nav-group {
  display: flex;
  flex: none;
  flex-shrink: 0;
  align-items: center;
  min-width: 36rem;
  width: max-content;

  visibility: visible;
  opacity: 1;
  pointer-events: auto;
}

@media (max-width: 959px) {
  .navbar-nav-slot {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
  }

  .navbar-nav-group {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
  }
}

.navbar-nav-btn {
  flex: none;
  letter-spacing: 0;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.navbar-nav-group :deep(.v-btn__content) {
  height: 36px;
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
</style>
