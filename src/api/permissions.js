import request from "@/utils/request";

/**
 * 列出权限（分页）
 * @param {Object} params - { pageNum=1, pageSize=1000, module?, permName? }
 * @returns {Promise} - 权限列表
 */
export function listPermissions(params = { pageNum: 1, pageSize: 1000 }) {
  return request({
    url: "/api/permissions",
    method: "get",
    params,
  });
}
