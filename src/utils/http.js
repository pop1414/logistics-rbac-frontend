import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/", // 用环境变量替换硬编码，便于dev/prod切换
  timeout: 15000,
});

// 请求拦截：自动添加token
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 假设后端用Bearer token
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// 响应拦截：统一处理code
http.interceptors.response.use(
  (resp) => {
    const data = resp.data;
    if (typeof data.code !== "undefined") {
      if (data.code === 200) {
        return data.data; // 解包data
      }
      // 非200：reject带message
      return Promise.reject(new Error(data.message || "请求失败"));
    }
    return data; // 兼容直接返回数据
  },
  (err) => {
    // 全局错误：如401跳转登录
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // 或用router
    }
    return Promise.reject(new Error(err.message || "网络错误"));
  }
);

export default http;
