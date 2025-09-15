import { BundledLanguage, BundledTheme, CodeToTokensWithThemesOptions } from 'shiki'
import { NodeWithPos, findChildren } from '@tiptap/core'
import { Plugin, PluginKey, PluginView } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { Node as ProsemirrorNode } from '@tiptap/pm/model'
import {
  getShiki,
  initHighlighter,
  loadLanguage,
  loadTheme,
} from './highlighter'
import { styleToHtml } from './html-styles'

/** Create code decorations for the current document */
function getDecorations({
  doc,
  name,
  defaultTheme,
  defaultLanguage,
  themes,
}: {
  doc: ProsemirrorNode
  name: string
  defaultLanguage: BundledLanguage | null | undefined
  defaultTheme: BundledTheme
  themes: {
    light: BundledTheme,
    dark: BundledTheme,
  } | null | undefined
}) {
  const decorations: Decoration[] = []

  const codeBlocks = findChildren(doc, (node) => node.type.name === name)

  codeBlocks.forEach((block) => {
    let from = block.pos + 1
    let language = block.node.attrs.language || defaultLanguage

    let theme = block.node.attrs.theme || defaultTheme
    let lightTheme = block.node.attrs.themes?.light || themes?.light
    let darkTheme = block.node.attrs.themes?.dark || themes?.dark

    const highlighter = getShiki()

    if (!highlighter) return

    if (!highlighter.getLoadedLanguages().includes(language)) {
      language = 'plaintext'
    }

    const getThemeToApply = (theme: string): BundledTheme => {
      if (highlighter.getLoadedThemes().includes(theme)) {
        return theme as BundledTheme
      } else {
        return highlighter.getLoadedThemes()[0] as BundledTheme
      }
    }

    let options: CodeToTokensWithThemesOptions<BundledLanguage, BundledTheme>

    if (themes) {

      options = {
        lang: language,
        themes: {
          light: getThemeToApply(lightTheme),
          dark: getThemeToApply(darkTheme),
        },
      }
    } else {
      options = {
        lang: language,
        themes: {
          light: getThemeToApply(theme),
          dark: getThemeToApply(theme),
        }
      }
    }


    const tokens = highlighter.codeToTokens(block.node.textContent, options)

    const blockStyle: { [prop: string]: string } = {}
    if (tokens.bg) blockStyle['background-color'] = tokens.bg
    if (tokens.fg) blockStyle['color'] = tokens.fg

    decorations.push(
      Decoration.node(block.pos, block.pos + block.node.nodeSize, {
        style: styleToHtml(blockStyle),
        class: 'shiki',
      }),
    )

    for (const line of tokens.tokens) {
      for (const token of line) {
        const to = from + token.content.length

        const decoration = Decoration.inline(from, to, {
          style: styleToHtml(token.htmlStyle || {}),
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
  themes,
}: {
  name: string
  defaultLanguage: BundledLanguage | null | undefined
  defaultTheme: BundledTheme
  themes: {
    light: BundledTheme,
    dark: BundledTheme
  } | null | undefined
}) {
  const shikiPlugin: Plugin<any> = new Plugin({
    key: new PluginKey('shiki'),

    view(view) {
      // This small view is just for initial async handling
      class ShikiPluginView implements PluginView {
        constructor() {
          this.initDecorations()
        }

        update() {
          this.checkUndecoratedBlocks()
        }
        destroy() { }

        // Initialize shiki async, and then highlight initial document
        async initDecorations() {
          const doc = view.state.doc
          await initHighlighter({ doc, name, defaultLanguage, defaultTheme, themeModes: themes })
          const tr = view.state.tr.setMeta('shikiPluginForceDecoration', true)
          view.dispatch(tr)
        }

        // When new codeblocks were added and they have missing themes or
        // languages, load those and then add code decorations once again.
        async checkUndecoratedBlocks() {
          const codeBlocks = findChildren(
            view.state.doc,
            (node) => node.type.name === name,
          )

          const loaderFns = (block: NodeWithPos): Promise<Boolean>[] => {
            const fns = [
              loadLanguage(block.node.attrs.language),
            ]

            if (themes) {
              fns.push(loadTheme(block.node.attrs.themes?.light || themes.light))
              fns.push(loadTheme(block.node.attrs.themes?.dark || themes.dark))
            } else {
              fns.push(loadTheme(block.node.attrs.theme))
            }

            return fns
          }


          // Load missing themes or languages when necessary.
          // loadStates is an array with booleans depending on if a theme/lang
          // got loaded.
          const loadStates = await Promise.all(
            codeBlocks.flatMap((block) => loaderFns(block)),
          )
          const didLoadSomething = loadStates.includes(true)

          // The asynchronous nature of this is potentially prone to
          // race conditions. Imma just hope it's fine lol

          if (didLoadSomething) {
            const tr = view.state.tr.setMeta('shikiPluginForceDecoration', true)
            view.dispatch(tr)
          }
        }
      }

      return new ShikiPluginView()
    },

    state: {
      init: (_, { doc }) => {
        return getDecorations({
          doc,
          name,
          defaultLanguage,
          defaultTheme,
          themes: themes
        })
      },
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

        const didChangeSomeCodeBlock =
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

        // only create code decoration when it's necessary to do so
        if (
          transaction.getMeta('shikiPluginForceDecoration') ||
          didChangeSomeCodeBlock
        ) {
          return getDecorations({
            doc: transaction.doc,
            name,
            defaultLanguage,
            defaultTheme,
            themes
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
