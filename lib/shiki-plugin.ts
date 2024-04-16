import {
  getHighlighter,
  Highlighter,
  BundledLanguage,
  BundledTheme,
  bundledLanguages,
  bundledThemes,
} from 'shiki'
import { findChildren } from '@tiptap/core'
import { Node as ProsemirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

// This whole file is basically throwing code from two libraries at each other:
// - https://github.com/ueberdosis/tiptap/tree/main/packages/extension-code-block-lowlight by tiptap
// - https://github.com/ocavue/prosemirror-highlight
// I really didn't do more than just mashing both together.

let highlighterPromise: Promise<void> | undefined
let highlighter: Highlighter | undefined
const loadedLanguages = new Set<BundledLanguage>()
const loadedThemes = new Set<BundledTheme>()

type HighlighterOptions = {
  theme?: BundledTheme
  language?: BundledLanguage
  defaultTheme: BundledTheme
}

const lazyHighlighter = (opts: HighlighterOptions) => {
  if (!highlighterPromise) {
    highlighterPromise = getHighlighter({
      themes: [opts.defaultTheme],
      langs: [],
    }).then((h) => {
      loadedThemes.add(opts.defaultTheme)
      highlighter = h
    })
    return highlighterPromise
  }

  if (!highlighter) {
    return highlighterPromise
  }

  const language = opts.language
  if (
    language &&
    !loadedLanguages.has(language) &&
    language in bundledLanguages
  ) {
    return highlighter.loadLanguage(language).then(() => {
      loadedLanguages.add(language)
    })
  }

  const theme = opts.theme
  if (theme && !loadedThemes.has(theme) && theme in bundledThemes) {
    return highlighter.loadTheme(theme).then(() => {
      loadedThemes.add(theme)
    })
  }
}

function getDecorations({
  doc,
  name,
  defaultLanguage,
  defaultTheme,
}: {
  doc: ProsemirrorNode
  name: string
  defaultLanguage: BundledLanguage | null | undefined
  defaultTheme: BundledTheme
}) {
  const decorations: Decoration[] = []

  findChildren(doc, (node) => node.type.name === name).forEach((block) => {
    let from = block.pos + 1
    let language = block.node.attrs.language || defaultLanguage
    let theme = block.node.attrs.theme || defaultTheme
    lazyHighlighter({ language, theme, defaultTheme })

    if (!loadedLanguages.has(language)) {
      language = 'plaintext'
    }

    if (!highlighter) return block.node

    const tokens = highlighter.codeToTokensBase(block.node.textContent, {
      lang: language,
      theme,
    })

    for (const line of tokens) {
      for (const token of line) {
        const to = from + token.content.length

        const decoration = Decoration.inline(from, to, {
          style: `color: ${token.color}`,
        })

        decorations.push(decoration)

        from = to
      }

      from += 1
    }
  })

  return DecorationSet.create(doc, decorations)
}

export function ShikiPlugin({
  name,
  defaultLanguage,
  defaultTheme,
}: {
  name: string
  defaultLanguage: BundledLanguage | null | undefined
  defaultTheme: BundledTheme
}) {
  const shikiPlugin: Plugin<any> = new Plugin({
    key: new PluginKey('shiki'),

    state: {
      init: (_, { doc }) =>
        getDecorations({
          doc,
          name,
          defaultLanguage,
          defaultTheme,
        }),
      apply: (transaction, decorationSet, oldState, newState) => {
        const oldNodeName = oldState.selection.$head.parent.type.name
        const newNodeName = newState.selection.$head.parent.type.name
        const oldNodes = findChildren(
          oldState.doc,
          (node) => node.type.name === name,
        )
        const newNodes = findChildren(
          newState.doc,
          (node) => node.type.name === name,
        )

        if (
          transaction.docChanged &&
          // Apply decorations if:
          // selection includes named node,
          ([oldNodeName, newNodeName].includes(name) ||
            // OR transaction adds/removes named node,
            newNodes.length !== oldNodes.length ||
            // OR transaction has changes that completely encapsulte a node
            // (for example, a transaction that affects the entire document).
            // Such transactions can happen during collab syncing via y-prosemirror, for example.
            transaction.steps.some((step) => {
              // @ts-ignore
              return (
                // @ts-ignore
                step.from !== undefined &&
                // @ts-ignore
                step.to !== undefined &&
                oldNodes.some((node) => {
                  // @ts-ignore
                  return (
                    // @ts-ignore
                    node.pos >= step.from &&
                    // @ts-ignore
                    node.pos + node.node.nodeSize <= step.to
                  )
                })
              )
            }))
        ) {
          return getDecorations({
            doc: transaction.doc,
            name,
            defaultLanguage,
            defaultTheme,
          })
        }

        return decorationSet.map(transaction.mapping, transaction.doc)
      },
    },

    props: {
      decorations(state) {
        return shikiPlugin.getState(state)
      },
    },
  })

  return shikiPlugin
}
