<template>
  <v-layout class="app-layout" :class="{ 'drawer-prehydrate': !drawerInteractive }">
    <v-navigation-drawer
      :expand-on-hover="drawerInteractive"
      permanent
      rail
      color="surface"
      border="end"
      elevation="0"
    >
      <v-list density="comfortable" nav class="py-4">
        <v-list-item class="sidebar-brand" lines="one">
          <template #prepend>
            <v-avatar size="28" class="me-1">
              <v-img src="https://i.pravatar.cc/150?img=32" alt="Profile" eager width="28" height="28" cover />
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-bold">
            <span class="text-body-2 font-weight-medium me-1">{{ t('dashboard.admin') }}</span>
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <v-divider />

      <v-list density="compact" nav class="py-2">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :prepend-icon="item.icon"
          :title="t(item.titleKey)"
          :to="item.to"
          :active="isActive(item.to)"
          rounded="lg"
          color="primary"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main class="bg-background">
      <slot />
    </v-main>
  </v-layout>
</template>

<script setup>
const { t } = useAppLocale()
const route = useRoute()
const drawerInteractive = ref(false)

const navItems = [
  { titleKey: 'navigation.dashboard', icon: 'mdi-view-dashboard', to: '/' },
  { titleKey: 'navigation.users', icon: 'mdi-account-group', to: '/users' },
  { titleKey: 'navigation.settings', icon: 'mdi-cog', to: '/settings' },
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

onMounted(() => {
  drawerInteractive.value = true
})
</script>

<style scoped>
.sidebar-brand :deep(.v-list-item__overlay) {
  opacity: 0;
}

.app-layout.drawer-prehydrate :deep(.v-navigation-drawer) {
  width: 56px !important;
  transition: none !important;
}

.app-layout.drawer-prehydrate :deep(.v-navigation-drawer__content) {
  transition: none !important;
}

.app-layout:not(.drawer-prehydrate) :deep(.v-navigation-drawer) {
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
