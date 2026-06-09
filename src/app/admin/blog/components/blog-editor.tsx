'use client'

import { useCallback, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RichEditor } from '@/components/editor/rich-editor'
import type { RichEditorHandle } from '@/components/editor/rich-editor'
import { MediaPanel } from '@/components/editor/media-panel'
import { BlogPreview } from '@/components/editor/blog-preview'
import { createBlogPost, updateBlogPost } from '../actions'
import type { BlogPostWithCategory } from '@/lib/blog/types'
import type { BlogCategoryRecord } from '@/lib/blog/types'

type BlogEditorProps = {
  categories: BlogCategoryRecord[]
  existing?: BlogPostWithCategory
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function BlogEditor({ categories, existing }: BlogEditorProps) {
  const router = useRouter()
  const editorRef = useRef<RichEditorHandle | null>(null)

  // ── State ──────────────────────────────────────────────────────────────
  const [title, setTitle] = useState(existing?.title ?? '')
  const [excerpt, setExcerpt] = useState(existing?.excerpt ?? '')
  const [authorName, setAuthorName] = useState(existing?.author_name ?? 'VANROX')
  const [categoryId, setCategoryId] = useState<number | null>(existing?.category_id ?? null)
  const [tags, setTags] = useState(existing?.tags?.join(', ') ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(existing?.cover_image_url ?? '')
  const [coverAlt, setCoverAlt] = useState(existing?.cover_alt ?? '')
  const [html, setHtml] = useState(existing?.body ?? '')
  const [status, setStatus] = useState(existing?.status ?? 'draft')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [localCategories, setLocalCategories] = useState(categories)

  const [savedId, setSavedId] = useState<number | null>(existing?.id ?? null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [mediaPanelOpen, setMediaPanelOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const storageKey = existing ? `blog-draft-${existing.id}` : `blog-new`

  const parseTags = () => tags.split(',').map((t) => t.trim()).filter(Boolean)

  const buildInput = (wantStatus: 'draft' | 'published') => ({
    title,
    excerpt: excerpt || undefined,
    author_name: authorName,
    category_id: categoryId,
    tags: parseTags(),
    cover_image_url: coverImageUrl || null,
    cover_alt: coverAlt || null,
    body: editorRef.current?.getHTML() ?? html,
    status: wantStatus,
  })

  const save = useCallback(
    async (wantStatus: 'draft' | 'published') => {
      if (!title.trim()) { setErrorMsg('Title is required'); return }
      setSaveStatus('saving')
      setErrorMsg(null)

      startTransition(async () => {
        const input = buildInput(wantStatus)
        const result = savedId
          ? await updateBlogPost(savedId, input, status === 'published')
          : await createBlogPost(input)

        if (result.ok === false) {
          setSaveStatus('error')
          setErrorMsg(result.error)
          return
        }

        if (!savedId && result.ok && 'id' in result && typeof result.id === 'number') {
          setSavedId(result.id)
          router.replace(`/admin/blog/${result.id}`)
        }

        setStatus(wantStatus)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2500)
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [title, excerpt, authorName, categoryId, tags, coverImageUrl, coverAlt, html, status, savedId]
  )

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    try {
      const { createBlogCategory } = await import('../actions')
      const result = await createBlogCategory(newCategoryName.trim())
      if (result.ok === false) { setErrorMsg(result.error); return }
      const newCat = {
        id: (result as { id: number }).id,
        name: newCategoryName.trim(),
        slug: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
        created_at: new Date().toISOString(),
      }
      setLocalCategories((prev) => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)))
      setCategoryId(newCat.id)
      setNewCategoryName('')
      setShowNewCategory(false)
    } catch {
      setErrorMsg('Failed to create category')
    }
  }

  const previewData = {
    title: title || 'Untitled',
    excerpt: excerpt || null,
    body: editorRef.current?.getHTML() || html || null,
    coverImageUrl: coverImageUrl || null,
    coverAlt: coverAlt || null,
    authorName,
    category: localCategories.find((c) => c.id === categoryId) ?? null,
    tags: parseTags(),
  }

  return (
    <div className="min-h-0 bg-navy flex flex-col">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-navy-mid border-b border-white/8 px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/blog')}
          className="inline-flex items-center min-h-11 text-gray hover:text-white text-sm"
        >
          ← Blog Posts
        </button>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:ml-auto w-full sm:w-auto">
          {saveStatus === 'saving' || isPending ? (
            <span className="text-xs text-gray animate-pulse">Saving…</span>
          ) : saveStatus === 'saved' ? (
            <span className="text-xs text-green">✓ Saved</span>
          ) : saveStatus === 'error' ? (
            <span className="text-xs text-red-400">Error</span>
          ) : null}

          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center min-h-11 px-3 rounded text-xs font-semibold border border-white/15 text-gray hover:text-white hover:border-white/30 transition-colors"
          >
            Preview
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => save('draft')}
            className="inline-flex items-center min-h-11 px-3 rounded text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors disabled:opacity-40"
          >
            Save draft
          </button>

          <button
            type="button"
            disabled={isPending || !title.trim()}
            onClick={() => save('published')}
            className={`inline-flex items-center min-h-11 px-4 rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40 ${
              status === 'published'
                ? 'bg-green/20 hover:bg-green/30 text-green border border-green/30'
                : 'bg-green hover:bg-green-dark text-navy'
            }`}
          >
            {status === 'published' ? 'Update live' : 'Publish'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="px-6 py-2 bg-red-900/30 border-b border-red-500/20 text-red-400 text-sm">
          {errorMsg}
        </div>
      )}

      {/* ── Main layout ─────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 lg:overflow-hidden">
        {/* ── Editor column ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto order-2 lg:order-1">
          {/* Title */}
          <div className="px-4 sm:px-8 pt-6 sm:pt-10 pb-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title…"
              className="w-full bg-transparent text-2xl sm:text-3xl font-bebas tracking-[3px] text-white placeholder-white/20 focus:outline-none border-b border-transparent focus:border-white/10 pb-2 transition-colors"
            />
          </div>

          {/* Excerpt */}
          <div className="px-4 sm:px-8 py-3">
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="Brief excerpt shown on the blog listing…"
              className="w-full bg-transparent text-base text-gray placeholder-gray/40 focus:outline-none resize-none border-l-2 border-green/30 pl-4 focus:border-green/60 transition-colors leading-relaxed"
            />
          </div>

          {/* TipTap rich editor */}
          <div className="flex-1 px-2">
            <RichEditor
              ref={editorRef}
              initialHTML={existing?.body ?? ''}
              storageKey={storageKey}
              placeholder="Write your article… Use + Media to embed images and videos inline."
              onChangeHTML={setHtml}
              onOpenMedia={() => setMediaPanelOpen(true)}
            />
          </div>
        </div>

        {/* ── Right sidebar ──────────────────────────────────────────────── */}
        <aside className="w-full lg:w-72 shrink-0 bg-navy-light border-b lg:border-b-0 lg:border-l border-white/8 overflow-y-auto flex flex-col order-1 lg:order-2">
          {/* Cover photo */}
          <section className="p-5 border-b border-white/8">
            <h3 className="text-xs uppercase tracking-widest text-gray mb-3">Cover Photo</h3>
            {coverImageUrl ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImageUrl}
                  alt={coverAlt || 'Cover'}
                  className="w-full rounded-md border border-white/10 object-cover aspect-video"
                />
                <input
                  value={coverAlt}
                  onChange={(e) => setCoverAlt(e.target.value)}
                  placeholder="Alt text…"
                  className="w-full bg-navy-mid text-xs text-white px-2 py-1.5 rounded border border-white/8 focus:outline-none focus:border-green/40 placeholder-gray/40"
                />
                <button
                  type="button"
                  onClick={() => { setCoverImageUrl(''); setCoverAlt('') }}
                  className="text-xs text-red-400/70 hover:text-red-400"
                >
                  Remove cover
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setMediaPanelOpen(true)}
                className="w-full border border-dashed border-white/15 rounded-md py-8 text-center text-xs text-gray/60 hover:border-green/30 hover:text-green/70 transition-colors"
              >
                + Upload cover photo
              </button>
            )}
          </section>

          {/* Post details */}
          <section className="p-5 border-b border-white/8 space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-gray">Article Details</h3>

            <label className="block">
              <span className="text-[11px] text-gray/70 uppercase tracking-widest">Author</span>
              <input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Njisane Mottley"
                className="mt-1 w-full bg-navy-mid text-sm text-white px-3 py-1.5 rounded border border-white/8 focus:outline-none focus:border-green/40 placeholder-gray/40"
              />
            </label>

            <label className="block">
              <span className="text-[11px] text-gray/70 uppercase tracking-widest">Category</span>
              <select
                value={categoryId ?? ''}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                className="mt-1 w-full bg-navy-mid text-sm text-white px-3 py-1.5 rounded border border-white/8 focus:outline-none focus:border-green/40"
              >
                <option value="">— None —</option>
                {localCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>

            {showNewCategory ? (
              <div className="flex gap-2">
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory() }}
                  placeholder="Category name"
                  className="flex-1 bg-navy-mid text-xs text-white px-2 py-1.5 rounded border border-white/8 focus:outline-none focus:border-green/40"
                  autoFocus
                />
                <button type="button" onClick={handleAddCategory} className="px-2 py-1.5 bg-green text-navy text-xs font-bold rounded">Add</button>
                <button type="button" onClick={() => { setShowNewCategory(false); setNewCategoryName('') }} className="px-2 py-1.5 text-gray hover:text-white text-xs">✕</button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewCategory(true)}
                className="text-xs text-green/70 hover:text-green"
              >
                + New category
              </button>
            )}

            <label className="block">
              <span className="text-[11px] text-gray/70 uppercase tracking-widest">Tags</span>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="surveying, land, 2024"
                className="mt-1 w-full bg-navy-mid text-sm text-white px-3 py-1.5 rounded border border-white/8 focus:outline-none focus:border-green/40 placeholder-gray/40"
              />
              <p className="mt-1 text-[10px] text-gray/50">Comma-separated</p>
            </label>
          </section>

          {/* Status */}
          <section className="p-5 space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-gray">Status</h3>
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${status === 'published' ? 'bg-green' : 'bg-gray/30'}`} />
              <span className="text-sm text-white capitalize">{status}</span>
            </div>
            {status === 'published' && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => save('draft')}
                className="w-full py-2 text-xs font-semibold rounded border border-white/10 text-gray hover:text-white hover:border-white/20 transition-colors disabled:opacity-40"
              >
                Unpublish
              </button>
            )}
          </section>
        </aside>
      </div>

      {/* ── Media panel ──────────────────────────────────────────────────── */}
      <MediaPanel
        open={mediaPanelOpen}
        onClose={() => setMediaPanelOpen(false)}
        editorRef={editorRef}
        bucket="blog-media"
        onUploadCover={(url) => { setCoverImageUrl(url); setMediaPanelOpen(false) }}
        getUploadFolder={async () => {
          if (savedId) return `posts/${savedId}`
          // Auto-create a draft to get an ID for uploads
          if (!title.trim()) return 'posts/drafts'
          const result = await createBlogPost(buildInput('draft'))
          if (result.ok && 'id' in result && typeof result.id === 'number') {
            setSavedId(result.id)
            router.replace(`/admin/blog/${result.id}`)
            return `posts/${result.id}`
          }
          return 'posts/drafts'
        }}
      />

      {/* ── Preview ──────────────────────────────────────────────────────── */}
      <BlogPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={previewData}
        slug={existing?.slug}
      />
    </div>
  )
}
