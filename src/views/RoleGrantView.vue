<template>
  <div class="page">
    <el-row :gutter="12">
      <!-- 左：角色列表 -->
      <el-col :xs="24" :md="8">
        <el-card class="card">
          <div class="role-toolbar">
            <el-input v-model="roleQuery" placeholder="搜索角色" clearable />
            <el-button @click="loadRoles()">查询</el-button>
          </div>

          <el-table
            :data="rolesPage.list"
            class="role-table"
            border
            height="560"
            highlight-current-row
            @current-change="onRoleSelect"
            v-loading="loadingRoles"
          >
            <el-table-column prop="id" label="ID" width="80" />
            <!-- <el-table-column prop="roleName" label="角色名" /> -->
            <el-table-column label="角色名">
              <template #default="{ row }">
                <span>{{ roleLabel(row) }}（{{ row.roleName }}）</span>
              </template>
            </el-table-column>
            <el-table-column label="初始化" width="100">
              <template #default="{ row }">
                <el-tag :type="row.isInitial ? 'warning' : 'info'">
                  {{ row.isInitial ? "是" : "否" }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <div class="pager">
            <el-pagination
              background
              layout="prev, pager, next"
              :total="rolesPage.total"
              :page-size="rolesPage.pageSize"
              :current-page="rolesPage.pageNum"
              @current-change="
                (pn) => {
                  rolesPage.pageNum = pn;
                  loadRoles();
                }
              "
            />
          </div>
        </el-card>
      </el-col>

      <!-- 右：权限勾选 -->
      <el-col :xs="24" :md="16">
        <el-card class="card">
          <!-- sticky 操作栏 -->
          <div class="sticky-bar">
            <div class="sticky-left">
              <el-text>当前角色：</el-text>
              <el-tag v-if="currentRole" type="success" effect="light">
                {{ currentRole.roleName }}
              </el-tag>
              <el-tag v-else type="info" effect="light">未选择</el-tag>
            </div>

            <div class="sticky-right">
              <el-button
                @click="selectAll()"
                :disabled="!currentRole || loadingPerms"
              >
                全选
              </el-button>
              <el-button
                @click="clearAll()"
                :disabled="!currentRole || loadingPerms"
              >
                清空
              </el-button>
              <el-button
                type="primary"
                @click="save()"
                :disabled="!currentRole || loadingPerms"
              >
                保存授权
              </el-button>
            </div>
          </div>

          <el-divider />

          <div v-if="!currentRole" class="empty-tip">
            <el-text type="info">左侧先选择一个角色，再进行权限勾选。</el-text>
          </div>

          <div v-else class="perm-area" v-loading="loadingPerms">
            <!-- 搜索权限 -->
            <div class="perm-toolbar">
              <el-input
                v-model="permQuery"
                placeholder="搜索权限（按模块/权限码/描述）"
                clearable
                @input="onPermQueryChange"
              />
              <el-tag effect="light" type="info">
                已选 {{ checkedPermIds.length }} 项
              </el-tag>
            </div>

            <!-- 折叠面板 -->
            <el-collapse v-model="openedModules">
              <el-collapse-item
                v-for="mod in moduleKeys"
                :key="mod"
                :name="mod"
              >
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
                      <el-checkbox-group v-model="checkedPermIds">
                        <el-checkbox :label="p.id">
                          <div class="perm-main">
                            <div class="perm-code">{{ p.permName }}</div>
                            <div class="perm-desc">
                              {{ p.description || "-" }}
                            </div>
                          </div>
                        </el-checkbox>
                      </el-checkbox-group>
                    </div>
                  </el-col>
                </el-row>
              </el-collapse-item>
            </el-collapse>

            <el-empty
              v-if="moduleKeys.length === 0"
              description="没有匹配到权限"
            />
          </div>

          <!-- <el-alert
            class="hint"
            type="info"
            show-icon
            title="提示：已支持回显（GET /api/rbac/roles/{roleId}/perm-ids）。若该接口异常，本页仍可保存授权。"
          /> -->
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { listRoles } from "../api/roles";
import { listPermissions } from "../api/permissions";
import { assignPermsToRole, getPermIdsByRoleId } from "../api/rbac";

// 映射数据库字段
import { roleNameMap } from "@/constants/roleNameMap";
function roleLabel(role) {
  return roleNameMap[role.roleName] || role.roleName;
}

const loadingRoles = ref(false);
const loadingPerms = ref(false);

const roleQuery = ref("");
const rolesPage = reactive({ list: [], total: 0, pageNum: 1, pageSize: 10 });

const permissions = ref([]); // PermissionVO list
const currentRole = ref(null);
const checkedPermIds = ref([]);

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

async function loadRoles() {
  loadingRoles.value = true;
  try {
    const data = await listRoles({
      pageNum: rolesPage.pageNum,
      pageSize: rolesPage.pageSize,
      roleName: roleQuery.value || "",
    });
    rolesPage.list = data.list || [];
    rolesPage.total = data.total || 0;
    rolesPage.pageNum = data.pageNum || rolesPage.pageNum;
    rolesPage.pageSize = data.pageSize || rolesPage.pageSize;
  } catch (e) {
    ElMessage.error(e?.message || "加载角色失败");
  } finally {
    loadingRoles.value = false;
  }
}

async function loadPerms() {
  loadingPerms.value = true;
  try {
    const res = await listPermissions({ pageNum: 1, pageSize: 1000 });
    const list = normalizePerms(res);
    permissions.value = list;

    // 默认展开所有模块（也可以只展开前 3 个）
    openedModules.value = Object.keys(permsByModule.value);
  } catch (e) {
    ElMessage.error(e?.message || "加载权限失败");
  } finally {
    loadingPerms.value = false;
  }
}

async function onRoleSelect(row) {
  if (!row) return;
  currentRole.value = row;
  checkedPermIds.value = [];

  try {
    const ids = await getPermIdsByRoleId(row.id);
    checkedPermIds.value = ids || [];
  } catch (e) {
    // 回显失败也不影响保存
    checkedPermIds.value = [];
  }
}

function selectAll() {
  checkedPermIds.value = (permissions.value || []).map((p) => p.id);
}

function clearAll() {
  checkedPermIds.value = [];
}

async function save() {
  if (!currentRole.value) return;
  try {
    await assignPermsToRole(currentRole.value.id, checkedPermIds.value);
    ElMessage.success("授权保存成功");
  } catch (e) {
    ElMessage.error(e?.message || "保存失败");
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

onMounted(async () => {
  await loadPerms();
  await loadRoles();
});
</script>

<style scoped>
.page {
  padding: 16px;
}
.card {
  border-radius: 12px;
}
.role-toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
}
.role-table {
  margin-top: 12px;
}
.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

/* 右侧 sticky 操作栏 */
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
.empty-tip {
  padding: 12px;
}
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
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 6px;
}
.perm-code {
  font-weight: 600;
}
.perm-desc {
  font-size: 12px;
  color: #666;
}

.hint {
  margin-top: 12px;
}
</style>
