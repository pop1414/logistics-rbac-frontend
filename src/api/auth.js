import request from "@/utils/request";

/**
 * 用户登录
 * @param {Object} data - { username, password }
 * @returns {Promise} - { token, userId, username, roleNames }
 */
export function login(data) {
  return request({
    url: "/api/auth/login",
    method: "post",
    data,
  });
}
