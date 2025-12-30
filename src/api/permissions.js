import http from "./http";

export function listPermissions(params) {
  return http.get("/api/permissions", { params });
}
