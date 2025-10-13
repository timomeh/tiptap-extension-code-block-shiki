import CodeBlock, { type CodeBlockOptions } from '@tiptap/extension-code-block'
import type { BundledLanguage, BundledTheme } from 'shiki'

import { ShikiPlugin } from './shiki-plugin.ts'

export interface CodeBlockShikiOptions extends CodeBlockOptions {
  defaultLanguage: BundledLanguage | null | undefined
  defaultTheme: BundledTheme
  themes:
    | {
        light: BundledTheme
        dark: BundledTheme
      }
    | null
    | undefined
}

export const CodeBlockShiki = CodeBlock.extend<CodeBlockShikiOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      defaultLanguage: null,
      defaultTheme: 'github-dark' as BundledTheme,
      themes: null,
    } as CodeBlockShikiOptions
  },

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() || []),
      ShikiPlugin({
        name: this.name,
        defaultLanguage: this.options.defaultLanguage,
        defaultTheme: this.options.defaultTheme,
        themes: this.options.themes,
      }),
    ]
  },
})
