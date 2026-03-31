import { Editor } from '@tiptap/core'
import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect, it } from 'vitest'
import { CodeBlockShiki } from '../code-block-shiki'

// biome-ignore lint/style/noNonNullAssertion: test
const parseMarkdown = CodeBlockShiki.config.parseMarkdown!
// biome-ignore lint/style/noNonNullAssertion: test
const renderMarkdown = CodeBlockShiki.config.renderMarkdown!

it('has markdownTokenName set to "code"', () => {
  expect(CodeBlockShiki.config.markdownTokenName).toBe('code')
})

describe('parseMarkdown', () => {
  const helpers = {
    // biome-ignore lint/suspicious/noExplicitAny: test
    createNode: (type: string, attrs: any, content: any[]) => ({
      type,
      attrs,
      content,
    }),
    createTextNode: (text: string) => ({ type: 'text', text }),
  }

  it('parses a fenced code block with backticks', () => {
    const token = {
      type: 'code',
      raw: '```ts\nconst x = 1\n```',
      lang: 'ts',
      text: 'const x = 1',
    }

    // biome-ignore lint/suspicious/noExplicitAny: test
    const result = parseMarkdown(token, helpers as any)
    expect(result).toEqual({
      type: 'codeBlock',
      attrs: { language: 'ts' },
      content: [{ type: 'text', text: 'const x = 1' }],
    })
  })

  it('parses a fenced code block with tildes', () => {
    const token = {
      type: 'code',
      raw: '~~~js\nalert("hi")\n~~~',
      lang: 'js',
      text: 'alert("hi")',
    }

    // biome-ignore lint/suspicious/noExplicitAny: test
    const result = parseMarkdown(token, helpers as any)
    expect(result).toEqual({
      type: 'codeBlock',
      attrs: { language: 'js' },
      content: [{ type: 'text', text: 'alert("hi")' }],
    })
  })

  it('parses an indented code block', () => {
    const token = {
      type: 'code',
      raw: '    const x = 1',
      codeBlockStyle: 'indented',
      text: 'const x = 1',
    }

    // biome-ignore lint/suspicious/noExplicitAny: test
    const result = parseMarkdown(token, helpers as any)
    expect(result).toEqual({
      type: 'codeBlock',
      attrs: { language: null },
      content: [{ type: 'text', text: 'const x = 1' }],
    })
  })

  it('parses a code block without language', () => {
    const token = {
      type: 'code',
      raw: '```\nhello\n```',
      lang: '',
      text: 'hello',
    }

    // biome-ignore lint/suspicious/noExplicitAny: test
    const result = parseMarkdown(token, helpers as any)
    expect(result).toEqual({
      type: 'codeBlock',
      attrs: { language: null },
      content: [{ type: 'text', text: 'hello' }],
    })
  })

  it('parses an empty code block', () => {
    const token = {
      type: 'code',
      raw: '```ts\n```',
      lang: 'ts',
      text: '',
    }

    // biome-ignore lint/suspicious/noExplicitAny: test
    const result = parseMarkdown(token, helpers as any)
    expect(result).toEqual({
      type: 'codeBlock',
      attrs: { language: 'ts' },
      content: [],
    })
  })

  it('skips inline code tokens', () => {
    const token = {
      type: 'code',
      raw: '`inline`',
      text: 'inline',
    }

    // biome-ignore lint/suspicious/noExplicitAny: test
    const result = parseMarkdown(token, helpers as any)
    expect(result).toEqual([])
  })
})

describe('renderMarkdown', () => {
  const helpers = {
    // biome-ignore lint/suspicious/noExplicitAny: test
    renderChildren: (content: any) => content.map((n: any) => n.text).join(''),
  }

  it('renders a code block with language', () => {
    const node = {
      type: 'codeBlock',
      attrs: { language: 'ts' },
      content: [{ type: 'text', text: 'const x = 1' }],
    }

    // biome-ignore lint/suspicious/noExplicitAny: test
    const result = renderMarkdown(node, helpers as any, {} as any)
    expect(result).toBe('```ts\nconst x = 1\n```')
  })

  it('renders a code block without language', () => {
    const node = {
      type: 'codeBlock',
      attrs: {},
      content: [{ type: 'text', text: 'hello' }],
    }

    // biome-ignore lint/suspicious/noExplicitAny: test
    const result = renderMarkdown(node, helpers as any, {} as any)
    expect(result).toBe('```\nhello\n```')
  })

  it('renders an empty code block', () => {
    const node = {
      type: 'codeBlock',
      attrs: { language: 'ts' },
    }

    // biome-ignore lint/suspicious/noExplicitAny: test
    const result = renderMarkdown(node, helpers as any, {} as any)
    expect(result).toBe('```ts\n\n```')
  })
})

describe('integration', () => {
  it('round-trips a fenced code block through markdown', () => {
    const editor = new Editor({
      extensions: [
        StarterKit.configure({ codeBlock: false }),
        CodeBlockShiki,
        Markdown,
      ],
    })

    const input = '```ts\nconst x = 1\n```'
    editor.commands.setContent(input, { contentType: 'markdown' })

    const json = editor.getJSON()
    const codeBlock = json.content?.find((n) => n.type === 'codeBlock')
    expect(codeBlock).toBeDefined()
    expect(codeBlock?.attrs?.language).toBe('ts')
    // biome-ignore lint/suspicious/noExplicitAny: test
    expect((codeBlock?.content?.[0] as any)?.text).toBe('const x = 1')

    const output = editor.getMarkdown()
    expect(output).toContain('```ts')
    expect(output).toContain('const x = 1')
    expect(output).toContain('```')

    editor.destroy()
  })

  it('round-trips a code block without language', () => {
    const editor = new Editor({
      extensions: [
        StarterKit.configure({ codeBlock: false }),
        CodeBlockShiki,
        Markdown,
      ],
    })

    editor.commands.setContent('```\nhello world\n```', { contentType: 'markdown' })

    const json = editor.getJSON()
    const codeBlock = json.content?.find((n) => n.type === 'codeBlock')
    expect(codeBlock).toBeDefined()
    // biome-ignore lint/suspicious/noExplicitAny: test
    expect((codeBlock?.content?.[0] as any)?.text).toBe('hello world')

    const output = editor.getMarkdown()
    expect(output).toContain('hello world')

    editor.destroy()
  })
})
