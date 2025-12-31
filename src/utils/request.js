import http from "./http";

// 通用request函数，便于扩展
export default function request(config) {
  return http(config);
}
