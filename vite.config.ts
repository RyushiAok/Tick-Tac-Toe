import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths';
// https://vitejs.dev/config/
// https://chaika.hatenablog.com/entry/2022/05/14/083000
export default defineConfig({ 
  build: {
    // root (= ./src) から見た相対パスで指定
    outDir: './dist',
  },
  server: {
    open: true,
  },
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': 'src'  
    }
  },
})
