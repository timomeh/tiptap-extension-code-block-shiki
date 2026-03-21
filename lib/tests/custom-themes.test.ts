import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import type { ThemeRegistration } from 'shiki'
import { afterEach, expect, it, vi } from 'vitest'
import { CodeBlockShiki } from '../code-block-shiki'
import { resetHighlighter } from '../highlighter'

afterEach(() => {
  resetHighlighter()
})

const myCustomTheme: ThemeRegistration = {
  name: 'my-custom-theme',
  type: 'dark',
  colors: {
    'editor.background': '#1e1e2e',
    'editor.foreground': '#cdd6f4',
  },
  tokenColors: [
    {
      scope: ['keyword', 'storage.type'],
      settings: { foreground: '#cba6f7' },
    },
    {
      scope: ['string'],
      settings: { foreground: '#a6e3a1' },
    },
    {
      scope: ['entity.name.function'],
      settings: { foreground: '#89b4fa' },
    },
  ],
}

it('initializes tiptap with a custom theme', async () => {
  const mount = document.createElement('div')
  new Editor({
    element: mount,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockShiki.configure({
        defaultTheme: 'my-custom-theme',
        customThemes: [myCustomTheme],
      }),
    ],
    content: `<pre><code class="language-ts">function foo() { return 'bar' }</code></pre>`,
  })

  await vi.waitFor(() => {
    if (!mount.innerHTML.includes('style="color: #CBA6F7;"'))
      throw new Error('custom theme keyword color not applied')
  })

  expect(mount.innerHTML).toContain('background-color: #1e1e2e')
  expect(mount.innerHTML).toContain('color: #CBA6F7;') // keyword: function, return
  expect(mount.innerHTML).toContain('color: #89B4FA;') // entity.name.function: foo
  expect(mount.innerHTML).toContain('color: #A6E3A1;') // string: 'bar'
})

it('uses custom theme alongside bundled theme', async () => {
  const mount = document.createElement('div')
  new Editor({
    element: mount,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockShiki.configure({
        defaultTheme: 'github-dark',
        customThemes: [myCustomTheme],
      }),
    ],
    content: `<pre><code class="language-ts">const x = 1</code></pre>`,
  })

  await vi.waitFor(() => {
    if (!mount.innerHTML.includes('background-color: #24292e'))
      throw new Error('github-dark bg not applied')
  })

  expect(mount.innerHTML).toContain('background-color: #24292e')
})
