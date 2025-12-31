import request from "@/utils/request";

/**
 * 列出用户（分页）
 * @param {Object} params - { pageNum=1, pageSize=10, username? }
 * @returns {Promise} - 用户列表
 */
export function listUsers(params = { pageNum: 1, pageSize: 10 }) {
  return request({
    url: "/api/users",
    method: "get",
    params,
  });
}

/**
 * 创建用户
 * @param {Object} data - 用户数据
 * @returns {Promise}
 */
export function createUser(data) {
  return request({
    url: "/api/users",
    method: "post",
    data,
  });
}

/**
 * 获取用户详情
 * @param {number} userId
 * @returns {Promise}
 */
export function getUserDetail(userId) {
  return request({
    url: `/api/users/${userId}`,
    method: "get",
  });
}

/**
 * 更新用户
 * @param {number} userId
 * @param {Object} data
 * @returns {Promise}
 */
export function updateUser(userId, data) {
  return request({
    url: `/api/users/${userId}`,
    method: "put",
    data,
  });
}

/**
 * 更新用户密码
 * @param {number} userId
 * @param {Object} data - { password }
 * @returns {Promise}
 */
export function updateUserPassword(userId, data) {
  return request({
    url: `/api/users/${userId}/password`,
    method: "put",
    data,
  });
}

/**
 * 删除用户
 * @param {number} userId
 * @returns {Promise}
 */
export function deleteUser(userId) {
  return request({
    url: `/api/users/${userId}`,
    method: "delete",
  });
}
