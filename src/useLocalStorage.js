import { useState, useEffect } from "react";

// ===== 自定义 Hook：把 localStorage 逻辑抽成可复用函数 =====
// 普通函数只是算值，Hook 函数内部用了 useState/useEffect，
// 所以名字必须以 use 开头（React 的约定）
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
