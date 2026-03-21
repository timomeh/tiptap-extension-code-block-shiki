import CodeBlock, { type CodeBlockOptions } from '@tiptap/extension-code-block'
import type { BundledLanguage, BundledTheme, ThemeRegistration } from 'shiki'

import { ShikiPlugin } from './shiki-plugin.ts'

/* v8 ignore start -- @preserve */
export interface CodeBlockShikiOptions extends CodeBlockOptions {
  defaultLanguage: BundledLanguage | null | undefined
  // `(string & {})` preserves IDE autocomplete for BundledTheme while accepting custom theme names
  defaultTheme: BundledTheme | (string & {})
  themes:
    | {
        light: BundledTheme
        dark: BundledTheme
      }
    | null
    | undefined
  customThemes: ThemeRegistration[] | null | undefined
}
/* v8 ignore stop -- @preserve */

export const CodeBlockShiki = CodeBlock.extend<CodeBlockShikiOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      defaultLanguage: null,
      defaultTheme: 'github-dark' as BundledTheme,
      themes: null,
      customThemes: null,
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
        customThemes: this.options.customThemes,
      }),
    ]
  },
})
