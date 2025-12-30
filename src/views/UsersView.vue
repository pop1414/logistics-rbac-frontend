<template>
  <div style="padding: 16px">
    <el-card>
      <div
        style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap"
      >
        <el-input
          v-model="q.username"
          placeholder="按用户名搜索"
          style="width: 240px"
          clearable
        />
        <el-button type="primary" @click="load()">查询</el-button>
        <el-button @click="reset()">重置</el-button>
        <div style="flex: 1"></div>
        <el-button type="success" @click="openCreate()">新建用户</el-button>
      </div>

      <el-table
        :data="page.list"
        border
        style="margin-top: 12px"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="160" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="createTime" label="创建时间" min-width="180">
          <template #default="{ row }">{{ fmtTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" min-width="180">
          <template #default="{ row }">{{ fmtTime(row.updateTime) }}</template>
        </el-table-column>

        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="primary" @click="openAssignRoles(row)"
              >分配角色</el-button
            >
            <el-button size="small" type="info" @click="openPermCodes(row)"
              >权限码</el-button
            >
            <el-button size="small" type="danger" @click="doDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <div style="display: flex; justify-content: flex-end; margin-top: 12px">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="page.total"
          :page-size="page.pageSize"
          :current-page="page.pageNum"
          :page-sizes="[5, 10, 20, 50]"
          @size-change="onSizeChange"
          @current-change="onPageChange"
        />
      </div>
    </el-card>

    <!-- 新建用户 -->
    <el-dialog v-model="dlgCreate" title="新建用户" width="520px">
      <el-form label-width="90px">
        <el-form-item label="用户名">
          <el-input v-model="createForm.username" placeholder="如: alice" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="createForm.password"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="createForm.email" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlgCreate = false">取消</el-button>
        <el-button type="primary" @click="submitCreate()">创建</el-button>
      </template>
    </el-dialog>

    <!-- 编辑用户（只改 email） -->
    <el-dialog v-model="dlgEdit" title="编辑用户" width="520px">
      <el-form label-width="90px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlgEdit = false">取消</el-button>
        <el-button type="primary" @click="submitEdit()">保存</el-button>
      </template>
    </el-dialog>

    <!-- 分配角色 -->
    <el-dialog v-model="dlgAssignRoles" title="分配角色" width="560px">
      <div style="margin-bottom: 8px">
        <el-text>用户：</el-text>
        <el-tag type="success">{{ assignUser.username }}</el-tag>
      </div>

      <el-select
        v-model="assignRoleIds"
        multiple
        filterable
        placeholder="选择角色"
        style="width: 100%"
      >
        <el-option
          v-for="r in allRoles"
          :key="r.id"
          :label="r.roleName"
          :value="r.id"
        />
      </el-select>

      <template #footer>
        <el-button @click="dlgAssignRoles = false">取消</el-button>
        <el-button type="primary" @click="submitAssignRoles()">保存</el-button>
      </template>
    </el-dialog>

    <!-- 查看权限码 -->
    <el-dialog v-model="dlgPermCodes" title="用户权限码" width="640px">
      <div style="margin-bottom: 10px">
        <el-text>用户：</el-text>
        <el-tag type="success">{{ permUser.username }}</el-tag>
      </div>

      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        <el-tag v-for="c in permCodes" :key="c" type="info">{{ c }}</el-tag>
      </div>

      <template #footer>
        <el-button @click="dlgPermCodes = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserDetail,
} from "../api/users";
import { listRoles } from "../api/roles";
import { assignRolesToUser, getUserPermCodes } from "../api/rbac";

const loading = ref(false);

const q = reactive({ username: "" });
const page = reactive({ list: [], total: 0, pageNum: 1, pageSize: 10 });

function fmtTime(v) {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d.getTime()) ? String(v) : d.toLocaleString();
}

