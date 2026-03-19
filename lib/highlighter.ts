import { findChildren } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import {
  type BundledLanguage,
  type BundledTheme,
  type ThemeRegistration,
  bundledLanguages,
  bundledThemes,
  createHighlighter,
  type Highlighter,
} from 'shiki'

let highlighter: Highlighter | undefined
let highlighterPromise: Promise<void> | undefined
const loadingLanguages = new Set<BundledLanguage>()
const loadingThemes = new Set<string>()
const customThemeRegistry = new Map<string, ThemeRegistration>()

type HighlighterOptions = {
  themes: (BundledTheme | string | null | undefined)[]
  languages: (BundledLanguage | null | undefined)[]
  customThemes?: ThemeRegistration[]
}

function isKnownTheme(theme: string): boolean {
  return theme in bundledThemes || customThemeRegistry.has(theme)
}

export function resetHighlighter() {
  highlighter = undefined
  highlighterPromise = undefined
  loadingLanguages.clear()
  loadingThemes.clear()
  customThemeRegistry.clear()
}

export function getShiki() {
  return highlighter
}

/**
 * Load the highlighter. Makes sure the highlighter is only loaded once.
 */
export function loadHighlighter(opts: HighlighterOptions) {
  if (!highlighter && !highlighterPromise) {
    if (opts.customThemes) {
      for (const t of opts.customThemes) {
        if (t.name) customThemeRegistry.set(t.name, t)
      }
    }

    const bundled = opts.themes.filter(
      (theme): theme is BundledTheme => !!theme && theme in bundledThemes,
    )
    const langs = opts.languages.filter(
      (lang): lang is BundledLanguage => !!lang && lang in bundledLanguages,
    )
    const themes = [...bundled, ...customThemeRegistry.values()]
    highlighterPromise = createHighlighter({ themes, langs }).then((h) => {
      highlighter = h
    })
    return highlighterPromise
  }

  if (highlighterPromise) {
    return highlighterPromise
  }
}

/**
 * Loads a theme if it's valid and not yet loaded.
 * @returns true or false depending on if it got loaded.
 */
export async function loadTheme(theme: BundledTheme | string) {
  if (
    highlighter &&
    !highlighter.getLoadedThemes().includes(theme) &&
    !loadingThemes.has(theme) &&
    isKnownTheme(theme)
  ) {
    loadingThemes.add(theme)
    const themeToLoad = customThemeRegistry.get(theme) ?? theme
    await highlighter.loadTheme(themeToLoad as BundledTheme)
    loadingThemes.delete(theme)
    return true
  }

  return false
}

/**
 * Loads a language if it's valid and not yet loaded
 * @returns true or false depending on if it got loaded.
 */
export async function loadLanguage(language: BundledLanguage) {
  if (
    highlighter &&
    !highlighter.getLoadedLanguages().includes(language) &&
    !loadingLanguages.has(language) &&
    language in bundledLanguages
  ) {
    loadingLanguages.add(language)
    await highlighter.loadLanguage(language)
    loadingLanguages.delete(language)
    return true
  }

  return false
}

/**
 * Initializes the highlighter based on the prosemirror document,
 * with the themes and languages in the document.
 */
export async function initHighlighter({
  doc,
  name,
  defaultTheme,
  defaultLanguage,
  themeModes,
  customThemes,
}: {
  doc: ProsemirrorNode
  name: string
  defaultLanguage: BundledLanguage | null | undefined
  defaultTheme: BundledTheme | (string & {})
  themeModes:
    | {
        light: BundledTheme
        dark: BundledTheme
      }
    | null
    | undefined
  customThemes?: ThemeRegistration[]
}) {
  const codeBlocks = findChildren(doc, (node) => node.type.name === name)

  const themes = [
    ...codeBlocks.map((block) => block.node.attrs.theme as BundledTheme),
    defaultTheme,
  ]
  const languages = [
    ...codeBlocks.map((block) => block.node.attrs.language as BundledLanguage),
    defaultLanguage,
  ]

  if (!highlighter) {
    const themesToLoad: (BundledTheme | string)[] = [...themes]
    if (themeModes) {
      if (themeModes.light && !themesToLoad.includes(themeModes.light)) {
        themesToLoad.push(themeModes.light)
      }
      if (themeModes.dark && !themesToLoad.includes(themeModes.dark)) {
        themesToLoad.push(themeModes.dark)
      }
    }

    const loader = loadHighlighter({
      languages,
      themes: themesToLoad,
      customThemes,
    })
    await loader
  } else {
    await Promise.all([
      ...themes.flatMap((theme) => loadTheme(theme)),
      ...languages.flatMap((language) => !!language && loadLanguage(language)),
    ])
  }
}
