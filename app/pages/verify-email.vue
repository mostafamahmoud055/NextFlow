<template>
  <AuthCard>
    <AuthHeader
      :title="t('auth.verifyEmailTitle')"
      :subtitle="t('auth.verifyEmailSubtitle')"
    />

    <v-btn
      v-if="!otpSent && !sending"
      block
      size="large"
      color="primary"
      rounded="pill"
      :loading="sending"
      class="animate text-none mb-4"
      style="--delay: 0"
      @click="handleSendOtp"
    >
      {{ t('auth.sendOtp') }}
    </v-btn>

    <v-progress-linear
      v-else-if="sending && !otpSent"
      indeterminate
      color="primary"
      class="animate mb-4"
      style="--delay: 0"
    />

    <v-form @submit.prevent="handleVerify">
      <AuthInput
        v-model="form.otp"
        :label="t('auth.otp')"
        type="text"
        inputmode="numeric"
        maxlength="6"
        prepend-icon="mdi-shield-key-outline"
        :error-message="errors.otp"
        class="animate"
        :style="{ '--delay': otpSent ? 0 : 1 }"
        @update:model-value="onOtpInput"
      />

      <v-btn
        type="submit"
        block
        size="large"
        color="primary"
        rounded="pill"
        :loading="verifying"
        :disabled="form.otp.length !== 6"
        class="animate text-none"
        :style="{ '--delay': otpSent ? 2 : 3 }"
      >
        {{ t('auth.verifyOtp') }}
      </v-btn>

      <v-btn
        v-if="otpSent"
        block
        size="large"
        variant="text"
        color="primary"
        rounded="pill"
        :loading="sending"
        :disabled="cooldown > 0"
        class="animate text-none mt-2"
        style="--delay: 3"
        @click="handleSendOtp"
      >
        {{ cooldown > 0 ? t('auth.resendIn', { seconds: cooldown }) : t('auth.resendOtp') }}
      </v-btn>
    </v-form>

    <p
      class="text-center text-body-2 text-medium-emphasis mt-8 mb-0 animate auth-footer-text"
      style="--delay: 4"
    >
      <a
        href="#"
        class="auth-link"
        :class="{ 'pe-none opacity-60': loggingOut }"
        @click.prevent="handleLogout"
      >
        {{ t('auth.logout') }}
      </a>
    </p>
  </AuthCard>
</template>

<script setup>
import {
  hasErrors,
  validateVerifyOtpForm,
} from "@/utils/validation/OtpValidation";

definePageMeta({
  layout: "blank",
  middleware: ["auth", "verified"],
  pageTransition: {
    name: "auth-slide",
    mode: "out-in",
  },
});

const { t } = useAppLocale();
const authStore = useAuthStore();


// await authStore.initAuth();




const form = reactive({ otp: "" });
const errors = ref({});
const sending = ref(false);
const verifying = ref(false);
const otpSent = ref(false);
const cooldown = ref(0);
const loggingOut = ref(false);

let cooldownTimer = null;

function startCooldown() {
  cooldown.value = 60;
  clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    cooldown.value -= 1;
    if (cooldown.value <= 0) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
  }, 1000);
}

function onOtpInput(value) {
  form.otp = String(value || "").replace(/\D/g, "").slice(0, 6);
}

async function handleSendOtp() {
  if (cooldown.value > 0 || sending.value) return;

  sending.value = true;

  const result = await authStore.sendEmailOtp();

  sending.value = false;

  if (result.error) return;

  otpSent.value = true;
  startCooldown();
}


async function handleVerify() {
  errors.value = validateVerifyOtpForm(form);
  if (hasErrors(errors.value)) return;

  verifying.value = true;

  const result = await authStore.verifyEmailOtp(form.otp);

  if (result.error) {
    verifying.value = false;
    return;
  }


  verifying.value = false;

  await navigateTo("/");
}

async function handleLogout() {
  if (loggingOut.value) return;

  loggingOut.value = true;

  try {
    await authStore.logout();
    await navigateTo("/signin");
  } finally {
    loggingOut.value = false;
  }
}

onMounted(() => {
  handleSendOtp();
});

onUnmounted(() => {
  clearInterval(cooldownTimer);
});
</script>
