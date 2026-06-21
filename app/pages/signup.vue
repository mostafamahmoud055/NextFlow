<template>
  <AuthCard>
    <AuthHeader
      :title="t('auth.signUpTitle')"
      :subtitle="t('auth.signUpSubtitle')"
    />

    <v-form
      ref="formRef"
      v-model="isValid"
      @submit.prevent="handleSubmit"
    >
      <AuthInput
        v-model="name"
        :label="t('auth.fullName')"
        prepend-icon="mdi-account-outline"
        :rules="nameRules"
        class="auth-animate"
        style="--delay: 0"
      />

      <AuthInput
        v-model="email"
        :label="t('auth.email')"
        type="email"
        prepend-icon="mdi-email-outline"
        :rules="emailRules"
        class="auth-animate"
        style="--delay: 1"
      />

      <AuthInput
        v-model="password"
        :label="t('auth.password')"
        prepend-icon="mdi-lock-outline"
        :rules="passwordRules"
        show-password-toggle
        class="auth-animate"
        style="--delay: 2"
      />

      <AuthInput
        v-model="confirmPassword"
        :label="t('auth.confirmPassword')"
        prepend-icon="mdi-lock-check-outline"
        :rules="confirmPasswordRules"
        show-password-toggle
        class="auth-animate"
        style="--delay: 3"
      />

      <v-btn
        type="submit"
        block
        size="large"
        color="primary"
        rounded="pill"
        :loading="loading"
        :disabled="!isValid"
        class="auth-animate text-none mt-4"
        style="--delay: 4"
      >
        {{ t('auth.createAccount') }}
      </v-btn>
    </v-form>

    <AuthSocialButtons
      mode="signup"
      class="auth-animate"
      style="--delay: 5"
      @google="handleSocial"
    />

    <p
      class="text-center text-body-2 text-medium-emphasis mt-8 mb-0 auth-animate"
      style="--delay: 6"
    >
      {{ t('auth.hasAccount') }}
      <NuxtLink to="/login" class="auth-link ms-1">{{ t('auth.signIn') }}</NuxtLink>
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
const { emailRules, passwordRules, nameRules, createConfirmPasswordRules } = useAuthRules()

const formRef = ref(null)
const isValid = ref(false)
const loading = ref(false)
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const confirmPasswordRules = createConfirmPasswordRules(() => password.value)

async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 1200))
  loading.value = false
}

function handleSocial() {
  console.log('Sign up with Google')
}
</script>
