import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", redirect: "/users" },

  // 白名单：不需要登录也能访问
  {
    path: "/login",
    component: () => import("../views/LoginView.vue"),
    meta: { public: true },
  },

  // 需要登录
  {
    path: "/users",
    component: () => import("../views/UsersView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/roles",
    component: () => import("../views/RolesView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/permissions",
    component: () => import("../views/PermissionsView.vue"),
    meta: { requiresAuth: true },
  },

  // RBAC 授权页：只允许 super_admin
  {
    path: "/role-grant",
    component: () => import("../views/RoleGrantView.vue"),
    meta: { requiresAuth: true, roles: ["super_admin"] },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// ===== 路由守卫 =====
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const roleNames = safeParseJson(localStorage.getItem("roleNames")) || [];

  // 1) 公开页面直接放行
  if (to.meta?.public) {
    // 已登录访问 /login：直接踢回首页
    if (to.path === "/login" && token) return next("/");
    return next();
  }

  // 2) 需要登录但没有 token：去登录
  if (to.meta?.requiresAuth && !token) {
    return next({ path: "/login", query: { redirect: to.fullPath } });
  }

  // 3) 角色校验（只有某些页面需要）
  const needRoles = to.meta?.roles;
  if (Array.isArray(needRoles) && needRoles.length > 0) {
    const ok = roleNames.some((r) => needRoles.includes(r));
    if (!ok) {
      // 你也可以改成 next("/403") 做个提示页
      return next("/");
    }
  }

  return next();
});

function safeParseJson(str) {
  try {
    return str ? JSON.parse(str) : null;
  } catch (e) {
    return null;
  }
}

export default router;
