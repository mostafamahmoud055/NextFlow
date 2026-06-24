<template>
  <AuthCard>
    <AuthHeader
      :title="t('auth.signInTitle')"
      :subtitle="t('auth.signInSubtitle')"
    />

    <v-form @submit.prevent="handleSubmit">
      <AuthInput
        v-model="form.email"
        :label="t('auth.email')"
        type="email"
        prepend-icon="mdi-email-outline"
        :error-message="errors.email"
        class="animate"
        style="--delay: 0"
      />

      <AuthInput
        v-model="form.password"
        :label="t('auth.password')"
        prepend-icon="mdi-lock-outline"
        show-password-toggle
        :error-message="errors.password"
        class="animate mt-2"
        style="--delay: 1"
      />

      <div
        class="d-flex justify-end mb-4 mb-md-6 mt-2 animate auth-forgot-link"
        style="--delay: 2"
      >
        <NuxtLink
          to="/forgot-password"
          class="text-caption text-medium-emphasis text-decoration-none"
          :aria-label="t('auth.forgotPassword')"
        >
          {{ t('auth.forgotPassword') }}
        </NuxtLink>
      </div>

      <v-btn
        type="submit"
        block
        size="large"
        color="primary"
        rounded="pill"
        :loading="authStore.loading"
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
import {
  hasErrors,
  validateLoginForm,
} from "@/utils/validation/AuthValidation";

definePageMeta({
  layout: "blank",
  middleware: ["guest"],
  pageTransition: {
    name: "auth-slide",
    mode: "out-in",
  },
});

const { t } = useAppLocale();
const authStore = useAuthStore();

const form = reactive({
  email: "",
  password: "",
});

const errors = ref({});

async function handleSubmit() {
  errors.value = validateLoginForm(form);
  if (hasErrors(errors.value)) return;

  const result = await authStore.login({
    email: form.email,
    password: form.password,
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
