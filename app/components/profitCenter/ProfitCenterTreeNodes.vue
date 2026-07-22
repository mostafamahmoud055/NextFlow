<template>
  <div>
    <template v-for="node in nodes" :key="node.id">
      <v-list-item
        :style="{ paddingInlineStart: `${12 + depth * 20}px` }"
        class="profit-center-tree-item"
      >
        <template #prepend>
          <v-icon size="20" class="me-2">
            {{ hasChildren(node) ? 'mdi-folder-outline' : 'mdi-circle-small' }}
          </v-icon>
        </template>

        <v-list-item-title class="d-flex align-center flex-wrap ga-2">
          <span class="font-weight-medium">{{ displayName(node) }}</span>
          <span class="text-caption text-medium-emphasis">
            {{ node.profit_center_code }}
          </span>
          <v-chip
            size="x-small"
            :color="isActive(node) ? 'success' : 'secondary'"
            variant="tonal"
          >
            {{
              isActive(node)
                ? t('profitCenter.statusActive')
                : t('profitCenter.statusInactive')
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
                :aria-label="t('profitCenter.actions')"
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
                :title="t('profitCenter.activate')"
                :disabled="actionLoading"
                @click="emit('activate', node)"
              />
              <v-list-item
                v-if="canDeactivate && canAccessBranch(node.branch_id) && isActive(node)"
                prepend-icon="mdi-cancel"
                :title="t('profitCenter.deactivate')"
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

      <ProfitCenterTreeNodes
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
import { profitCenterDisplayName } from "~/utils/profitCenterConstants";
import { enumValue } from "~/utils/enumValue";

defineOptions({ name: "ProfitCenterTreeNodes" });

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
  return profitCenterDisplayName(node, locale.value);
}

function isActive(node) {
  return enumValue(node.status) === "active";
}

function hasChildren(node) {
  return Array.isArray(node.children) && node.children.length > 0;
}
</script>
