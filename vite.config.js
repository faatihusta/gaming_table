import { defineConfig } from 'vite'

export default defineConfig({
  base: '/gaming_table/',
  build: {
    outDir: 'docs',
    emptyOutDir: true
  }
})
