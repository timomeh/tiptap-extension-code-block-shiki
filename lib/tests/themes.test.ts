import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, expect, it, vi } from 'vitest'
import { CodeBlockShiki } from '../code-block-shiki'
import { resetHighlighter } from '../highlighter'

afterEach(() => {
  resetHighlighter()
})

it('initializes tiptap with codeblock using themes', async () => {
  const mount = document.createElement('div')
  new Editor({
    element: mount,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockShiki.configure({
        themes: {
          light: 'github-light',
          dark: 'github-dark',
        },
      }),
    ],
    content: `<p>Hello World!</p><pre><code class="language-ts">function foo() {
  return 'bar'
}</code></pre><pre><code class="language-css">.foo {
  color: green;
}</code></pre>`,
  })

  await vi.waitFor(() => {
    if (!mount.innerHTML.includes('class="shiki"'))
      throw new Error('not highlighted with themes')
  })

  expect(mount.innerHTML).toMatchInlineSnapshot(`
      "<div contenteditable="true" translate="no" tabindex="0" class="tiptap ProseMirror"><p>Hello World!</p><pre class="shiki" style="background-color: #fff; --shiki-dark-bg: #24292e; color: #24292e; --shiki-dark: #e1e4e8;"><code class="language-ts"><span style="color: #D73A49; --shiki-dark: #F97583;">function</span><span style="color: #24292E; --shiki-dark: #E1E4E8;"> </span><span style="color: #6F42C1; --shiki-dark: #B392F0;">foo</span><span style="color: #24292E; --shiki-dark: #E1E4E8;">() {</span>
      <span style="color: #24292E; --shiki-dark: #E1E4E8;">  </span><span style="color: #D73A49; --shiki-dark: #F97583;">return</span><span style="color: #24292E; --shiki-dark: #E1E4E8;"> </span><span style="color: #032F62; --shiki-dark: #9ECBFF;">'bar'</span>
      <span style="color: #24292E; --shiki-dark: #E1E4E8;">}</span></code></pre><pre class="shiki" style="background-color: #fff; --shiki-dark-bg: #24292e; color: #24292e; --shiki-dark: #e1e4e8;"><code class="language-css"><span style="color: #6F42C1; --shiki-dark: #B392F0;">.foo</span><span style="color: #24292E; --shiki-dark: #E1E4E8;"> {</span>
      <span style="color: #24292E; --shiki-dark: #E1E4E8;">  </span><span style="color: #005CC5; --shiki-dark: #79B8FF;">color</span><span style="color: #24292E; --shiki-dark: #E1E4E8;">: </span><span style="color: #005CC5; --shiki-dark: #79B8FF;">green</span><span style="color: #24292E; --shiki-dark: #E1E4E8;">;</span>
      <span style="color: #24292E; --shiki-dark: #E1E4E8;">}</span></code></pre></div>"
    `)
})

it('loads both light and dark themes on initialization', async () => {
  const mount = document.createElement('div')
  new Editor({
    element: mount,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockShiki.configure({
        themes: {
          light: 'github-light',
          dark: 'github-dark',
        },
      }),
    ],
    content: `<pre><code class="language-ts">function test() {}</code></pre>`,
  })

  await vi.waitFor(() => {
    if (!mount.innerHTML.includes('shiki')) throw new Error('themes not loaded')
  })

  const { getShiki } = await import('../highlighter')
  const highlighter = getShiki()

  expect(highlighter?.getLoadedThemes()).toContain('github-light')
  expect(highlighter?.getLoadedThemes()).toContain('github-dark')
})

it('applies themes mode styling with htmlStyle', async () => {
  const mount = document.createElement('div')
  new Editor({
    element: mount,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockShiki.configure({
        themes: {
          light: 'github-light',
          dark: 'github-dark',
        },
      }),
    ],
    content: `<pre><code class="language-ts">const x = 1</code></pre>`,
  })

  await vi.waitFor(() => {
    if (!mount.innerHTML.includes('style='))
      throw new Error('no styles applied')
  })

  expect(mount.querySelector('pre.shiki')).toBeTruthy()
})

it('handles setContent with themes configuration', async () => {
  const mount = document.createElement('div')
  const editor = new Editor({
    element: mount,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockShiki.configure({
        themes: {
          light: 'github-light',
          dark: 'github-dark',
        },
      }),
    ],
    content: `<p>Hello</p>`,
  })

  editor.commands.setContent(
    `<pre><code class="language-css">.test { color: red; }</code></pre>`,
  )

  await vi.waitFor(() => {
    if (!mount.innerHTML.includes('shiki')) throw new Error('not highlighted')
  })

  expect(mount.querySelector('pre.shiki')).toBeTruthy()
})

it('handles toggleCodeBlock with themes', async () => {
  const mount = document.createElement('div')
  const editor = new Editor({
    element: mount,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockShiki.configure({
        themes: {
          light: 'github-light',
          dark: 'github-dark',
        },
      }),
    ],
    content: `<p>const foo = 'bar'</p>`,
  })

  editor.chain().focus().toggleCodeBlock({ language: 'ts' }).run()

  await vi.waitFor(() => {
    if (!mount.innerHTML.includes('shiki'))
      throw new Error('not highlighted with themes')
  })

  expect(mount.querySelector('pre.shiki')).toBeTruthy()
})

it('highlights while typing with themes configuration', async () => {
  const mount = document.createElement('div')
  const editor = new Editor({
    element: mount,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockShiki.configure({
        themes: {
          light: 'github-light',
          dark: 'github-dark',
        },
      }),
    ],
  })

  editor
    .chain()
    .focus('end')
    .toggleCodeBlock({ language: 'ts' })
    .insertContent('const')
    .run()

  await vi.waitFor(() => {
    if (!mount.innerHTML.includes('shiki')) throw new Error('not highlighted')
  })

  expect(mount.querySelector('pre.shiki')).toBeTruthy()

  editor.commands.insertContent(' x = 1')

  expect(mount.querySelector('pre.shiki')).toBeTruthy()
})

it('falls back gracefully when themes not provided', async () => {
  const mount = document.createElement('div')
  new Editor({
    element: mount,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockShiki.configure({
        defaultTheme: 'tokyo-night',
      }),
    ],
    content: `<pre><code class="language-ts">const foo = 'bar'</code></pre>`,
  })

  await vi.waitFor(() => {
    if (!mount.innerHTML.includes('<span')) throw new Error('not highlighted')
  })

  expect(mount.querySelector('pre.shiki')).toBeNull()
  expect(mount.innerHTML).toContain('background-color')
})
