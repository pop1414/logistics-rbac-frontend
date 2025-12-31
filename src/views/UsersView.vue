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
        <el-button type="primary" @click="load">查询</el-button>
        <el-button @click="reset">重置</el-button>
        <div style="flex: 1"></div>
        <el-button type="success" @click="openCreate">新建用户</el-button>
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
          :page-sizes="[10, 20, 50]"
          :page-size="page.pageSize"
          :current-page="page.pageNum"
          @size-change="onSizeChange"
          @current-change="onPageChange"
        />
      </div>
    </el-card>

    <!-- 新建/编辑对话框 -->
    <el-dialog
      v-model="dlgEdit"
      :title="dlg.mode === 'create' ? '新建用户' : '编辑用户'"
      width="500px"
    >
      <el-form label-width="80px">
        <el-form-item label="用户名">
          <el-input
            v-model="editForm.username"
            placeholder="请输入用户名"
            :disabled="dlg.mode === 'edit'"
          />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" v-if="dlg.mode === 'create'">
          <el-input
            v-model="editForm.password"
            type="password"
            placeholder="请输入密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlgEdit = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog v-model="dlgAssignRoles" title="分配角色" width="500px">
      <el-form label-width="80px">
        <el-form-item label="用户">
          {{ assignUser.username }}
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="assignRoleIds" multiple placeholder="选择角色">
            <el-option
              v-for="role in allRoles"
              :key="role.id"
              :label="role.roleName"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlgAssignRoles = false">取消</el-button>
        <el-button type="primary" @click="submitAssignRoles">确定</el-button>
      </template>
    </el-dialog>

    <!-- 权限码对话框 -->
    <el-dialog v-model="dlgPermCodes" title="权限码" width="500px">
      <el-form label-width="80px">
        <el-form-item label="用户">
          {{ permUser.username }}
        </el-form-item>
        <el-form-item label="权限码">
          <el-tag v-for="code in permCodes" :key="code" style="margin: 4px">{{
            code
          }}</el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlgPermCodes = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import {
  listUsers,
  createUser,
  getUserDetail,
  updateUser,
  deleteUser,
  listRoles,
  assignRolesToUser,
  getPermCodesByUserId,
} from "@/api"; // 统一导入
import { ElMessage, ElMessageBox } from "element-plus";

const q = reactive({ username: "" });
const page = reactive({ list: [], total: 0, pageNum: 1, pageSize: 10 });
const loading = ref(false);

const dlg = reactive({ mode: "create" });
const dlgEdit = ref(false);
const editForm = reactive({ username: "", email: "", password: "" });

const dlgAssignRoles = ref(false);
const assignUser = reactive({ id: null, username: "" });
const allRoles = ref([]);
const assignRoleIds = ref([]);

const dlgPermCodes = ref(false);
const permUser = reactive({ id: null, username: "" });
const permCodes = ref([]);

function fmtTime(time) {
  return time ? new Date(time).toLocaleString() : "";
}

async function load() {
  loading.value = true;
  try {
    const data = await listUsers({
      pageNum: page.pageNum,
      pageSize: page.pageSize,
      username: q.username,
    });
    page.list = data.list || [];
    page.total = data.total || 0;
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

function openCreate() {
  dlg.mode = "create";
  editForm.username = "";
  editForm.email = "";
  editForm.password = "";
  dlgEdit.value = true;
}

async function openEdit(row) {
  dlg.mode = "edit";
  const detail = await getUserDetail(row.id);
  editForm.username = detail.username;
  editForm.email = detail.email || "";
  dlgEdit.value = true;
}

async function submitEdit() {
  if (!editForm.username.trim()) return ElMessage.warning("用户名不能为空");
  try {
    if (dlg.mode === "create") {
      await createUser({
        username: editForm.username.trim(),
        email: editForm.email,
        password: editForm.password,
      });
      ElMessage.success("创建成功");
    } else {
      await updateUser(
        page.list.find((u) => u.username === editForm.username).id,
        { email: editForm.email }
      );
      ElMessage.success("更新成功");
    }
    dlgEdit.value = false;
    load();
  } catch (e) {
    ElMessage.error(e.message || "保存失败");
  }
}

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

async function ensureAllRoles() {
  const data = await listRoles({ pageNum: 1, pageSize: 1000 });
  allRoles.value = data.list || [];
}

async function openAssignRoles(row) {
  assignUser.id = row.id;
  assignUser.username = row.username;
  assignRoleIds.value = [];
  try {
    await ensureAllRoles();
    const detail = await getUserDetail(row.id);
    assignRoleIds.value = detail.roleIds || [];
    dlgAssignRoles.value = true;
  } catch (e) {
    ElMessage.error(e.message || "加载角色失败");
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

async function openPermCodes(row) {
  permUser.id = row.id;
  permUser.username = row.username;
  permCodes.value = [];
  try {
    permCodes.value = (await getPermCodesByUserId(row.id)) || [];
    dlgPermCodes.value = true;
  } catch (e) {
    ElMessage.error(e.message || "查询权限码失败");
  }
}

onMounted(load);
</script>
