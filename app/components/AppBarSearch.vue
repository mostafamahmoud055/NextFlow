<template>
  <div class="app-bar-search">
    <v-sheet
      color="surface"
      rounded="pill"
      class="app-bar-search__field d-flex align-center px-2"
      elevation="0"
      border
    >
      <v-text-field
        v-model="model"
        class="app-bar-search__input"
        :placeholder="t('common.search')"
        prepend-inner-icon="mdi-magnify"
        variant="plain"
        density="compact"
        hide-details
        single-line
        :aria-label="t('common.search')"
      />
    </v-sheet>
  </div>
</template>

<script setup>
const { t } = useAppLocale()

const model = defineModel({ type: String, default: '' })
</script>

<style scoped>
.app-bar-search {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-width: 0;
  height: 44px;
}

.app-bar-search__field {
  width: 100%;
  max-width: 28rem;
  min-height: 44px;
}

.app-bar-search__input {
  width: 100%;
}

.app-bar-search__input :deep(.v-field) {
  padding-inline: 0;
}

.app-bar-search__input :deep(.v-field__input) {
  min-height: 40px;
  padding-block: 0;
  font-size: 0.875rem;
}

.app-bar-search__input :deep(.v-field__prepend-inner) {
  padding-inline-end: 8px;
}
</style>
