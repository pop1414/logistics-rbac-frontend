<template>
  <div style="padding: 16px">
    <el-button @click="load">刷新</el-button>
    <el-table :data="list" style="margin-top: 12px" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="module" label="模块" width="120" />
      <el-table-column prop="permName" label="权限码" />
      <el-table-column prop="description" label="描述" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { listPermissions } from "../api/permissions";
import { ElMessage } from "element-plus";

const list = ref([]);

async function load() {
  try {
    // 如果你后端分页，就传 pageNum/pageSize；如果不分页就空
    const data = await listPermissions({});
    // 兼容：分页 PageInfo / 非分页 List
    list.value = Array.isArray(data) ? data : data.list || [];
  } catch (e) {
    ElMessage.error(e.message || "加载失败");
  }
}

onMounted(load);
</script>
