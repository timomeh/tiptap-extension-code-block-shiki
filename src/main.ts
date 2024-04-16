import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockShiki from '../dist/tiptap-extension-code-block-shiki'

import './style.css'

new Editor({
  element: document.querySelector('#editor')!,
  extensions: [
    StarterKit.configure({ codeBlock: false }),
    CodeBlockShiki.configure({ defaultTheme: 'tokyo-night' }),
  ],
  content: '<p>Hello World!</p>',
})
