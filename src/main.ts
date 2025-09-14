import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
// import CodeBlockShiki from '../dist/tiptap-extension-code-block-shiki'
import CodeBlockShiki from '../lib'

import './style.css'

const editor = new Editor({
  element: document.querySelector('#editor')!,
  extensions: [
    StarterKit.configure({ codeBlock: false }),
    CodeBlockShiki.configure({
      defaultTheme: 'tokyo-night',
      // TODO: add an option for dual themes (light/dark)
    }),
  ],
  content: `<p>Hello World!</p><pre><code class="language-ts">function foo() {
  return 'bar'
}</code></pre><pre><code class="language-css">.foo {
  color: green;
}</code></pre>`,
})

// @ts-ignore
window.editor = editor
