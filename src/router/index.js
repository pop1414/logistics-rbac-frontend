import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", redirect: "/users" },
  { path: "/users", component: () => import("../views/UsersView.vue") },
  { path: "/roles", component: () => import("../views/RolesView.vue") },
  {
    path: "/permissions",
    component: () => import("../views/PermissionsView.vue"),
  },
  {
    path: "/role-grant",
    component: () => import("../views/RoleGrantView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