async function load() {
  loading.value = true;
  try {
    const data = await listUsers({
      pageNum: page.pageNum,
      pageSize: page.pageSize,
      username: q.username || "",
    });
    page.list = data.list || [];
    page.total = data.total || 0;
    page.pageNum = data.pageNum || page.pageNum;
    page.pageSize = data.pageSize || page.pageSize;
  } catch (e) {
    ElMessage.error(e.message || "加载失败");
  } finally {
    loading.value = false;
  }
}

function reset() {
  q.username = "";
  page.pageNum = 1;
  load();
}

function onSizeChange(size) {
  page.pageSize = size;
  page.pageNum = 1;
  load();
}

function onPageChange(pn) {
  page.pageNum = pn;
  load();
}

/** 新建 */
const dlgCreate = ref(false);
const createForm = reactive({ username: "", password: "", email: "" });

function openCreate() {
  createForm.username = "";
  createForm.password = "";
  createForm.email = "";
  dlgCreate.value = true;
}

async function submitCreate() {
  if (!createForm.username || !createForm.username.trim()) {
    ElMessage.warning("username 不能为空");
    return;
  }
  if (!createForm.password || !createForm.password.trim()) {
    ElMessage.warning("password 不能为空");
    return;
  }
  try {
    await createUser({
      username: createForm.username.trim(),
      password: createForm.password,
      email: createForm.email || null,
    });
    ElMessage.success("创建成功");
    dlgCreate.value = false;
    load();
  } catch (e) {
    ElMessage.error(e.message || "创建失败");
  }
}

/** 编辑（只改 email） */
const dlgEdit = ref(false);
const editForm = reactive({ id: null, username: "", email: "" });

function openEdit(row) {
  editForm.id = row.id;
  editForm.username = row.username;
  editForm.email = row.email || "";
  dlgEdit.value = true;
}

async function submitEdit() {
  try {
    await updateUser(editForm.id, { email: editForm.email });
    ElMessage.success("更新成功");
    dlgEdit.value = false;
    load();
  } catch (e) {
    ElMessage.error(e.message || "更新失败");
  }
}

/** 删除 */
async function doDelete(row) {
  try {
    await ElMessageBox.confirm(`确认删除用户：${row.username} ?`, "提示", {
      type: "warning",
    });
    await deleteUser(row.id);
    ElMessage.success("删除成功");
    load();
  } catch (e) {
    if (e !== "cancel") ElMessage.error(e.message || "删除失败");
  }
}

/** 分配角色 */
const dlgAssignRoles = ref(false);
const assignUser = reactive({ id: null, username: "" });
const allRoles = ref([]);
const assignRoleIds = ref([]);

async function ensureAllRoles() {
  // 拉全量角色（实训量小，直接 pageSize 1000）
  const data = await listRoles({ pageNum: 1, pageSize: 1000, roleName: "" });
  allRoles.value = data.list || [];
}

async function openAssignRoles(row) {
  assignUser.id = row.id;
  assignUser.username = row.username;
  assignRoleIds.value = [];

  try {
    await ensureAllRoles();
    // 你后端 user detail 已包含 roleIds 回显（UserVO）
    const detail = await getUserDetail(row.id);
    assignRoleIds.value = detail.roleIds || [];
    dlgAssignRoles.value = true;
  } catch (e) {
    ElMessage.error(e.message || "加载角色信息失败");
  }
}

async function submitAssignRoles() {
  try {
    await assignRolesToUser(assignUser.id, assignRoleIds.value);
    ElMessage.success("分配成功");
    dlgAssignRoles.value = false;
  } catch (e) {
    ElMessage.error(e.message || "分配失败");
  }
}

/** 查看权限码 */
const dlgPermCodes = ref(false);
const permUser = reactive({ id: null, username: "" });
const permCodes = ref([]);

async function openPermCodes(row) {
  permUser.id = row.id;
  permUser.username = row.username;
  permCodes.value = [];
  try {
    const codes = await getUserPermCodes(row.id);
    permCodes.value = codes || [];
    dlgPermCodes.value = true;
  } catch (e) {
    ElMessage.error(e.message || "查询权限码失败");
  }
}

onMounted(load);
</script>
