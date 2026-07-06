<template>
  <AuthCard>
    <AuthHeader
      :title="t('auth.signUpTitle')"
      :subtitle="t('auth.signUpSubtitle')"
    />

    <v-form @submit.prevent="handleSubmit">
      <AuthInput
        v-model="form.name"
        :label="t('auth.fullName')"
        prepend-icon="mdi-account-outline"
        :error-message="errors.name"
        class="animate"
        style="--delay: 0"
      />

      <AuthInput
        v-model="form.email"
        :label="t('auth.email')"
        type="email"
        prepend-icon="mdi-email-outline"
        :error-message="errors.email"
        class="animate mt-2"
        style="--delay: 1"
      />

      <AuthInput
        v-model="form.password"
        :label="t('auth.password')"
        prepend-icon="mdi-lock-outline"
        show-password-toggle
        :error-message="errors.password"
        class="animate mt-2"
        style="--delay: 2"
      />

      <AuthInput
        v-model="form.password_confirmation"
        :label="t('auth.confirmPassword')"
        prepend-icon="mdi-lock-check-outline"
        show-password-toggle
        :error-message="errors.password_confirmation"
        class="animate mt-2"
        style="--delay: 3"
      />

      <v-btn
        type="submit"
        block
        size="large"
        color="primary"
        rounded="pill"  
        :loading="authStore.loading"
        class="animate text-none mt-4"
        style="--delay: 4"
      >
        {{ t('auth.createAccount') }}
      </v-btn>
    </v-form>

    <AuthSocialButtons
      mode="signup"
      class="animate"
      style="--delay: 5"
      @google="handleSocial"
    />

    <p
      class="text-center text-body-2 text-medium-emphasis mt-8 mb-0 animate auth-footer-text"
      style="--delay: 6"
    >
      {{ t('auth.hasAccount') }}
      <NuxtLink to="/signin" class="auth-link ms-1">{{ t('auth.signIn') }}</NuxtLink>
    </p>
  </AuthCard>
</template>

<script setup>
import {
  hasErrors,
  validateRegisterForm,
} from "@/utils/validation/AuthValidation";

definePageMeta({
  layout: "blank",
  // middleware: () => {
  //   return navigateTo("/signin");
  // },
  middleware: ["auth"],
  pageTransition: {
    name: "auth-slide",
    mode: "out-in",
  },
});

const { t } = useAppLocale();
const authStore = useAuthStore();

const form = reactive({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
});

const errors = ref({});

async function handleSubmit() {
  errors.value = validateRegisterForm(form);
  if (hasErrors(errors.value)) return;

  const result = await authStore.register({
    name: form.name,
    email: form.email,
    password: form.password,
    password_confirmation: form.password_confirmation,
  });

  if (result.error) return;

  if (!authStore.user?.email_verified_at) {
    await navigateTo("/verify-email");
    return;
  }

  await navigateTo("/");
}

function handleSocial() {
  authStore.loginWithGoogle();
}
</script>
