<template>
  <div class="page">
    <div class="card">
      <h2 class="title">登录</h2>
      <form @submit.prevent="onLogin">
        <div class="field">
          <label class="label">用户名</label>
          <input
            v-model.trim="form.username"
            class="input"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>
        <div class="field">
          <label class="label">密码</label>
          <input
            v-model="form.password"
            class="input"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>
        <button class="btn" type="submit" :disabled="loading">
          {{ loading ? "登录中..." : "登录" }}
        </button>
        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { login } from "@/api"; // 统一导入
import { setToken, setRoleNames, setUserInfo } from "@/utils/token";
//import { ElMessage } from "element-plus";

const router = useRouter();
const loading = ref(false);
const errorMsg = ref("");
const form = reactive({ username: "", password: "" });

async function onLogin() {
  errorMsg.value = "";
  const username = form.username.trim();
  const password = form.password;
  if (!username) return (errorMsg.value = "请输入用户名");
  if (!password) return (errorMsg.value = "请输入密码");

  loading.value = true;
  try {
    const data = await login({ username, password });
    if (!data?.token) throw new Error("登录成功但未返回 token");

    setToken(data.token);
    setRoleNames(data.roleNames || []);
    setUserInfo({ userId: data.userId, username: data.username });

    const redirect = router.currentRoute.value.query.redirect || "/users";
    await router.push(redirect);
  } catch (e) {
    errorMsg.value = e.message || "登录失败";
    //ElMessage.error(errorMsg.value);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  padding: 24px;
}
.card {
  width: 520px;
  max-width: 95vw;
  border: 1px solid #e5e5e5;
  background: #fff;
  padding: 28px;
}
.title {
  margin: 0 0 18px 0;
  font-size: 28px;
  font-weight: 700;
}
.field {
  margin-bottom: 16px;
}
.label {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
}
.input {
  width: 100%;
  box-sizing: border-box;
  height: 44px;
  padding: 0 12px;
  border: 1px solid #cfcfcf;
  outline: none;
  font-size: 16px;
}
.input:focus {
  border-color: #3b82f6;
}
.btn {
  width: 100%;
  height: 46px;
  border: 1px solid #333;
  background: #eee;
  cursor: pointer;
  font-size: 16px;
  margin-top: 6px;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.error {
  color: #d32f2f;
  margin-top: 12px;
  font-size: 15px;
}
</style>
