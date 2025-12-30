<template>
  <el-container style="height: 100vh">
    <!-- 顶部 -->
    <el-header class="topbar">
      <div class="topbar-left">
        <span class="logo">LMS · RBAC</span>
      </div>
      <!-- <div class="topbar-right">
        <el-button size="small" @click="go('/users')">用户</el-button>
        <el-button size="small" @click="go('/roles')">角色</el-button>
        <el-button size="small" @click="go('/permissions')">权限</el-button>
      </div> -->
    </el-header>

    <el-container>
      <!-- 左侧菜单 -->
      <el-aside width="220px" class="sidebar">
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
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
//const router = useRouter();

const activePath = computed(() => route.path);

// function go(path) {
//   router.push(path);
// }
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
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
</style>
