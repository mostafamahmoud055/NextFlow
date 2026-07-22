<template>
  <div>
    <template v-for="node in nodes" :key="node.id">
      <v-list-item
        :style="{ paddingInlineStart: `${12 + depth * 20}px` }"
        class="department-tree-item"
      >
        <template #prepend>
          <v-icon size="20" class="me-2">
            {{ hasChildren(node) ? 'mdi-folder-outline' : 'mdi-circle-small' }}
          </v-icon>
        </template>

        <v-list-item-title class="d-flex align-center flex-wrap ga-2">
          <span class="font-weight-medium">{{ displayName(node) }}</span>
          <span class="text-caption text-medium-emphasis">
            {{ node.department_code }}
          </span>
          <v-chip
            size="x-small"
            :color="isActive(node) ? 'success' : 'secondary'"
            variant="tonal"
          >
            {{
              isActive(node)
                ? t('department.statusActive')
                : t('department.statusInactive')
            }}
          </v-chip>
        </v-list-item-title>

        <template #append>
          <v-menu location="bottom end">
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                icon
                variant="text"
                size="small"
                :aria-label="t('department.actions')"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list density="compact" min-width="200">
              <v-list-item
                v-if="canUpdate && canAccessBranch(node.branch_id)"
                prepend-icon="mdi-pencil-outline"
                :title="t('buttons.edit')"
                :disabled="actionLoading"
                @click="emit('edit', node)"
              />
              <v-list-item
                v-if="canAssignEmployees && canAccessBranch(node.branch_id)"
                prepend-icon="mdi-account-multiple-outline"
                :title="t('department.assignEmployees')"
                :disabled="actionLoading || !isActive(node)"
                @click="emit('assign-employees', node)"
              />
              <v-list-item
                v-if="canActivate && canAccessBranch(node.branch_id) && !isActive(node)"
                prepend-icon="mdi-check-circle-outline"
                :title="t('department.activate')"
                :disabled="actionLoading"
                @click="emit('activate', node)"
              />
              <v-list-item
                v-if="canDeactivate && canAccessBranch(node.branch_id) && isActive(node)"
                prepend-icon="mdi-cancel"
                :title="t('department.deactivate')"
                :disabled="actionLoading"
                @click="emit('deactivate', node)"
              />
              <v-list-item
                v-if="canDelete && canAccessBranch(node.branch_id)"
                prepend-icon="mdi-delete-outline"
                :title="t('buttons.delete')"
                class="text-error"
                :disabled="actionLoading"
                @click="emit('delete', node)"
              />
            </v-list>
          </v-menu>
        </template>
      </v-list-item>

      <DepartmentTreeNodes
        v-if="hasChildren(node)"
        :nodes="node.children"
        :depth="depth + 1"
        :can-update="canUpdate"
        :can-assign-employees="canAssignEmployees"
        :can-activate="canActivate"
        :can-deactivate="canDeactivate"
        :can-delete="canDelete"
        :action-loading="actionLoading"
        @edit="emit('edit', $event)"
        @assign-employees="emit('assign-employees', $event)"
        @activate="emit('activate', $event)"
        @deactivate="emit('deactivate', $event)"
        @delete="emit('delete', $event)"
      />
    </template>
  </div>
</template>

<script setup>
import { departmentDisplayName } from "~/utils/departmentConstants";
import { enumValue } from "~/utils/enumValue";

defineOptions({ name: "DepartmentTreeNodes" });

defineProps({
  nodes: { type: Array, default: () => [] },
  depth: { type: Number, default: 0 },
  canUpdate: { type: Boolean, default: false },
  canAssignEmployees: { type: Boolean, default: false },
  canActivate: { type: Boolean, default: false },
  canDeactivate: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  actionLoading: { type: Boolean, default: false },
});

const emit = defineEmits([
  "edit",
  "assign-employees",
  "activate",
  "deactivate",
  "delete",
]);

const { t, locale } = useAppLocale();
const { canAccessBranch } = usePermissions();

function displayName(node) {
  return departmentDisplayName(node, locale.value);
}

function isActive(node) {
  return enumValue(node.status) === "active";
}

function hasChildren(node) {
  return Array.isArray(node.children) && node.children.length > 0;
}
</script>
