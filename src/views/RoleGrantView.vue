<template>
  <div class="page">
    <el-row :gutter="12">
      <el-col :xs="24" :md="8">
        <el-card class="card">
          <div class="role-toolbar">
            <el-input v-model="roleQuery" placeholder="搜索角色" clearable />
            <el-button @click="loadRoles">查询</el-button>
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
            <el-table-column label="角色名">
              <template #default="{ row }"
                >{{ roleLabel(row) }}（{{ row.roleName }}）</template
              >
            </el-table-column>
            <el-table-column label="初始化" width="100">
              <template #default="{ row }">
                <el-tag :type="row.isInitial ? 'warning' : 'info'">{{
                  row.isInitial ? "是" : "否"
                }}</el-tag>
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
      <el-col :xs="24" :md="16">
        <el-card class="card">
          <div class="sticky-bar">
            <div class="sticky-left">
              <el-text>当前角色：</el-text>
              <el-tag v-if="currentRole" type="success">{{
                currentRole.roleName
              }}</el-tag>
            </div>
            <div class="sticky-right">
              <el-button @click="selectAll">全选</el-button>
              <el-button @click="clearAll">清空</el-button>
              <el-button type="primary" @click="save">保存</el-button>
            </div>
          </div>
          <div class="perm-area" v-loading="loadingPerms">
            <el-input
              v-model="permQuery"
              placeholder="搜索权限"
              clearable
              @input="onPermQueryChange"
            />
            <el-collapse v-model="openedModules" accordion>
              <el-collapse-item
                v-for="(perms, module) in permsByModule"
                :key="module"
                :name="module"
              >
                <template #title>
                  <div class="collapse-title">
                    <span>{{ module || "未分类" }}</span>
                    <span class="collapse-sub">({{ perms.length }} 项)</span>
                  </div>
                </template>
                <div class="perm-item" v-for="p in perms" :key="p.id">
                  <el-checkbox v-model="checkedPermIds" :label="p.id">
                    <div class="perm-main">
                      <div class="perm-code">{{ p.permName }}</div>
                      <div class="perm-desc">{{ p.description }}</div>
                    </div>
                  </el-checkbox>
                </div>
              </el-collapse-item>
            </el-collapse>
            <p v-if="!permissions.length" class="empty-tip">暂无权限</p>
          </div>
          <p class="hint">提示：权限分配后需用户重新登录生效</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, reactive } from "vue";
import {
  listRoles,
  getPermIdsByRoleId,
  assignPermsToRole,
  listPermissions,
} from "@/api"; // 统一导入
import { ElMessage } from "element-plus";

const roleQuery = ref("");
const rolesPage = reactive({ list: [], total: 0, pageNum: 1, pageSize: 10 });
const loadingRoles = ref(false);
const currentRole = ref(null);

const permissions = ref([]);
const loadingPerms = ref(false);
const permQuery = ref("");
const checkedPermIds = ref([]);
const openedModules = ref([]);

const permsByModule = computed(() => {
  const grouped = {};
  permissions.value.forEach((p) => {
    const mod = p.module || "未分类";
    if (!grouped[mod]) grouped[mod] = [];
    grouped[mod].push(p);
  });
  return grouped;
});

async function loadRoles() {
  loadingRoles.value = true;
  try {
    const data = await listRoles({
      pageNum: rolesPage.pageNum,
      pageSize: rolesPage.pageSize,
      roleName: roleQuery.value,
    });
    rolesPage.list = data.list || [];
    rolesPage.total = data.total || 0;
  } catch (e) {
    ElMessage.error(e.message || "加载角色失败");
  } finally {
    loadingRoles.value = false;
  }
}

async function loadPerms() {
  loadingPerms.value = true;
  try {
    const data = await listPermissions({}); // 使用默认分页
    permissions.value = data || [];
  } catch (e) {
    ElMessage.error(e.message || "加载权限失败");
  } finally {
    loadingPerms.value = false;
  }
}

async function onRoleSelect(row) {
  currentRole.value = row;
  checkedPermIds.value = [];
  if (row) {
    try {
      checkedPermIds.value = (await getPermIdsByRoleId(row.id)) || [];
    } catch (e) {
      ElMessage.error(e.message || "加载权限失败");
    }
  }
}

function roleLabel(row) {
  return row.description || row.roleName; // 假设 label 是 description
}

function selectAll() {
  checkedPermIds.value = permissions.value.map((p) => p.id);
}

function clearAll() {
  checkedPermIds.value = [];
}

async function save() {
  if (!currentRole.value) return ElMessage.warning("请选择角色");
  try {
    await assignPermsToRole(currentRole.value.id, checkedPermIds.value);
    ElMessage.success("授权保存成功");
  } catch (e) {
    ElMessage.error(e.message || "保存失败");
  }
}

function onPermQueryChange() {
  openedModules.value = Object.keys(permsByModule.value);
}

watch(
  () => permissions.value.length,
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
