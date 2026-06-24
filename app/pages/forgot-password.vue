<template>
  <AuthCard>
    <AuthHeader
      :title="t('auth.forgotPasswordTitle')"
      :subtitle="t('auth.forgotPasswordSubtitle')"
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

      <v-btn
        type="submit"
        block
        size="large"
        color="primary"
        rounded="pill"
        :loading="loading"
        class="animate text-none mt-4"
        style="--delay: 1"
      >
        {{ t('auth.sendOtp') }}
      </v-btn>
    </v-form>
    
    <p
      class="text-center text-body-2 text-medium-emphasis mt-8 mb-0 animate auth-footer-text"
      style="--delay: 3"
    >
      <NuxtLink to="/signin" class="auth-link">{{ t('auth.backToSignIn') }}</NuxtLink>
    </p>
  </AuthCard>
</template>

<script setup>
import {
  hasErrors,
  validateForgotPasswordForm,
} from "@/utils/validation/OtpValidation";

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

const isDev = import.meta.dev;

const form = reactive({ email: "" });
const errors = ref({});
const loading = ref(false);

async function handleSubmit() {
  errors.value = validateForgotPasswordForm(form);
  if (hasErrors(errors.value)) return;

  loading.value = true;

  const result = await authStore.forgotPassword(form.email);

  loading.value = false;

  if (result.error) return;

  await navigateTo({
    path: "/reset-password",
    query: { email: form.email },
  });
}
</script>
