import axios from "axios";

const http = axios.create({
  baseURL: "/", // 走 devServer proxy
  timeout: 15000,
});

// 响应拦截：你后端成功码是 200（你已改成 200）
http.interceptors.response.use(
  (resp) => {
    const data = resp.data;
    // 兼容：有的接口可能直接返回数据，不包 ApiResponse（保险）
    if (data && typeof data.code !== "undefined") {
      if (data.code === 200) return data.data;
      return Promise.reject(new Error(data.message || "请求失败"));
    }
    return data;
  },
  (err) => Promise.reject(err)
);

export default http;
