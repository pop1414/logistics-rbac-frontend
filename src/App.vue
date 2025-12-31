<template>
  <el-container style="height: 100vh">
    <!-- 顶部，只在登录后显示 -->
    <el-header v-if="isLoggedIn" class="topbar">
      <div class="topbar-left">
        <span class="logo">LMS · RBAC</span>
      </div>
      <span class="welcome">欢迎，{{ username }}</span>
      <el-button class="logout-btn" type="danger" size="small" @click="onLogout"
        >退出登录</el-button
      >
    </el-header>

    <el-container>
      <!-- 左侧菜单，只在登录后显示 -->
      <el-aside v-if="isLoggedIn" width="220px" class="sidebar">
        <el-menu :default-active="activePath" router class="menu">
          <el-menu-item index="/users">
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/roles">
            <span>角色管理</span>
          </el-menu-item>
          <el-menu-item index="/role-grant">
            <span>角色授权</span>
          </el-menu-item>
          <el-menu-item index="/permissions">
            <span>权限选项</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容 -->
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  getUserInfo,
  removeToken,
  removeRoleNames,
  removeUserInfo,
} from "@/utils/token";
import { ElMessage, ElMessageBox } from "element-plus";

const router = useRouter();
const route = useRoute();

const forceUpdate = ref(0); // dummy ref，用于强制触发 computed

const userInfo = computed(() => getUserInfo() || {});
const username = computed(() => userInfo.value?.username || "用户");
const activePath = computed(() => route.path);
const isLoggedIn = computed(() => {
  forceUpdate.value; // 依赖此 ref，事件触发时更新
  return !!localStorage.getItem("token");
});

// 监听登录状态变化，如果未登录跳转 /login
watch(isLoggedIn, (newVal) => {
  if (!newVal && route.path !== "/login") {
    router.push("/login");
  }
});

// 监听 storage 事件（同/跨标签页变化）
function handleStorageChange(e) {
  if (e.key === "token" || e.key === "roleNames" || e.key === "userInfo") {
    forceUpdate.value++; // 触发 computed 重新计算
  }
}

onMounted(() => {
  window.addEventListener("storage", handleStorageChange);
});

onUnmounted(() => {
  window.removeEventListener("storage", handleStorageChange);
});

async function onLogout() {
  try {
    await ElMessageBox.confirm("确认退出登录？", "提示", { type: "warning" });
    console.log("退出登录被调用，当前路径:", route.path);
    removeToken();
    removeRoleNames();
    removeUserInfo();
    ElMessage.success("退出成功");
    router.push("/login");
  } catch (e) {
    if (e !== "cancel") ElMessage.error("退出失败");
  }
}
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  padding: 0 16px;
}
.logo {
  font-weight: 700;
  font-size: 16px;
}
.sidebar {
  border-right: 1px solid #eee;
}
.menu {
  height: 100%;
}
.main {
  background: #f7f8fa;
  padding: 16px;
}
.logout-btn {
  margin-left: auto;
}
</style>
