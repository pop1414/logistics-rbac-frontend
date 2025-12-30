import http from "./http";

export function listRoles(params) {
  return http.get("/api/roles", { params });
}

export function getRoleDetail(id) {
  return http.get(`/api/roles/${id}`);
}

export function createRole(body) {
  return http.post("/api/roles", body);
}

export function updateRole(id, body) {
  return http.put(`/api/roles/${id}`, body);
}

export function deleteRole(id) {
  return http.delete(`/api/roles/${id}`);
}
