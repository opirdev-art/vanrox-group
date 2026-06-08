'use client'

import { useRef, useState } from 'react'
import type { RichEditorHandle } from './rich-editor'

type MediaPanelProps = {
  open: boolean
  onClose: () => void
  editorRef: React.RefObject<RichEditorHandle | null>
  onUploadCover: (url: string) => void
  /**
   * Returns the Storage folder path (e.g. "posts/42" or "case-studies/12").
   * Called lazily on first upload — allows the parent to create a DB row first.
   */
  getUploadFolder: () => Promise<string>
  /** Supabase Storage bucket name. Default: "blog-media" */
  bucket?: string
}

export function MediaPanel({
  open,
  onClose,
  editorRef,
  onUploadCover,
  getUploadFolder,
  bucket = 'blog-media',
}: MediaPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoCaption, setVideoCaption] = useState('')
  const [caption, setCaption] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const uploadFile = async (file: File, asCover: boolean) => {
    setUploading(true)
    setError(null)
    try {
      const folder = await getUploadFolder()
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)
      fd.append('bucket', bucket)

      const res = await fetch('/api/admin/upload-media', { method: 'POST', body: fd })
      const json = await res.json() as { url?: string; error?: string }
      if (!res.ok || !json.url) throw new Error(json.error || 'Upload failed')

      if (asCover) {
        onUploadCover(json.url)
      } else {
        editorRef.current?.insertMedia({
          src: json.url,
          kind: 'image',
          layout: 'contained',
          caption,
          alt: file.name,
        })
        setCaption('')
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const insertYouTube = () => {
    if (!videoUrl.trim()) return
    const normalized = parseYouTubeEmbed(videoUrl.trim())
    if (!normalized) { setError('Could not parse YouTube URL'); return }
    editorRef.current?.insertMedia({
      src: normalized,
      kind: 'video_embed',
      layout: 'full',
      caption: videoCaption,
    })
    setVideoUrl('')
    setVideoCaption('')
    setError(null)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-80 bg-navy-light border-l border-white/8 z-50 flex flex-col overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h3 className="font-barlow-condensed text-base uppercase tracking-[1.5px] text-white">Media</h3>
          <button type="button" onClick={onClose} className="text-gray hover:text-white text-xl leading-none">×</button>
        </div>

        <div className="flex-1 p-5 space-y-6">
          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded px-3 py-2">{error}</p>
          )}

          {/* ── Inline image ────────────────────────────────────── */}
          <section className="space-y-2">
            <h4 className="text-xs uppercase tracking-widest text-gray">Inline image</h4>
            <input
              className="w-full text-xs bg-navy-mid border border-white/10 rounded px-2 py-1.5 text-gray placeholder-gray/50 focus:outline-none focus:border-green/40"
              placeholder="Caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) { uploadFile(f, false); e.target.value = '' }
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 rounded text-sm font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors disabled:opacity-40"
            >
              {uploading ? 'Uploading…' : 'Upload & insert image'}
            </button>
          </section>

          {/* ── Cover photo ──────────────────────────────────────── */}
          <section className="space-y-2">
            <h4 className="text-xs uppercase tracking-widest text-gray">Cover photo</h4>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) { uploadFile(f, true); e.target.value = '' }
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => coverInputRef.current?.click()}
              className="w-full py-2 rounded text-sm font-semibold bg-green/10 hover:bg-green/15 text-green border border-green/30 transition-colors disabled:opacity-40"
            >
              {uploading ? 'Uploading…' : 'Upload cover photo'}
            </button>
            <p className="text-[11px] text-gray/60">Sets the hero image shown above the article.</p>
          </section>

          {/* ── YouTube embed ─────────────────────────────────────── */}
          <section className="space-y-2">
            <h4 className="text-xs uppercase tracking-widest text-gray">YouTube embed</h4>
            <input
              className="w-full text-xs bg-navy-mid border border-white/10 rounded px-2 py-1.5 text-white placeholder-gray/50 focus:outline-none focus:border-green/40"
              placeholder="https://youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <input
              className="w-full text-xs bg-navy-mid border border-white/10 rounded px-2 py-1.5 text-gray placeholder-gray/50 focus:outline-none focus:border-green/40"
              placeholder="Caption (optional)"
              value={videoCaption}
              onChange={(e) => setVideoCaption(e.target.value)}
            />
            <button
              type="button"
              disabled={!videoUrl.trim()}
              onClick={insertYouTube}
              className="w-full py-2 rounded text-sm font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors disabled:opacity-40"
            >
              Embed video
            </button>
          </section>
        </div>
      </div>
    </>
  )
}

function parseYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url)
    let id: string | null = null
    if (u.hostname.includes('youtu.be')) {
      id = u.pathname.slice(1)
    } else {
      id = u.searchParams.get('v')
    }
    if (!id) return null
    return `https://www.youtube.com/embed/${id}`
  } catch {
    return null
  }
}
