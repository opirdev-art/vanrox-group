import { describe, expect, it } from 'vitest'
import { parseYouTubeEmbedUrl } from '../youtube'

describe('parseYouTubeEmbedUrl', () => {
  it('parses watch URLs', () => {
    expect(parseYouTubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    )
  })

  it('parses youtu.be URLs', () => {
    expect(parseYouTubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    )
  })

  it('returns null for invalid URLs', () => {
    expect(parseYouTubeEmbedUrl('https://example.com')).toBeNull()
  })
})
