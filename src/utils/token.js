// src/utils/token.js
export function setToken(token) {
  localStorage.setItem("token", token);
  console.log("setToken 已设置:", localStorage.getItem("token")); // 调试
  // 派发 storage 事件，模拟变化
  window.dispatchEvent(
    new StorageEvent("storage", { key: "token", newValue: token })
  );
}

export function removeToken() {
  const oldValue = localStorage.getItem("token");
  localStorage.removeItem("token");
  console.log("removeToken 已移除"); // 调试
  window.dispatchEvent(
    new StorageEvent("storage", { key: "token", oldValue, newValue: null })
  );
}

export function setRoleNames(roleNames) {
  localStorage.setItem("roleNames", JSON.stringify(roleNames));
  console.log("setRoleNames 已设置:", localStorage.getItem("roleNames")); // 调试
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "roleNames",
      newValue: JSON.stringify(roleNames),
    })
  );
}

export function removeRoleNames() {
  const oldValue = localStorage.getItem("roleNames");
  localStorage.removeItem("roleNames");
  console.log("removeRoleNames 已移除"); // 调试
  window.dispatchEvent(
    new StorageEvent("storage", { key: "roleNames", oldValue, newValue: null })
  );
}

export function setUserInfo(userInfo) {
  localStorage.setItem("userInfo", JSON.stringify(userInfo));
  console.log("setUserInfo 已设置:", localStorage.getItem("userInfo")); // 调试
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "userInfo",
      newValue: JSON.stringify(userInfo),
    })
  );
}

export function removeUserInfo() {
  const oldValue = localStorage.getItem("userInfo");
  localStorage.removeItem("userInfo");
  console.log("removeUserInfo 已移除"); // 调试
  window.dispatchEvent(
    new StorageEvent("storage", { key: "userInfo", oldValue, newValue: null })
  );
}

export function getUserInfo() {
  return safeParseJson(localStorage.getItem("userInfo")) || null;
}

function safeParseJson(str) {
  try {
    return str ? JSON.parse(str) : null;
  } catch (e) {
    console.error("JSON 解析失败:", e);
    return null;
  }
}
