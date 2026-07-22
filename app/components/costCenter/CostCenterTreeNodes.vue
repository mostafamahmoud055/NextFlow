<template>
  <div>
    <template v-for="node in nodes" :key="node.id">
      <v-list-item
        :style="{ paddingInlineStart: `${12 + depth * 20}px` }"
        class="cost-center-tree-item"
      >
        <template #prepend>
          <v-icon size="20" class="me-2">
            {{ hasChildren(node) ? 'mdi-folder-outline' : 'mdi-circle-small' }}
          </v-icon>
        </template>

        <v-list-item-title class="d-flex align-center flex-wrap ga-2">
          <span class="font-weight-medium">{{ displayName(node) }}</span>
          <span class="text-caption text-medium-emphasis">
            {{ node.cost_center_code }}
          </span>
          <v-chip
            size="x-small"
            :color="isActive(node) ? 'success' : 'secondary'"
            variant="tonal"
          >
            {{
              isActive(node)
                ? t('costCenter.statusActive')
                : t('costCenter.statusInactive')
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
                :aria-label="t('costCenter.actions')"
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
                v-if="canActivate && canAccessBranch(node.branch_id) && !isActive(node)"
                prepend-icon="mdi-check-circle-outline"
                :title="t('costCenter.activate')"
                :disabled="actionLoading"
                @click="emit('activate', node)"
              />
              <v-list-item
                v-if="canDeactivate && canAccessBranch(node.branch_id) && isActive(node)"
                prepend-icon="mdi-cancel"
                :title="t('costCenter.deactivate')"
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

      <CostCenterTreeNodes
        v-if="hasChildren(node)"
        :nodes="node.children"
        :depth="depth + 1"
        :can-update="canUpdate"
        :can-activate="canActivate"
        :can-deactivate="canDeactivate"
        :can-delete="canDelete"
        :action-loading="actionLoading"
        @edit="emit('edit', $event)"
        @activate="emit('activate', $event)"
        @deactivate="emit('deactivate', $event)"
        @delete="emit('delete', $event)"
      />
    </template>
  </div>
</template>

<script setup>
import { costCenterDisplayName } from "~/utils/costCenterConstants";
import { enumValue } from "~/utils/enumValue";

defineOptions({ name: "CostCenterTreeNodes" });

defineProps({
  nodes: { type: Array, default: () => [] },
  depth: { type: Number, default: 0 },
  canUpdate: { type: Boolean, default: false },
  canActivate: { type: Boolean, default: false },
  canDeactivate: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  actionLoading: { type: Boolean, default: false },
});

const emit = defineEmits(["edit", "activate", "deactivate", "delete"]);

const { t, locale } = useAppLocale();
const { canAccessBranch } = usePermissions();

function displayName(node) {
  return costCenterDisplayName(node, locale.value);
}

function isActive(node) {
  return enumValue(node.status) === "active";
}

function hasChildren(node) {
  return Array.isArray(node.children) && node.children.length > 0;
}
</script>
