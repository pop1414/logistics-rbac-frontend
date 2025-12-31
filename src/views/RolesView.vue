<template>
  <div style="padding: 16px">
    <el-card>
      <div
        style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap"
      >
        <el-input
          v-model="q.roleName"
          placeholder="按角色名搜索"
          style="width: 240px"
          clearable
        />
        <el-button type="primary" @click="load">查询</el-button>
        <el-button @click="reset">重置</el-button>
        <div style="flex: 1"></div>
        <el-button type="success" @click="openCreate">新建角色</el-button>
      </div>
      <el-table
        :data="page.list"
        border
        style="margin-top: 12px"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="roleName" label="角色名" min-width="160" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="初始化" width="110">
          <template #default="{ row }">
            <el-tag :type="row.isInitial ? 'warning' : 'info'">{{
              row.isInitial ? "是" : "否"
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="180">
          <template #default="{ row }">{{ fmtTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              @click="openEdit(row)"
              :disabled="row.isInitial"
              >编辑</el-button
            >
            <el-button
              size="small"
              type="danger"
              @click="doDelete(row)"
              :disabled="row.isInitial"
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

    <!-- 编辑/创建对话框 -->
    <el-dialog
      v-model="dlg.visible"
      :title="dlg.mode === 'create' ? '新建角色' : '编辑角色'"
      width="500px"
    >
      <el-form label-width="80px">
        <el-form-item label="角色名">
          <el-input v-model="form.roleName" placeholder="请输入角色名" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            placeholder="请输入描述"
            type="textarea"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg.visible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { listRoles, createRole, updateRole, deleteRole } from "@/api"; // 统一导入
import { ElMessage, ElMessageBox } from "element-plus";

const q = reactive({ roleName: "" });
const page = reactive({ list: [], total: 0, pageNum: 1, pageSize: 10 });
const loading = ref(false);

const dlg = reactive({ visible: false, mode: "create", editId: null });
const form = reactive({ roleName: "", description: "" });

function fmtTime(time) {
  return time ? new Date(time).toLocaleString() : ""; // 假设 utils/fmtTime
}

async function load() {
  loading.value = true;
  try {
    const data = await listRoles({
      pageNum: page.pageNum,
      pageSize: page.pageSize,
      roleName: q.roleName,
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
  q.roleName = "";
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
  dlg.editId = null;
  form.roleName = "";
  form.description = "";
  dlg.visible = true;
}

function openEdit(row) {
  dlg.mode = "edit";
  dlg.editId = row.id;
  form.roleName = row.roleName;
  form.description = row.description || "";
  dlg.visible = true;
}

async function submit() {
  if (!form.roleName.trim()) return ElMessage.warning("角色名不能为空");
  try {
    if (dlg.mode === "create") {
      await createRole({
        roleName: form.roleName.trim(),
        description: form.description,
      });
      ElMessage.success("创建成功");
    } else {
      await updateRole(dlg.editId, {
        roleName: form.roleName.trim(),
        description: form.description,
      });
      ElMessage.success("更新成功");
    }
    dlg.visible = false;
    load();
  } catch (e) {
    ElMessage.error(e.message || "保存失败");
  }
}

async function doDelete(row) {
  try {
    await ElMessageBox.confirm(`确认删除角色：${row.roleName} ?`, "提示", {
      type: "warning",
    });
    await deleteRole(row.id);
    ElMessage.success("删除成功");
    load();
  } catch (e) {
    if (e !== "cancel") ElMessage.error(e.message || "删除失败");
  }
}

onMounted(load);
</script>
