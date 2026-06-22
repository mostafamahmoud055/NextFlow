<template>
  <div>
    <div class="d-flex align-center my-6 auth-social-divider">
      <v-divider />
      <span class="text-caption text-medium-emphasis mx-4 text-no-wrap">{{ t('common.orContinueWith') }}</span>
      <v-divider />
    </div>
    <v-btn
      block
      variant="outlined"
      rounded="pill"
      size="large"
      class="auth-social-btn"
      @click="emit('google')"
    >
      <v-icon start size="20">mdi-google</v-icon>
      {{ googleLabel }}
    </v-btn>
  </div>
</template>

<script setup>
const props = defineProps({
  mode: {
    type: String,
    default: 'signin',
  },
})

const emit = defineEmits(['google'])

const { t } = useAppLocale()

const googleLabel = computed(() =>
  props.mode === 'signin' ? t('auth.signInWithGoogle') : t('auth.signUpWithGoogle'),
)
</script>
