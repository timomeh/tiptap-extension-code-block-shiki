import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import pkg from './package.json'

export default defineConfig({
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      formats: ['es', 'cjs'],
      name: pkg.name,
      fileName: pkg.name,
    },
    rollupOptions: {
      external: [/@tiptap\/pm\/.*/, 'shiki'],
    },
  },
  plugins: [dts({ rollupTypes: true })],
  test: {
    environment: 'happy-dom',
  },
})
