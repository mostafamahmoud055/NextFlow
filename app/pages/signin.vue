<template>
  <AuthCard>
    <AuthHeader
      :title="t('auth.signInTitle')"
      :subtitle="t('auth.signInSubtitle')"
    />

    <v-form
      ref="formRef"
      v-model="isValid"
      @submit.prevent="handleSubmit"
    >
      <AuthInput
        v-model="email"
        :label="t('auth.email')"
        type="email"
        prepend-icon="mdi-email-outline"
        :rules="emailRules"
        class="animate"
        style="--delay: 0"
      />

      <AuthInput
        v-model="password"
        :label="t('auth.password')"
        prepend-icon="mdi-lock-outline"
        :rules="passwordRules"
        show-password-toggle
        class="animate"
        style="--delay: 1"
      />

      <div
        class="d-flex justify-end mb-4 mb-md-6 mt-2 animate auth-forgot-link"
        style="--delay: 2"
      >
        <a href="#" class="text-caption text-medium-emphasis text-decoration-none">
          {{ t('auth.forgotPassword') }}
        </a>
      </div>

      <v-btn
        type="submit"
        block
        size="large"
        color="primary"
        rounded="pill"
        :loading="loading"
        :disabled="!isValid"
        class="animate text-none"
        style="--delay: 3"
      >
        {{ t('auth.signIn') }}
      </v-btn>
    </v-form>

    <AuthSocialButtons
      mode="signin"
      class="animate"
      style="--delay: 4"
      @google="handleSocial"
    />

    <p
      class="text-center text-body-2 text-medium-emphasis mt-8 mb-0 animate auth-footer-text"
      style="--delay: 5"
    >
      {{ t('auth.noAccount') }}
      <NuxtLink to="/signup" class="auth-link ms-1">{{ t('auth.signUp') }}</NuxtLink>
    </p>
  </AuthCard>
</template>

<script setup>
definePageMeta({
  layout: 'blank',
  pageTransition: {
    name: 'auth-slide',
    mode: 'out-in',
  },
})

const { t } = useAppLocale()
const { emailRules, passwordRules } = useAuthRules()

const formRef = ref(null)
const isValid = ref(false)
const loading = ref(false)
const email = ref('')
const password = ref('')

async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 1200))
  loading.value = false
}

function handleSocial() {
  console.log('Sign in with Google')
}
</script>
