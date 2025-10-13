import { Node } from '@tiptap/core'
import { expect, it } from 'vitest'

it('exports a default', async () => {
  const mod = await import('../index')
  expect(mod.default).toBeInstanceOf(Node)
})

it('exports named CodeBlockShiki', async () => {
  const mod = await import('../index')
  expect(mod.CodeBlockShiki).toBeInstanceOf(Node)
})
