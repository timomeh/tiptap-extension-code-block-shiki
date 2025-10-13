import { resolve } from 'node:path'
import webpackStatsPlugin from 'rollup-plugin-webpack-stats'
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
    process.env.BUNDLESIZE === 'true'
      ? webpackStatsPlugin({ fileName: 'stats.json' })
      : false,
    dts({ bundleTypes: true }),
  ].filter(Boolean),
  test: {
    environment: 'happy-dom',
    coverage: {
      include: ['lib/**'],
    },
  },
})
