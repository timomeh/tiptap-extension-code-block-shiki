import { resolve } from 'node:path'
import { codecovVitePlugin } from '@codecov/vite-plugin'
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
  plugins: [
    dts({ bundleTypes: true }),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: 'tiptap-extension-code-block-shiki',
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
  test: {
    environment: 'happy-dom',
    coverage: {
      include: ['lib/**'],
    },
  },
})
