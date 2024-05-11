import { it, expect, afterEach, vi } from 'vitest'
import { resetHighlighter } from '../highlighter'

import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { CodeBlockShiki } from '../code-block-shiki'

afterEach(() => {
  resetHighlighter()
})

it('initializes tiptap with the codeblock', async () => {
  const mount = document.createElement('div')
  new Editor({
    element: mount,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockShiki.configure({ defaultTheme: 'tokyo-night' }),
    ],
    content: `<p>Hello World!</p><pre><code class="language-ts">function foo() {
  return 'bar'
}</code></pre><pre><code class="language-css">.foo {
  color: green;
}</code></pre>`,
  })

  await vi.waitFor(() => {
    if (!mount.innerHTML.includes('<span style="color: #BB9AF7;">'))
      throw new Error('not ts highlighted')
    if (!mount.innerHTML.includes('<span style="color: #E0AF68;">'))
      throw new Error('not css highlighted')
  })

  expect(mount.innerHTML).toMatchInlineSnapshot(`
    "<div contenteditable="true" translate="no" tabindex="0" class="tiptap ProseMirror"><p>Hello World!</p><pre><code class="language-ts"><span style="color: #BB9AF7;">function</span><span style="color: #A9B1D6;"> </span><span style="color: #7AA2F7;">foo</span><span style="color: #9ABDF5;">()</span><span style="color: #A9B1D6;"> </span><span style="color: #9ABDF5;">{</span>
    <span style="color: #9ABDF5;">  </span><span style="color: #BB9AF7;">return</span><span style="color: #9ABDF5;"> </span><span style="color: #89DDFF;">'</span><span style="color: #9ECE6A;">bar</span><span style="color: #89DDFF;">'</span>
    <span style="color: #9ABDF5;">}</span></code></pre><pre><code class="language-css"><span style="color: #E0AF68;">.</span><span style="color: #9ECE6A;">foo</span><span style="color: #A9B1D6;"> </span><span style="color: #9ABDF5;">{</span>
    <span style="color: #9ABDF5;">  </span><span style="color: #7AA2F7;">color</span><span style="color: #89DDFF;">:</span><span style="color: #9ABDF5;"> </span><span style="color: #FF9E64;">green</span><span style="color: #89DDFF;">;</span>
    <span style="color: #9ABDF5;">}</span></code></pre></div>"
  `)
})

it('highlights code with #setContent', async () => {
  const mount = document.createElement('div')
  const editor = new Editor({
    element: mount,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockShiki.configure({ defaultTheme: 'tokyo-night' }),
    ],
    content: `<p>Hello World!</p>`,
  })

  editor.commands
    .setContent(`<p>Hello World!</p><pre><code class="language-ts">function foo() {
  return 'bar'
}</code></pre><pre><code class="language-css">.foo {
  color: green;
}</code></pre>`)

  await vi.waitFor(() => {
    if (!mount.innerHTML.includes('<span style="color: #BB9AF7;">'))
      throw new Error('not ts highlighted')
    if (!mount.innerHTML.includes('<span style="color: #7AA2F7;">'))
      throw new Error('not css highlighted')
  })

  expect(mount.innerHTML).toMatchInlineSnapshot(`
    "<div contenteditable="true" translate="no" tabindex="0" class="tiptap ProseMirror"><p>Hello World!</p><pre><code class="language-ts"><span style="color: #BB9AF7;">function</span><span style="color: #A9B1D6;"> </span><span style="color: #7AA2F7;">foo</span><span style="color: #9ABDF5;">()</span><span style="color: #A9B1D6;"> </span><span style="color: #9ABDF5;">{</span>
    <span style="color: #9ABDF5;">  </span><span style="color: #BB9AF7;">return</span><span style="color: #9ABDF5;"> </span><span style="color: #89DDFF;">'</span><span style="color: #9ECE6A;">bar</span><span style="color: #89DDFF;">'</span>
    <span style="color: #9ABDF5;">}</span></code></pre><pre><code class="language-css"><span style="color: #E0AF68;">.</span><span style="color: #9ECE6A;">foo</span><span style="color: #A9B1D6;"> </span><span style="color: #9ABDF5;">{</span>
    <span style="color: #9ABDF5;">  </span><span style="color: #7AA2F7;">color</span><span style="color: #89DDFF;">:</span><span style="color: #9ABDF5;"> </span><span style="color: #FF9E64;">green</span><span style="color: #89DDFF;">;</span>
    <span style="color: #9ABDF5;">}</span></code></pre></div>"
  `)
})

