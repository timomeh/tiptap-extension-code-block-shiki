export function styleToHtml(styles: Record<string, string>) {
  return Object.entries(styles || {})
    .map(([key, val]) => `${key}:${val}`)
    .join(';')
}
