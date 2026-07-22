<template>
  <v-layout class="app-layout" :class="isRail ? 'is-rail' : 'is-expanded'">
    <AppBar />

    <v-navigation-drawer
      permanent
      absolute
      :rail="isRail"
      rail-width="88"
      width="280"
      color="transparent"
      border="0"
      elevation="0"
      :order="1"
    >
      <div class="sidebar-container" @click="expandDrawer">
        <v-sheet class="floating-sidebar d-flex flex-column py-4" color="surface" elevation="0">
          


          <!-- Nav Items -->
          <v-list
            v-model:opened="openedGroups"
            open-strategy="single"
            density="compact"
            nav
            class="px-3 sidebar-list"
          >
            <template v-for="(item, index) in visibleNavigationItems" :key="item.titleKey || `divider-${index}`">

              <v-divider
                v-if="item.type === 'divider'"
                class="sidebar-divider my-3"
              />

              <!-- Rail Mode -->
              <v-menu
                v-else-if="isRail"
                open-on-hover
                location="end top"
                offset="16"
                content-class="rail-popout"
              >
                <template #activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    :to="!item.children ? item.to : undefined"
                    :active="isActive(item)"
                    class="nav-item mb-2"
                    :class="{ 'is-active-parent': isActive(item) }"
                    :ripple="false"
                    @click.stop="expandDrawer"
                  >
                    <template #prepend>
                      <div class="nav-icon-wrapper d-flex align-center justify-center">
                        <v-icon :icon="item.icon" size="22" class="nav-icon" />
                      </div>
                    </template>
                  </v-list-item>
                </template>

                <v-list class="pa-0" min-width="220" elevation="0">
                  <div class="popout-header px-4 py-3">
                    <span class="text-body-2 font-weight-bold text-white">{{ t(item.titleKey) }}</span>
                  </div>
                  <template v-if="item.children">
                    <div class="popout-body py-2">
                      <v-list-item
                        v-for="child in item.children"
                        :key="child.to"
                        :to="child.to"
                        :active="isActive(child)"
                        class="popout-child-item px-4"
                        :ripple="false"
                        density="compact"
                      >
                        <v-list-item-title class="text-body-2 font-weight-medium">{{ t(child.titleKey) }}</v-list-item-title>
                      </v-list-item>
                    </div>
                  </template>
                </v-list>
              </v-menu>

              <!-- Expanded Mode -->
              <template v-else>
                <v-list-group v-if="item.children" :value="item.titleKey">
                  <template #activator="{ props }">
                    <v-list-item
                      v-bind="props"
                      class="nav-item mb-2"
                      :class="{ 'is-active-parent': isActive(item) }"
                      :ripple="false"
                    >
                      <template #prepend>
                        <div class="nav-icon-wrapper d-flex align-center justify-center">
                          <v-icon :icon="item.icon" size="22" class="nav-icon" />
                        </div>
                      </template>
                      <v-list-item-title class="font-weight-medium text-body-2 ms-2">
                        {{ t(item.titleKey) }}
                      </v-list-item-title>
                    </v-list-item>
                  </template>

                  <v-list-item
                    v-for="child in item.children"
                    :key="child.to"
                    :to="child.to"
                    :active="isActive(child)"
                    class="nav-item-child mb-1"
                    :ripple="false"
                    density="compact"
                  >
                    <v-list-item-title class="text-body-2 font-weight-medium">{{ t(child.titleKey) }}</v-list-item-title>
                  </v-list-item>
                </v-list-group>

                <v-list-item
                  v-else
                  :to="item.to"
                  :active="isActive(item)"
                  class="nav-item mb-2"
                  :class="{ 'is-active-parent': isActive(item) }"
                  :ripple="false"
                >
                  <template #prepend>
                    <div class="nav-icon-wrapper d-flex align-center justify-center">
                      <v-icon :icon="item.icon" size="22" class="nav-icon" />
                    </div>
                  </template>
                  <v-list-item-title class="font-weight-medium text-body-2 ms-2">
                    {{ t(item.titleKey) }}
                  </v-list-item-title>
                </v-list-item>
              </template>

            </template>
          </v-list>

        </v-sheet>
      </div>
    </v-navigation-drawer>

    <v-main class="bg-background">
      <v-container fluid class="app-page px-4 px-sm-6 px-md-8 pb-8">
        <slot />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
import { navigationItems } from "@/config/navigation";

const { t } = useAppLocale()
const { canAccessPermission } = usePermissions()
const route = useRoute()

const isRail = useState('sidebar-rail', () => true)
const openedGroups = ref([])

function canAccess(item) {
  if (!item?.permission) return true
  const keys = Array.isArray(item.permission) ? item.permission : [item.permission]
  return canAccessPermission(...keys)
}

