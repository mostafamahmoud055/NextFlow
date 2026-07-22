<template>
  <v-dialog
    :model-value="modelValue"
    max-width="640"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="user-form-card" rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
        <span class="text-h6 font-weight-bold">
          {{ isEdit ? t('user.editTitle') : t('user.createTitle') }}
        </span>
        <v-btn
          icon
          variant="text"
          size="small"
          :aria-label="t('buttons.cancel')"
          @click="close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-6 pt-2">
        <v-form ref="formRef" @submit.prevent="submit">
          <v-row density="comfortable">
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.name_en"
                :label="t('user.nameEn')"
                :error-messages="fieldErrors.name_en"
                :rules="[requiredRule]"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.name_ar"
                :label="t('user.nameAr')"
                :error-messages="fieldErrors.name_ar"
                :rules="[requiredRule]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.email"
                :label="t('user.email')"
                type="email"
                :error-messages="fieldErrors.email"
                :rules="[requiredRule]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.mobile"
                :label="t('user.mobile')"
                :error-messages="fieldErrors.mobile"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.password_expires_at"
                :label="t('user.passwordExpiry')"
                type="date"
                :error-messages="fieldErrors.password_expires_at"
                hide-details="auto"
              />
            </v-col>

            <v-col v-if="!isEdit" cols="12">
              <v-text-field
                v-model="form.password"
                :label="t('user.password')"
                type="password"
                autocomplete="new-password"
                :error-messages="fieldErrors.password"
                :rules="[requiredRule]"
                hide-details="auto"
              />
            </v-col>

            <v-col v-if="!isEdit" cols="12" sm="6">
              <v-select
                v-model="form.status"
                :items="statusItems"
                item-title="title"
                item-value="value"
                :label="t('user.status')"
                :error-messages="fieldErrors.status"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>

            <v-col v-if="!isEdit" cols="12" sm="6">
              <v-select
                v-model="form.login_status"
                :items="loginStatusItems"
                item-title="title"
                item-value="value"
                :label="t('user.loginStatus')"
                :error-messages="fieldErrors.login_status"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>

            <v-col v-if="!isEdit" cols="12">
              <v-select
                v-model="form.roles"
                :items="roleItems"
                item-title="title"
                item-value="value"
                :label="t('user.roles')"
                :error-messages="fieldErrors.roles"
                :loading="rolesLoading"
                :rules="[rolesRule]"
                multiple
                chips
                closable-chips
                variant="outlined"
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn variant="text" class="text-none" @click="close">
          {{ t('buttons.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          class="text-none"
          :loading="saving"
          @click="submit"
        >
          {{ isEdit ? t('buttons.save') : t('user.create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {
  USER_LOGIN_STATUSES,
  USER_STATUSES,
  emptyUserForm,
  userToForm,
} from "~/utils/userConstants";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  user: { type: Object, default: null },
  saving: { type: Boolean, default: false },
  roleOptions: { type: Array, default: () => [] },
  rolesLoading: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const { t } = useAppLocale();

const formRef = ref(null);
const form = reactive(emptyUserForm());
const fieldErrors = reactive({});

const isEdit = computed(() => Boolean(props.user?.id));

const statusItems = computed(() =>
  USER_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const loginStatusItems = computed(() =>
  USER_LOGIN_STATUSES.map((item) => ({
    value: item.value,
    title: t(item.labelKey),
  })),
);

const roleItems = computed(() =>
  props.roleOptions.map((role) => ({
    value: role.id,
    title: role.name || role.code,
  })),
);

const requiredRule = (value) => {
  if (value == null || String(value).trim() === "") return t("forms.required");
  return true;
};

const rolesRule = (value) => {
  if (!isEdit.value && (!Array.isArray(value) || !value.length)) {
    return t("forms.required");
  }
  return true;
};

function resetErrors() {
  Object.keys(fieldErrors).forEach((key) => delete fieldErrors[key]);
}

function applyServerErrors(errors) {
  resetErrors();
  if (!errors || typeof errors !== "object") return;
  Object.entries(errors).forEach(([key, value]) => {
    fieldErrors[key] = Array.isArray(value) ? value : [String(value)];
  });
}

function hydrate() {
  resetErrors();
  Object.assign(form, props.user ? userToForm(props.user) : emptyUserForm());
}

function close() {
  emit("update:modelValue", false);
}

function cleanPayload(payload) {
  const cleaned = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (typeof value === "string" && value.trim() === "") return;
    cleaned[key] = typeof value === "string" ? value.trim() : value;
  });
  return cleaned;
}

async function submit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  const payload = isEdit.value
    ? {
        name_en: form.name_en,
        name_ar: form.name_ar,
        email: form.email,
        mobile: form.mobile?.trim() || null,
        password_expires_at: form.password_expires_at || null,
      }
    : { ...form };

  emit("submit", {
    payload: isEdit.value ? payload : cleanPayload(payload),
    applyServerErrors,
  });
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) hydrate();
  },
);

defineExpose({ applyServerErrors });
</script>

<style scoped>
.user-form-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
</style>
