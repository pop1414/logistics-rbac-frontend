import http from "./http";

export function assignPermsToRole(roleId, permIds) {
  return http.put(`/api/rbac/roles/${roleId}/perms`, { permIds });
}

export function assignRolesToUser(userId, roleIds) {
  return http.put(`/api/rbac/users/${userId}/roles`, { roleIds });
}

export function getUserPermCodes(userId) {
  return http.get(`/api/rbac/users/${userId}/perm-codes`);
}

/**
 * 可选：如果你后端实现了回显接口，就打开用
 * 没有也不影响保存授权，只是“回显已有权限”会缺失
 */
export function getRolePermIds(roleId) {
  return http.get(`/api/rbac/roles/${roleId}/perm-ids`);
}
