import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
// import CodeBlockShiki from '../dist/tiptap-extension-code-block-shiki'
import CodeBlockShiki from '../lib'

import './style.css'

const element = document.querySelector('#editor')
if (!element) throw new Error('#editor not in DOM')

const editor = new Editor({
  element,
  extensions: [
    StarterKit.configure({ codeBlock: false }),
    CodeBlockShiki.configure({
      defaultTheme: 'tokyo-night',
    }),
  ],
  content: `<p>Hello World!</p><pre><code class="language-ts">function foo() {
  return 'bar'
}</code></pre><pre><code class="language-css">.foo {
  color: green;
}</code></pre>`,
})

// @ts-expect-error
window.editor = editor
