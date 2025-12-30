import http from "./http";

export function listUsers(params) {
  return http.get("/api/users", { params });
}

export function getUserDetail(id) {
  return http.get(`/api/users/${id}`);
}

export function createUser(body) {
  return http.post("/api/users", body);
}

export function updateUser(id, body) {
  return http.put(`/api/users/${id}`, body);
}

export function updateUserPassword(id, body) {
  return http.put(`/api/users/${id}/password`, body);
}

export function deleteUser(id) {
  return http.delete(`/api/users/${id}`);
}
