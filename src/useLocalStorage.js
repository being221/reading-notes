import { useState, useEffect } from "react";

// ===== 自定义 Hook：安全版 localStorage =====
// 微信等环境可能拦截 localStorage，try/catch 防止崩溃
function safeGet(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 静默失败——微信等环境下存储不可用
  }
}

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => safeGet(key, initialValue));

  useEffect(() => {
    safeSet(key, value);
  }, [key, value]);

  return [value, setValue];
}