it('highlights content with #toggleCodeBlock', async () => {
  const mount = document.createElement('div')
  const editor = new Editor({
    element: mount,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockShiki.configure({ defaultTheme: 'tokyo-night' }),
    ],
    content: `<p>const foo = 'bar'</p>`,
  })

  editor.chain().focus().toggleCodeBlock({ language: 'ts' }).run()

  await vi.waitFor(() => {
    if (!mount.innerHTML.includes('<span'))
      throw new Error('not ts highlighted')
  })

  expect(mount.innerHTML).toMatchInlineSnapshot(
    `"<div contenteditable="true" translate="no" tabindex="0" class="tiptap ProseMirror"><pre><code class="language-ts"><span style="color: #9D7CD8;">const</span><span style="color: #A9B1D6;"> </span><span style="color: #BB9AF7;">foo</span><span style="color: #A9B1D6;"> </span><span style="color: #89DDFF;">=</span><span style="color: #A9B1D6;"> </span><span style="color: #89DDFF;">'</span><span style="color: #9ECE6A;">bar</span><span style="color: #89DDFF;">'</span></code></pre></div>"`,
  )
})

it('highlights code while typing', async () => {
  const mount = document.createElement('div')
  const editor = new Editor({
    element: mount,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockShiki.configure({ defaultTheme: 'tokyo-night' }),
    ],
  })

  editor
    .chain()
    .focus('end')
    .toggleCodeBlock({ language: 'ts' })
    .insertContent('const')
    .run()

  await vi.waitFor(() => {
    if (!mount.innerHTML.includes('<span'))
      throw new Error('not ts highlighted')
  })

  expect(mount.innerHTML).toMatchInlineSnapshot(
    `"<div contenteditable="true" translate="no" tabindex="0" class="tiptap ProseMirror"><pre><code class="language-ts"><span style="color: #9D7CD8;">const</span></code></pre></div>"`,
  )

  editor.commands.insertContent(' foo')
  expect(mount.innerHTML).toMatchInlineSnapshot(
    `"<div contenteditable="true" translate="no" tabindex="0" class="tiptap ProseMirror"><pre><code class="language-ts"><span style="color: #9D7CD8;">const</span><span style="color: #A9B1D6;"> </span><span style="color: #BB9AF7;">foo</span></code></pre></div>"`,
  )

  editor.commands.insertContent(' = "bar"')
  expect(mount.innerHTML).toMatchInlineSnapshot(
    `"<div contenteditable="true" translate="no" tabindex="0" class="tiptap ProseMirror"><pre><code class="language-ts"><span style="color: #9D7CD8;">const</span><span style="color: #A9B1D6;"> </span><span style="color: #BB9AF7;">foo</span><span style="color: #A9B1D6;"> </span><span style="color: #89DDFF;">=</span><span style="color: #A9B1D6;"> </span><span style="color: #89DDFF;">"</span><span style="color: #9ECE6A;">bar</span><span style="color: #89DDFF;">"</span></code></pre></div>"`,
  )

  editor.commands.insertContent(`;
console.log('hello')`)
  expect(mount.innerHTML).toMatchInlineSnapshot(`
    "<div contenteditable="true" translate="no" tabindex="0" class="tiptap ProseMirror"><pre><code class="language-ts"><span style="color: #9D7CD8;">const</span><span style="color: #A9B1D6;"> </span><span style="color: #BB9AF7;">foo</span><span style="color: #A9B1D6;"> </span><span style="color: #89DDFF;">=</span><span style="color: #A9B1D6;"> </span><span style="color: #89DDFF;">"</span><span style="color: #9ECE6A;">bar</span><span style="color: #89DDFF;">"</span><span style="color: #89DDFF;">;</span>
    <span style="color: #C0CAF5;">console</span><span style="color: #89DDFF;">.</span><span style="color: #7AA2F7;">log</span><span style="color: #9ABDF5;">(</span><span style="color: #89DDFF;">'</span><span style="color: #9ECE6A;">hello</span><span style="color: #89DDFF;">'</span><span style="color: #9ABDF5;">)</span></code></pre></div>"
  `)
})
