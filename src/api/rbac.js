import request from "@/utils/request";

/**
 * 为角色分配权限
 * @param {number} roleId
 * @param {Array<number>} permIds
 * @returns {Promise}
 */
export function assignPermsToRole(roleId, permIds = []) {
  return request({
    url: `/api/rbac/roles/${roleId}/perms`,
    method: "put",
    data: { permIds },
  });
}

/**
 * 获取角色的权限ID列表
 * @param {number} roleId
 * @returns {Promise<Array<number>>}
 */
export function getPermIdsByRoleId(roleId) {
  return request({
    url: `/api/rbac/roles/${roleId}/perm-ids`,
    method: "get",
  });
}

/**
 * 为用户分配角色
 * @param {number} userId
 * @param {Array<number>} roleIds
 * @returns {Promise}
 */
export function assignRolesToUser(userId, roleIds = []) {
  return request({
    url: `/api/rbac/users/${userId}/roles`,
    method: "put",
    data: { roleIds },
  });
}

/**
 * 获取用户的角色ID列表
 * @param {number} userId
 * @returns {Promise<Array<number>>}
 */
export function getRoleIdsByUserId(userId) {
  return request({
    url: `/api/rbac/users/${userId}/role-ids`,
    method: "get",
  });
}

/**
 * 获取用户的权限码列表
 * @param {number} userId
 * @returns {Promise<Array<string>>}
 */
export function getPermCodesByUserId(userId) {
  return request({
    url: `/api/rbac/users/${userId}/perm-codes`,
    method: "get",
  });
}
