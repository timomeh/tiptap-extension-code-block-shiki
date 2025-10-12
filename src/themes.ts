import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockShiki from '../lib'

import './style.css'

const editor = new Editor({
  element: document.querySelector('#editor')!,
  extensions: [
    StarterKit.configure({ codeBlock: false }),
    CodeBlockShiki.configure({
      defaultTheme: 'tokyo-night',
      themes: {
        dark: 'catppuccin-mocha',
        light: 'github-light',
      },
    }),
  ],
  content: `<p>Hello World!</p><pre><code class="language-ts">function foo() {
  return 'bar'
}</code></pre><pre><code class="language-css">.foo {
  color: green;
}</code></pre>`,
})

const themeToggleBtn = document.getElementById('theme-toggle')
const htmlElement = document.documentElement
const THEME_STORAGE_KEY = 'themePreference'

// Function to apply the theme
function applyTheme(theme: string) {
  htmlElement.setAttribute('data-theme', theme)
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

// Function to get the saved theme or default
function getInitialTheme(): string {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  if (savedTheme) {
    return savedTheme
  }
  // Detect system preference
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }
  return 'light' // Default theme
}

// Apply initial theme on page load
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(getInitialTheme())

  const currentTheme = htmlElement.getAttribute('data-theme')
  if (currentTheme === 'dark') {
    themeToggleBtn!.innerText = 'Switch to Light Theme'
  } else {
    themeToggleBtn!.innerText = 'Switch to Dark Theme'
  }
})

// Toggle theme on button click
themeToggleBtn?.addEventListener('click', () => {
  const currentTheme = htmlElement.getAttribute('data-theme')
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  themeToggleBtn.innerText =
    newTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'

  applyTheme(newTheme)
})

// @ts-ignore
window.editor = editor
