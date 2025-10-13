import { resolve } from 'node:path'
import dts from 'unplugin-dts/vite'
import { defineConfig } from 'vite'
import pkg from './package.json'

export default defineConfig({
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      formats: ['es'],
      name: pkg.name,
      fileName: pkg.name,
    },
    rollupOptions: {
      external: [/@tiptap\/pm\/.*/, 'shiki'],
    },
  },
  plugins: [dts({ bundleTypes: true })],
  test: {
    environment: 'happy-dom',
  },
})
