<template>
  <v-form @submit.prevent="submit">
    <v-alert
      v-if="listError(errors, 'users').length"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-4"
    >
      {{ listError(errors, 'users')[0] }}
    </v-alert>

    <v-expansion-panels v-model="openPanel" multiple class="mb-4">
      <v-expansion-panel
        v-for="(user, index) in form.users"
        :key="index"
      >
        <v-expansion-panel-title>
          {{ panelTitle(index, user) }}
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <v-text-field
            v-model="user.name"
            :label="t('auth.fullName')"
            :error-messages="itemError(errors, index, 'name')"
            class="mb-2"
          />
          <v-text-field
            v-model="user.email"
            :label="t('auth.email')"
            type="email"
            :error-messages="itemError(errors, index, 'email')"
            class="mb-2"
          />
          <v-text-field
            v-model="user.password"
            :label="t('auth.password')"
            :type="showPassword[index] ? 'text' : 'password'"
            :error-messages="itemError(errors, index, 'password')"
            :append-inner-icon="showPassword[index] ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            class="mb-2"
            @click:append-inner="togglePassword(index)"
          />

          <v-skeleton-loader v-if="rolesLoading" type="list-item" class="mb-2" />

          <v-select
            v-else
            v-model="user.roles"
            :items="localizedRoles"
            :label="t('setup.roles')"
            :error-messages="itemError(errors, index, 'roles')"
            item-title="display_name"
            item-value="id"
            multiple
            chips
            closable-chips
            class="mb-2"
          />

          <v-btn
            v-if="form.users.length > 1"
            variant="text"
            color="error"
            class="text-none px-0"
            @click="removeUser(index)"
          >
            {{ t('setup.remove') }}
          </v-btn>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div class="d-flex flex-wrap ga-2">
      <v-btn variant="outlined" class="text-none" @click="addUser">
        {{ t('setup.addMore') }}
      </v-btn>
      <v-btn type="submit" color="primary" :loading="saving" class="text-none">
        {{ t('setup.saveContinue') }}
      </v-btn>
    </div>
  </v-form>
</template>

<script setup>
import { itemError, listError } from "@/utils/setup/arrayFieldErrors";
import { createUser } from "@/utils/setup/setupDefaults";
import {
  hasErrors,
  validateUsersForm,
} from "@/utils/validation/SetupValidation";

const props = defineProps({
  draft: { type: Object, default: null },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(["save"]);
const { locale, t } = useAppLocale();
const auth = useAuthStore();
const { fetchApi } = useApi();

const errors = ref({});
const openPanel = ref([0]);
const roles = ref([]);
const rolesLoading = ref(false);
const showPassword = ref({});

const localizedRoles = computed(() =>
  roles.value.map((role) => ({
    ...role,
    display_name: locale.value === "ar"
      ? (role.name_ar || role.name)
      : (role.name_en || role.name),
  })),
);

const form = reactive({
  users: [createUser()],
});

function panelTitle(index, user) {
  const label = user.name || user.email;

  return label
    ? t("setup.userNumberNamed", { n: index + 1, name: label })
    : t("setup.userNumber", { n: index + 1 });
}

function unwrapList(payload) {
  const data = payload?.data ?? payload ?? {};
  const items = data?.items ?? data;

  return Array.isArray(items) ? items : [];
}

async function loadRoles() {
  rolesLoading.value = true;

  const result = await fetchApi("/roles", { silent: true });
  roles.value = unwrapList(result.data);

  rolesLoading.value = false;
}

function applyDraft(draft) {
  if (Array.isArray(draft?.users) && draft.users.length) {
    form.users = draft.users.map((user) => ({
      ...createUser(),
      ...user,
      roles: Array.isArray(user.roles) ? [...user.roles] : [],
    }));
    openPanel.value = form.users.map((_, index) => index);
    return;
  }

  form.users = [createUser()];
  openPanel.value = [0];
}

watch(() => props.draft, applyDraft, { immediate: true });

onMounted(async () => {
  if (!form.users[0]?.email) {
    form.users[0].email = "";
    form.users[0].name = "";
  }

  await loadRoles();
});

function togglePassword(index) {
  showPassword.value[index] = !showPassword.value[index];
}

function addUser() {
  form.users.push(createUser());
  openPanel.value = [...openPanel.value, form.users.length - 1];
}

function removeUser(index) {
  form.users.splice(index, 1);
  openPanel.value = form.users.map((_, itemIndex) => itemIndex);
}

function submit() {
  errors.value = validateUsersForm(form.users, t);
  if (hasErrors(errors.value)) return;

  emit("save", {
    users: form.users.map((user) => ({
      ...user,
      roles: [...(user.roles ?? [])],
    })),
  });
}
</script>
