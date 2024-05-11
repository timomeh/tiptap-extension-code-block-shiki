import { it, expect, afterEach } from 'vitest'
import {
  getShiki,
  loadHighlighter,
  loadLanguage,
  loadTheme,
  resetHighlighter,
} from '../highlighter'

afterEach(() => {
  resetHighlighter()
})

it('loads the highlighter with themes and langs', async () => {
  const p = loadHighlighter({
    themes: ['tokyo-night'],
    languages: ['css', 'ts'],
  })
  await expect(p).resolves.not.toThrow()

  const highlighter = getShiki()
  expect(highlighter).toBeDefined()
  expect(highlighter?.getLoadedThemes()).toEqual(['tokyo-night'])
  expect(highlighter?.getLoadedLanguages()).toEqual(['css', 'typescript', 'ts'])
})

it('loads the highlighter only once', async () => {
  const p = loadHighlighter({ themes: ['tokyo-night'], languages: ['c'] })
  const p2 = loadHighlighter({ themes: ['tokyo-night'], languages: ['c'] })
  expect(p).toBe(p2)

  await p
  await p2

  const highlighter = getShiki()
  expect(highlighter).toBeDefined()
})

it('has only 1 instance', async () => {
  await loadHighlighter({ themes: ['tokyo-night'], languages: ['c'] })
  const h1 = getShiki()
  const h2 = getShiki()

  expect(h1).toBe(h2)
})

it('loads additional themes', async () => {
  await loadHighlighter({ themes: ['tokyo-night'], languages: ['c'] })
  expect(await loadTheme('github-dark')).toBe(true)

  const highlighter = getShiki()
  expect(highlighter?.getLoadedThemes()).toEqual(['tokyo-night', 'github-dark'])
})

it('loads themes only once', async () => {
  await loadHighlighter({ themes: ['tokyo-night'], languages: ['c'] })
  expect(await loadTheme('tokyo-night')).toBe(false)

  const highlighter = getShiki()
  expect(highlighter?.getLoadedThemes()).toEqual(['tokyo-night'])
})

it('loads additional langs', async () => {
  await loadHighlighter({ themes: ['tokyo-night'], languages: ['c'] })
  expect(await loadLanguage('css')).toBe(true)

  const highlighter = getShiki()
  expect(highlighter?.getLoadedLanguages()).toEqual(['c', 'css'])
})

it('loads langs only once', async () => {
  await loadHighlighter({ themes: ['tokyo-night'], languages: ['c'] })
  expect(await loadLanguage('c')).toBe(false)

  const highlighter = getShiki()
  expect(highlighter?.getLoadedLanguages()).toEqual(['c'])
})
