<template>
  <div>
    <p class="text-body-1 mb-4">{{ t('setup.finishMessage') }}</p>

    <v-btn color="primary" size="large" :loading="saving" class="text-none" @click="$emit('finish')">
      {{ t('setup.goLive') }}
    </v-btn>
  </div>
</template>

<script setup>
defineProps({
  saving: { type: Boolean, default: false },
});

defineEmits(["finish"]);

const { t } = useAppLocale();
</script>
