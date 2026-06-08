/** Parse common YouTube URLs into embed-safe iframe src. */
export function parseYouTubeEmbedUrl(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    const host = url.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (url.pathname === '/watch') {
        const id = url.searchParams.get('v')
        return id ? `https://www.youtube.com/embed/${id}` : null
      }
      const shortsMatch = url.pathname.match(/^\/shorts\/([^/?]+)/)
      if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`
      const embedMatch = url.pathname.match(/^\/embed\/([^/?]+)/)
      if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}`
    }
  } catch {
    return null
  }

  return null
}
