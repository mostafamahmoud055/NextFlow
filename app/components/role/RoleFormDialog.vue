<template>
  <v-dialog
    :model-value="modelValue"
    max-width="760"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="role-form-card" rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between pa-6 pb-2">
        <span class="text-h6 font-weight-bold">
          {{ isEdit ? t('role.editTitle') : t('role.createTitle') }}
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
                :label="t('role.nameEn')"
                :error-messages="fieldErrors.name_en"
                :rules="[requiredRule]"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.name_ar"
                :label="t('role.nameAr')"
                :error-messages="fieldErrors.name_ar"
                :rules="[requiredRule]"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="form.approval_limit_min"
                :label="t('role.approvalLimitMin')"
                type="number"
                min="0"
                :error-messages="fieldErrors.approval_limit_min"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="form.approval_limit_max"
                :label="t('role.approvalLimitMax')"
                type="number"
                min="0"
                :error-messages="fieldErrors.approval_limit_max"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="form.auto_approval_limit"
                :label="t('role.autoApprovalLimit')"
                type="number"
                min="0"
                :error-messages="fieldErrors.auto_approval_limit"
                hide-details="auto"
              />
            </v-col>

            <v-col v-if="!isEdit" cols="12">
              <div class="text-subtitle-2 mb-2">{{ t('role.permissions') }}</div>
              <div
                v-if="fieldErrors.permissions?.length"
                class="text-error text-caption mb-2"
              >
                {{ fieldErrors.permissions[0] }}
              </div>
              <div v-if="permissionsLoading" class="d-flex justify-center py-4">
                <v-progress-circular indeterminate color="primary" size="28" />
              </div>
              <v-expansion-panels v-else variant="accordion" multiple>
                <v-expansion-panel
                  v-for="(perms, moduleKey) in permissionGroups"
                  :key="moduleKey"
                >
                  <v-expansion-panel-title>
                    {{ moduleLabel(moduleKey) }}
                    <template #actions>
                      <v-chip size="x-small" variant="tonal" class="me-2">
                        {{ selectedCount(perms) }}/{{ perms.length }}
                      </v-chip>
                    </template>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-checkbox
                      v-for="perm in perms"
                      :key="perm.id"
                      v-model="form.permissions"
                      :label="permissionLabel(perm)"
                      :value="perm.id"
                      density="compact"
                      hide-details
                    />
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
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
          {{ isEdit ? t('buttons.save') : t('role.create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { emptyRoleForm, roleToForm } from "~/utils/roleConstants";
import { permissionDisplayName } from "~/utils/permissionConstants";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  role: { type: Object, default: null },
  saving: { type: Boolean, default: false },
  permissionGroups: { type: Object, default: () => ({}) },
  permissionsLoading: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const { t, locale } = useAppLocale();

const formRef = ref(null);
const form = reactive(emptyRoleForm());
const fieldErrors = reactive({});

const isEdit = computed(() => Boolean(props.role?.id));

const requiredRule = (value) => {
  if (value == null || String(value).trim() === "") return t("forms.required");
  return true;
};

function permissionLabel(permission) {
  return permissionDisplayName(permission, locale.value);
}

function moduleLabel(value) {
  if (!value) return "—";
  const key = `permission.modules.${value}`;
  const translated = t(key);
  return translated === key ? value.replace(/_/g, " ") : translated;
}

function selectedCount(perms) {
  const ids = new Set(form.permissions);
  return perms.filter((p) => ids.has(p.id)).length;
}

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
  Object.assign(form, props.role ? roleToForm(props.role) : emptyRoleForm());
}

function close() {
  emit("update:modelValue", false);
}

function cleanPayload(payload) {
  const cleaned = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (typeof value === "string" && value.trim() === "") return;
    if (Array.isArray(value) && !value.length && key !== "permissions") return;
    cleaned[key] = typeof value === "string" ? value.trim() : value;
  });
  return cleaned;
}

async function submit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  if (!isEdit.value && !form.permissions.length) {
    fieldErrors.permissions = [t("forms.required")];
    return;
  }

  const payload = {
    ...form,
    name: (form.name_en || form.name_ar || "").trim(),
  };

  if (isEdit.value) {
    delete payload.permissions;
    delete payload.is_active;
  }

  emit("submit", {
    payload: cleanPayload(payload),
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
.role-form-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
</style>
