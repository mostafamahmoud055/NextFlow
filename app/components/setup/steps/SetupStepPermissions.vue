<template>
  <v-form @submit.prevent="submit">
    <v-alert
      v-if="listError(errors, 'roles').length"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-4"
    >
      {{ listError(errors, 'roles')[0] }}
    </v-alert>

    <div v-if="loading || permissionsLoading" class="d-flex justify-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-alert
      v-else-if="!form.roles.length"
      type="info"
      variant="tonal"
      density="compact"
      class="mb-4"
    >
      {{ t("setup.noRoles") }}
    </v-alert>

    <v-expansion-panels v-else v-model="openPanel" class="mb-4">
      <v-expansion-panel v-for="(role, index) in form.roles" :key="index">
        <v-expansion-panel-title>
          {{ roleTitle(index, role) }}
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-text-field
            v-model="role.name_en"
            :label="t('setup.nameEn')"
            :error-messages="itemError(errors, index, 'name_en')"
            class="mb-3"
          />
          <v-text-field
            v-model="role.name_ar"
            :label="t('setup.nameAr')"
            :error-messages="itemError(errors, index, 'name_ar')"
            class="mb-3"
          />

          <div
            v-for="group in permissionGroups"
            :key="group.module"
            class="mb-4"
          >
            <div class="text-subtitle-2 font-weight-medium mb-2">
              {{ groupLabel(group) }}
            </div>
            <v-checkbox
              v-for="permission in group.permissions"
              :key="permission.key"
              v-model="role.permissions"
              :label="permissionLabel(permission)"
              :value="permission.key"
              density="compact"
              hide-details
              class="ms-2"
            />
          </div>

          <v-alert
            v-if="itemError(errors, index, 'permissions').length"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-3"
          >
            {{ itemError(errors, index, 'permissions')[0] }}
          </v-alert>

          <v-btn
            v-if="form.roles.length > 1"
            variant="text"
            color="error"
            class="text-none px-0"
            @click="removeRole(index)"
          >
            {{ t("setup.remove") }}
          </v-btn>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div class="d-flex flex-wrap ga-2">
      <v-btn variant="outlined" class="text-none" @click="addRole">
        {{ t("setup.addRole") }}
      </v-btn>
      <v-btn type="submit" color="primary" :loading="saving" class="text-none">
        {{ t("setup.saveContinue") }}
      </v-btn>
    </div>
  </v-form>
</template>

<script setup>
import { itemError, listError } from "@/utils/setup/arrayFieldErrors";
import { hasErrors, validatePermissionsForm } from "@/utils/validation/SetupValidation";
import { createRole } from "@/utils/setup/setupDefaults";

const props = defineProps({
  draft: { type: Object, default: null },
  saving: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["save"]);
const { locale, t } = useAppLocale();
const { fetchApi } = useApi();

const errors = ref({});
const permissionGroups = ref([]);
const permissionsLoading = ref(false);
const openPanel = ref(0);

const form = reactive({
  roles: [createRole()],
});

function roleTitle(index, role) {
  const label = locale.value === "ar"
    ? (role.name_ar || role.name_en)
    : (role.name_en || role.name_ar);
  return label
    ? t("setup.permissionNumberNamed", { n: index + 1, name: label })
    : t("setup.permissionNumber", { n: index + 1 });
}

function groupLabel(group) {
  return locale.value === "ar" ? group.label_ar : group.label_en;
}

function permissionLabel(permission) {
  return locale.value === "ar" ? permission.label_ar : permission.label_en;
}

function applyDraft(draft) {
  if (Array.isArray(draft?.roles) && draft.roles.length) {
    form.roles = draft.roles.map((role) => ({
      ...createRole(),
      ...role,
      permissions: Array.isArray(role.permissions) ? [...role.permissions] : [],
    }));
    openPanel.value = 0;
    return;
  }

  form.roles = [createRole()];
  openPanel.value = 0;
}

async function loadPermissions() {
  permissionsLoading.value = true;
  const result = await fetchApi("/setup/permissions/options", {
    tenant: true,
    silent: true,
  });
  const data = result.data?.data ?? result.data ?? {};
  permissionGroups.value = Array.isArray(data.groups) ? data.groups : [];
  permissionsLoading.value = false;
}

watch(() => props.draft, applyDraft, { immediate: true });

onMounted(loadPermissions);

function submit() {
  errors.value = validatePermissionsForm(form.roles, t);
  if (hasErrors(errors.value)) return;

  const roles = form.roles.map((role) => ({
    id: role.id,
    role_code: role.role_code,
    name_en: role.name_en?.trim(),
    name_ar: role.name_ar?.trim(),
    permissions: Array.isArray(role.permissions) ? role.permissions : [],
  }));

  emit("save", { roles });
}

function addRole() {
  form.roles.push(createRole());
  openPanel.value = form.roles.length - 1;
}

function removeRole(index) {
  form.roles.splice(index, 1);
  if (openPanel.value === index) {
    openPanel.value = Math.max(0, index - 1);
  } else if (openPanel.value > index) {
    openPanel.value--;
  }
}
</script>