const visibleNavigationItems = computed(() => {
  const items = []

  for (const item of navigationItems) {
    if (item.type === 'divider') {
      items.push(item)
      continue
    }

    if (item.children) {
      const children = item.children.filter(canAccess)
      if (!children.length) continue
      items.push({ ...item, children })
      continue
    }

    if (!canAccess(item)) continue
    items.push(item)
  }

  return items.filter((item, index, list) => {
    if (item.type !== 'divider') return true
    const prev = list[index - 1]
    const next = list[index + 1]
    return prev && next && prev.type !== 'divider' && next.type !== 'divider'
  })
})

function expandDrawer() {
  if (isRail.value) {
    isRail.value = false
  }
}

function onDocumentClick(event) {
  if (isRail.value) return

  const target = event.target
  if (target.closest('.app-layout .v-navigation-drawer') || target.closest('.rail-popout')) {
    return
  }

  isRail.value = true
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})

function isActive(item) {
  if (item.to) {
    if (item.to === '/') return route.path === '/'
    return route.path.startsWith(item.to)
  }
  if (item.children) {
    return item.children.some(child => isActive(child))
  }
  return false
}
</script>

<style scoped>
.app-page {
  width: 95%;
  max-width: 100%;
  margin-inline: auto;
}

.sidebar-container {
  height: 100%;
  min-height: 100%;
  padding-block: 16px;
  padding-inline: 16px 0;
  box-sizing: border-box;
}

.floating-sidebar {
  height: 100%;
  min-height: 0;
  border-radius: 24px !important;
  box-shadow: 0 8px 32px rgba(var(--v-theme-on-surface), 0.04) !important;
  overflow: hidden;
}

.sidebar-brand-list {
  flex: none;
}

.sidebar-brand-list {
  min-height: 48px;
}

.sidebar-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sidebar-list::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.sidebar-divider {
  opacity: 0.12;
}

.v-theme--dark .floating-sidebar {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
}

/* Brand Item */
.brand-item {
  padding-inline: 4px !important;
  min-height: 48px;
}

.brand-icon-wrapper {
  width: 40px;
  height: 40px;
}

/* Nav Items */
.nav-item {
  border-radius: 16px !important;
  min-height: 48px !important;
  padding-inline: 4px !important;
  transition: all 0.2s ease;
}

.nav-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

/* Active State */
.nav-item.is-active-parent {
  background-color: transparent !important;
}

.nav-item.is-active-parent .nav-icon-wrapper {
  background-color: rgb(var(--v-theme-primary)) !important;
}

.nav-item.is-active-parent .nav-icon {
  color: rgb(var(--v-theme-on-primary)) !important;
}

.nav-item.is-active-parent .v-list-item-title {
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 700 !important;
}

/* Inactive State */
.nav-item:not(.is-active-parent) .nav-icon {
  color: rgba(var(--v-theme-on-surface), 0.4) !important;
}

.nav-item:not(.is-active-parent) .v-list-item-title {
  color: rgba(var(--v-theme-on-surface), 0.6) !important;
}

.nav-item:not(.is-active-parent):hover .nav-icon-wrapper {
  background-color: rgba(var(--v-theme-on-surface), 0.04) !important;
}

.nav-item:not(.is-active-parent):hover .nav-icon {
  color: rgb(var(--v-theme-on-surface)) !important;
}

/* Expanded Children */
.sidebar-list :deep(.v-list-group__header__append-icon) {
  color: rgba(var(--v-theme-on-surface), 0.4);
}
.sidebar-list :deep(.v-list-group--open .v-list-group__header__append-icon) {
  color: rgb(var(--v-theme-primary));
}

.nav-item-child {
  min-height: 40px !important;
  padding-inline-start: 44px !important;
  color: rgba(var(--v-theme-on-surface), 0.7) !important;
  border-radius: 8px !important;
  margin-inline: 8px;
}

.nav-item-child.v-list-item--active {
  color: rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
}

/* Rail Popout */
:deep(.rail-popout) {
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background-color: rgb(var(--v-theme-surface));
}

.v-theme--dark :deep(.rail-popout) {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.popout-header {
  background-color: #31364a;
}

.v-theme--dark .popout-header {
  background-color: rgb(var(--v-theme-surface-bright));
}

.popout-body {
  background-color: rgb(var(--v-theme-surface));
}

.popout-child-item {
  min-height: 40px !important;
  color: rgba(var(--v-theme-on-surface), 0.7) !important;
}

.popout-child-item.v-list-item--active {
  color: rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
}

.popout-child-item:hover {
  color: rgb(var(--v-theme-on-surface)) !important;
  background-color: rgba(var(--v-theme-on-surface), 0.04) !important;
}
</style>
