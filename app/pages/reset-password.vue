<template>
  <AuthCard>
    <AuthHeader
      :title="t('auth.resetPasswordTitle')"
      :subtitle="t('auth.resetPasswordSubtitle')"
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
        v-model="form.otp"
        :label="t('auth.otp')"
        type="text"
        inputmode="numeric"
        maxlength="6"
        prepend-icon="mdi-shield-key-outline"
        :error-message="errors.otp"
        class="animate mt-2"
        style="--delay: 1"
        @update:model-value="onOtpInput"
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
        :loading="loading"
        class="animate text-none mt-4"
        style="--delay: 5"
      >
        {{ t('auth.resetPassword') }}
      </v-btn>
    </v-form>

    <p
      class="text-center text-body-2 text-medium-emphasis mt-8 mb-0 animate auth-footer-text"
      style="--delay: 6"
    >
      <NuxtLink to="/signin" class="auth-link">{{ t('auth.backToSignIn') }}</NuxtLink>
    </p>
  </AuthCard>
</template>

<script setup>
import {
  hasErrors,
  validateResetPasswordForm,
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
const route = useRoute();
const authStore = useAuthStore();

const isDev = import.meta.dev;

const form = reactive({
  email: String(route.query.email || ""),
  otp: "",
  password: "",
  password_confirmation: "",
});

const errors = ref({});
const loading = ref(false);

function onOtpInput(value) {
  form.otp = String(value || "").replace(/\D/g, "").slice(0, 6);
}

async function handleSubmit() {
  errors.value = validateResetPasswordForm(form);
  if (hasErrors(errors.value)) return;

  loading.value = true;

  const result = await authStore.resetPassword({
    email: form.email,
    otp: form.otp,
    password: form.password,
    password_confirmation: form.password_confirmation,
  });

  loading.value = false;

  if (result.error) return;

  await navigateTo("/signin");
}
</script>
