import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11'],
      renderModernChunks: false,  // 不生成 module 脚本，统一用普通 script，微信兼容
    }),
  ],
  base: "/reading-notes/",
})
