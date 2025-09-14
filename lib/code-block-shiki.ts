import CodeBlock, { CodeBlockOptions } from '@tiptap/extension-code-block'
import { BundledLanguage, BundledTheme } from 'shiki'

import { ShikiPlugin } from './shiki-plugin.ts'

export interface CodeBlockShikiOptions extends CodeBlockOptions {
  defaultLanguage: BundledLanguage | null | undefined
  defaultTheme: BundledTheme
  // TODO: add support for default dual themes.
  // Adding dual themes should not be a breaking change; `defaultTheme` should
  // continue to work like it always did.
}

export const CodeBlockShiki = CodeBlock.extend<CodeBlockShikiOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      defaultLanguage: null,
      defaultTheme: 'github-dark',
    }
  },

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() || []),
      ShikiPlugin({
        name: this.name,
        defaultLanguage: this.options.defaultLanguage,
        defaultTheme: this.options.defaultTheme,
      }),
    ]
  },
})
