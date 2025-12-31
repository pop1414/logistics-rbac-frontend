<template>
  <div class="page">
    <el-card class="card">
      <!-- sticky 操作栏 -->
      <div class="sticky-bar">
        <div class="sticky-left">
          <el-text>权限列表</el-text>
        </div>
        <div class="sticky-right">
          <el-button @click="load" :disabled="loading">刷新</el-button>
        </div>
      </div>

      <el-divider />

      <div class="perm-area" v-loading="loading">
        <!-- 搜索权限 -->
        <div class="perm-toolbar">
          <el-input
            v-model="permQuery"
            placeholder="搜索权限（按模块/权限码/描述）"
            clearable
            @input="onPermQueryChange"
          />
          <el-tag effect="light" type="info">
            总计 {{ permissions.length }} 项
          </el-tag>
        </div>

        <!-- 折叠面板 -->
        <el-collapse v-model="openedModules">
          <el-collapse-item v-for="mod in moduleKeys" :key="mod" :name="mod">
            <template #title>
              <div class="collapse-title">
                <el-tag effect="plain" type="info">{{ mod }}</el-tag>
                <span class="collapse-sub">
                  {{ (filteredPermsByModule[mod] || []).length }} 项
                </span>
              </div>
            </template>

            <el-row :gutter="12">
              <el-col
                v-for="p in filteredPermsByModule[mod]"
                :key="p.id"
                :xs="24"
                :sm="12"
                :lg="8"
              >
                <div class="perm-item">
                  <div class="perm-main">
                    <div class="perm-code">{{ p.permName }}</div>
                    <div class="perm-desc">{{ p.description || "-" }}</div>
                    <div class="perm-id">ID: {{ p.id }}</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-collapse-item>
        </el-collapse>

        <el-empty v-if="moduleKeys.length === 0" description="没有匹配到权限" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { listPermissions } from "../api/permissions";

const loading = ref(false);
const permissions = ref([]); // PermissionVO list
const permQuery = ref("");
const openedModules = ref([]); // 折叠面板打开项

// 兼容：listPermissions 可能返回 list / PageInfo / ApiResponse
function normalizePerms(res) {
  if (Array.isArray(res)) return res;
  // 常见：后端 ApiResponse<PageInfo<PermissionVO>>
  const data = res?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(res?.list)) return res.list;
  return [];
}

const permsByModule = computed(() => {
  const map = {};
  for (const p of permissions.value || []) {
    const m = p.module || "other";
    if (!map[m]) map[m] = [];
    map[m].push(p);
  }
  // 每个模块内排序
  for (const m of Object.keys(map)) {
    map[m].sort((a, b) => String(a.permName).localeCompare(String(b.permName)));
  }
  return map;
});

const filteredPermsByModule = computed(() => {
  const q = (permQuery.value || "").trim().toLowerCase();
  if (!q) return permsByModule.value;

  const out = {};
  for (const [m, arr] of Object.entries(permsByModule.value)) {
    const hit = arr.filter((p) => {
      const s = `${m} ${p.permName || ""} ${p.description || ""}`.toLowerCase();
      return s.includes(q);
    });
    if (hit.length) out[m] = hit;
  }
  return out;
});

const moduleKeys = computed(() =>
  Object.keys(filteredPermsByModule.value).sort((a, b) => a.localeCompare(b))
);

async function load() {
  loading.value = true;
  try {
    // 如果你后端分页，就传 pageNum/pageSize；如果不分页就空
    const res = await listPermissions({ pageNum: 1, pageSize: 1000 });
    const list = normalizePerms(res);
    permissions.value = list;

    // 默认展开所有模块
    openedModules.value = Object.keys(permsByModule.value);
  } catch (e) {
    ElMessage.error(e?.message || "加载失败");
  } finally {
    loading.value = false;
  }
}

function onPermQueryChange() {
  // 搜索后展开筛选结果里的模块
  openedModules.value = moduleKeys.value;
}

// 当 permissions 列表变了（首次加载）也自动展开
watch(
  () => permissions.value?.length,
  () => {
    openedModules.value = Object.keys(permsByModule.value);
  }
);

onMounted(load);
</script>

<style scoped>
.page {
  padding: 16px;
}
.card {
  border-radius: 12px;
}

/* sticky 操作栏 */
.sticky-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  padding: 6px 0 10px 0;
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.sticky-left {
  display: flex;
  gap: 10px;
  align-items: center;
}
.sticky-right {
  margin-left: auto;
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 权限区 */
.perm-area {
  max-height: 560px;
  overflow: auto;
  padding-right: 6px;
}
.perm-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.collapse-title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.collapse-sub {
  color: #999;
  font-size: 12px;
}
.perm-item {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
  background: #fff;
}
.perm-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.perm-code {
  font-weight: 600;
}
.perm-desc {
  font-size: 12px;
  color: #666;
}
.perm-id {
  font-size: 12px;
  color: #999;
}
</style>
