import request from "@/utils/request";

/**
 * 列出角色（分页）
 * @param {Object} params - { pageNum=1, pageSize=10, roleName? }
 * @returns {Promise} - 角色列表
 */
export function listRoles(params = { pageNum: 1, pageSize: 10 }) {
  return request({
    url: "/api/roles",
    method: "get",
    params,
  });
}

/**
 * 创建角色
 * @param {Object} data - 角色数据
 * @returns {Promise}
 */
export function createRole(data) {
  return request({
    url: "/api/roles",
    method: "post",
    data,
  });
}

/**
 * 获取角色详情
 * @param {number} roleId
 * @returns {Promise}
 */
export function getRoleDetail(roleId) {
  return request({
    url: `/api/roles/${roleId}`,
    method: "get",
  });
}

/**
 * 更新角色
 * @param {number} roleId
 * @param {Object} data
 * @returns {Promise}
 */
export function updateRole(roleId, data) {
  return request({
    url: `/api/roles/${roleId}`,
    method: "put",
    data,
  });
}

/**
 * 删除角色
 * @param {number} roleId
 * @returns {Promise}
 */
export function deleteRole(roleId) {
  return request({
    url: `/api/roles/${roleId}`,
    method: "delete",
  });
}
