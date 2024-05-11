/**
 * This plugin is heavily inspired by:
 *  - https://github.com/ueberdosis/tiptap/tree/main/packages/extension-code-block-lowlight by tiptap
 *  - https://github.com/ocavue/prosemirror-highlight by ocavue
 *
 * I just mashed those two together and added support for async initialization.
 */

import { CodeBlockShiki } from './code-block-shiki.ts'

export * from './code-block-shiki.ts'

export default CodeBlockShiki
