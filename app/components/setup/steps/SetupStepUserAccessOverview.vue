<template>
  <div>
    <div v-if="loading" class="d-flex justify-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

  <div v-else-if="users.length" class="org-chart-wrapper mb-4">
    <ClientOnly>
      <div v-if="chartReady" ref="chartEl" class="org-chart" />
      <div v-else class="org-chart-fallback">
        <div class="org-chart-level org-chart-level--root">
          <div class="org-chart-card org-chart-card--root">
            <div class="org-chart-card__title">{{ t("setup.roles") }}</div>
            <div class="org-chart-card__subtitle">{{ t("setup.userAccessHierarchy") }}</div>
          </div>
        </div>
        <div
          v-for="(level, index) in hierarchyLevels"
          :key="`level-${index}`"
          class="org-chart-level"
        >
          <div
            v-for="node in level"
            :key="node.key"
            class="org-chart-card"
          >
            <div class="org-chart-card__title">{{ node.name }}</div>
            <div class="org-chart-card__subtitle">{{ summarizeUsers(node.users) }}</div>
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>

    <p v-else class="text-medium-emphasis mb-4">{{ t('setup.noUsersOverview') }}</p>

    <v-btn color="primary" class="text-none" @click="$emit('continue')">
      {{ t('setup.continueToWarehouses') }}
    </v-btn>
  </div>
</template>

<script setup>
const props = defineProps({
  overview: { type: Object, default: null },
  loading: { type: Boolean, default: false },
});

defineEmits(["continue"]);

const { locale, t } = useAppLocale();

const users = computed(() => props.overview?.users ?? []);
const chartEl = ref(null);
const chart = ref(null);
const chartReady = ref(false);

const ROLE_HIERARCHY = {
  admin: null,
  erp_admin: "admin",
  security_admin: "admin",
  finance_admin: "erp_admin",
  finance_manager: "finance_admin",
  tax_officer: "finance_admin",
  branch_admin: "erp_admin",
  branch_manager: "branch_admin",
  warehouse_manager: "branch_admin",
  inventory_user: "warehouse_manager",
  department_manager: "erp_admin",
  product_owner: "erp_admin",
  auditor: "security_admin",
};
const ROLE_ORDER = [
  "admin",
  "erp_admin",
  "security_admin",
  "branch_admin",
  "branch_manager",
  "warehouse_manager",
  "inventory_user",
  "finance_admin",
  "finance_manager",
  "tax_officer",
  "department_manager",
  "product_owner",
  "auditor",
];

async function ensureOrgChart() {
  if (typeof window === "undefined") return;
  if (window.OrgChart) return;

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://balkan.app/js/OrgChart.js";
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function normalizeRoleKey(role) {
  const raw = role?.role_code || role?.name_en || role?.name || "";
  return String(raw).trim().toLowerCase().replace(/\s+/g, "_");
}

function summarizeUsers(roleUsers) {
  if (!roleUsers.length) return t("setup.noUsersOverview");
  const names = roleUsers.map((user) => user.name || user.email).filter(Boolean);
  if (!names.length) return t("setup.noUsersOverview");
  if (names.length <= 2) return names.join(" · ");
  return `${names[0]} · ${names[1]} +${names.length - 2}`;
}

function buildNodes() {
  const rootId = "roles-root";
  const nodes = [
    {
      id: rootId,
      name: t("setup.roles"),
      title: t("setup.userAccessHierarchy"),
    },
  ];

  const roleMap = new Map();

  users.value.forEach((user) => {
    (user.roles ?? []).forEach((role) => {
      const key = normalizeRoleKey(role);
      if (!roleMap.has(key)) {
        roleMap.set(key, {
          id: role.id,
          key,
          name: role.name,
          users: [],
        });
      }
      roleMap.get(key).users.push(user);
    });
  });

  roleMap.forEach((role) => {
    const roleId = `role-${role.id}`;
    const parentKey = ROLE_HIERARCHY[role.key];
    const parentRole = parentKey ? roleMap.get(parentKey) : null;
    nodes.push({
      id: roleId,
      pid: parentRole ? `role-${parentRole.id}` : rootId,
      name: role.name,
      title: summarizeUsers(role.users),
    });
  });

  return nodes;
}

const hierarchyLevels = computed(() => {
  const roleMap = new Map();

  users.value.forEach((user) => {
    (user.roles ?? []).forEach((role) => {
      const key = normalizeRoleKey(role);
      if (!roleMap.has(key)) {
        roleMap.set(key, {
          key,
          name: role.name,
          users: [],
          children: [],
          parentKey: ROLE_HIERARCHY[key] ?? null,
        });
      }
      roleMap.get(key).users.push(user);
    });
  });

  const nodes = Array.from(roleMap.values());
  const nodeByKey = new Map(nodes.map((node) => [node.key, node]));
  const roots = [];

  nodes.forEach((node) => {
    const parent = node.parentKey ? nodeByKey.get(node.parentKey) : null;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const orderIndex = (key) => {
    const index = ROLE_ORDER.indexOf(key);
    return index === -1 ? ROLE_ORDER.length : index;
  };

  const sortNodes = (list) => {
    list.sort((a, b) => orderIndex(a.key) - orderIndex(b.key));
    list.forEach((node) => sortNodes(node.children));
  };

  sortNodes(roots);

  const levels = [];
  const queue = roots.map((node) => ({ node, depth: 0 }));

  while (queue.length) {
    const { node, depth } = queue.shift();
    if (!levels[depth]) levels[depth] = [];
    levels[depth].push(node);
    node.children.forEach((child) => queue.push({ node: child, depth: depth + 1 }));
  }

  return levels;
});

async function renderChart() {
  if (!chartEl.value || !users.value.length) {
    chartReady.value = false;
    return;
  }

  try {
    await ensureOrgChart();
  } catch (error) {
    chartReady.value = false;
    return;
  }

  if (!window.OrgChart) {
    chartReady.value = false;
    return;
  }

  const nodes = buildNodes();

  if (chart.value) {
    chart.value.load(nodes);
    chartReady.value = true;
    return;
  }

  chart.value = new window.OrgChart(chartEl.value, {
    nodes,
    template: "ana",
    mouseScrool: window.OrgChart.action.scroll,
    scaleInitial: window.OrgChart.match.boundary,
    nodeBinding: {
      field_0: "name",
      field_1: "title",
    },
  });
  chartReady.value = true;
}

watch(
  [users, () => locale.value],
  () => {
    renderChart();
  },
  { deep: true, immediate: true },
);

onBeforeUnmount(() => {
  chart.value = null;
  chartReady.value = false;
  if (chartEl.value) {
    chartEl.value.innerHTML = "";
  }
});
</script>

<style scoped>
.org-chart-wrapper {
  width: 100%;
  min-height: 360px;
}

.org-chart {
  width: 100%;
  min-height: 360px;
  height: 520px;
}

.org-chart-fallback {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  padding: 8px 0;
}

.org-chart-level {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.org-chart-level--root {
  margin-bottom: 4px;
}

.org-chart-card {
  min-width: 180px;
  max-width: 240px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  text-align: center;
}

.org-chart-card--root {
  background: #f8fafc;
}

.org-chart-card__title {
  font-weight: 600;
  color: #0f172a;
}

.org-chart-card__subtitle {
  margin-top: 4px;
  font-size: 0.85rem;
  color: #64748b;
}
</style>
