<template>
  <v-snackbar
    v-model="snackbar"
    :timeout="timeout"
    location="top"
    position="fixed"
    variant="tonal"
    rounded="xl"
    class="global-snackbar"
    :class="`global-snackbar--${color}`"
  >
    <template #prepend>
      <div class="global-snackbar__icon">
        <v-icon :icon="icon" size="18" />
      </div>
    </template>

    <div class="global-snackbar__content">
      <div class="global-snackbar__text">
        {{ text }}
      </div>
    </div>

    <template #actions>
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        color="medium-emphasis"
        @click="snackbar = false"
      />
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSnackbar } from '../composables/useSnackbar.ts'

const { snackbar, text, color, timeout } = useSnackbar()

const icon = computed(() => (color.value === 'error' ? 'mdi-alert-circle-outline' : 'mdi-check-circle-outline'))
</script>

<style scoped>
.global-snackbar {
  margin-top: 14px;
  margin-inline: 12px;
  max-width: 820px;
  width: min(820px, calc(100vw - 24px));
  left: 50%;
  transform: translateX(-50%);
}

.global-snackbar :deep(.v-snackbar__wrapper) {
  border-radius: 16px !important;
  padding-inline: 10px !important;
  padding-block: 10px !important;
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 86%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.global-snackbar__icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.global-snackbar__content {
  display: flex;
  align-items: center;
  min-width: 0;
}

.global-snackbar__text {
  font-size: 0.9375rem;
  line-height: 1.35;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: rgb(var(--v-theme-on-surface));
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.global-snackbar--success :deep(.v-snackbar__wrapper) {
  border-color: rgba(var(--v-theme-success), 0.18);
}

.global-snackbar--success .global-snackbar__icon {
  background: rgba(var(--v-theme-success), 0.12);
  color: rgb(var(--v-theme-success));
}

.global-snackbar--error :deep(.v-snackbar__wrapper) {
  border-color: rgba(var(--v-theme-error), 0.18);
}

.global-snackbar--error .global-snackbar__icon {
  background: rgba(var(--v-theme-error), 0.12);
  color: rgb(var(--v-theme-error));
}

@media (max-width: 480px) {
  .global-snackbar {
    margin-top: 10px;
    margin-inline: 10px;
    width: calc(100vw - 20px);
  }

  .global-snackbar__text {
    font-size: 0.9rem;
  }
}
</style>
