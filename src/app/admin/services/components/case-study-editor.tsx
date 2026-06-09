'use client'

import { useCallback, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RichEditor } from '@/components/editor/rich-editor'
import type { RichEditorHandle } from '@/components/editor/rich-editor'
import { MediaPanel } from '@/components/editor/media-panel'
import { StudioPreview } from '@/components/editor/studio-preview'
import { createCaseStudy, updateCaseStudy } from '../content-actions'
import type { CaseStudyRecord } from '@/lib/service-pages/types'

type ServiceInfo = {
  id: number
  name: string
  slug: string
}

type CaseStudyEditorProps = {
  service: ServiceInfo
  /** Provided when editing an existing case study */
  existing?: CaseStudyRecord
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function CaseStudyEditor({ service, existing }: CaseStudyEditorProps) {
  const router = useRouter()
  const editorRef = useRef<RichEditorHandle | null>(null)

  // ── State ──────────────────────────────────────────────────────────────
  const [title, setTitle] = useState(existing?.title ?? '')
  const [summary, setSummary] = useState(existing?.summary ?? '')
  const [clientName, setClientName] = useState(existing?.client_name ?? '')
  const [location, setLocation] = useState(existing?.location ?? '')
  const [outcome, setOutcome] = useState(existing?.outcome ?? '')
  const [tags, setTags] = useState(existing?.tags?.join(', ') ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(existing?.cover_image_url ?? '')
  const [html, setHtml] = useState(existing?.body ?? '')
  const [published, setPublished] = useState(existing?.published ?? false)

  // In-flight case study ID so draft uploads can attach to the correct row
  const [savedId, setSavedId] = useState<number | null>(existing?.id ?? null)

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [mediaPanelOpen, setMediaPanelOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const [isPending, startTransition] = useTransition()

  // ── Auto-save key ──────────────────────────────────────────────────────
  const storageKey = existing
    ? `cs-draft-${existing.id}`
    : `cs-new-${service.id}`

  // ── Parse tags ─────────────────────────────────────────────────────────
  const parseTags = () =>
    tags.split(',').map((t) => t.trim()).filter(Boolean)

  // ── Build input for server action ──────────────────────────────────────
  const buildInput = (wantPublished: boolean) => ({
    details: {
      title,
      summary,
      client_name: clientName,
      location,
      outcome,
      tags: parseTags(),
      slug: existing?.slug ?? '',
    },
    body: editorRef.current?.getHTML() ?? html,
    cover_image_url: coverImageUrl || null,
    published: wantPublished,
  })

  // ── Save (draft or publish) ────────────────────────────────────────────
  const save = useCallback(
    async (wantPublished: boolean) => {
      if (!title.trim()) { setErrorMsg('Title is required'); return }
      setSaveStatus('saving')
      setErrorMsg(null)

      startTransition(async () => {
        const input = buildInput(wantPublished)
        const result = savedId
          ? await updateCaseStudy(service.id, savedId, input)
          : await createCaseStudy(service.id, input)

        if (result.ok === false) {
          setSaveStatus('error')
          setErrorMsg(result.error)
          return
        }

        if (!savedId && result.ok && 'id' in result && typeof result.id === 'number') {
          setSavedId(result.id)
        }

        setPublished(wantPublished)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2500)

        if (!existing) {
          // After first save, replace the URL so the page becomes an edit page
          const id = savedId ?? ('id' in result && typeof result.id === 'number' ? result.id : null)
          if (id) {
            router.replace(`/admin/services/${service.id}/case-studies/${id}`)
          }
        }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [title, summary, clientName, location, outcome, tags, coverImageUrl, html, published, savedId, service.id, existing]
  )

  // ── Get-or-create ID for media upload ─────────────────────────────────
  const getOrCreateId = async (): Promise<number | null> => {
    if (savedId) return savedId
    // Save a stub draft so we get an ID
    if (!title.trim()) return null
    const result = await createCaseStudy(service.id, buildInput(false))
    if (result.ok === false) return null
    const id = 'id' in result && typeof result.id === 'number' ? result.id : null
    if (id) {
      setSavedId(id)
      router.replace(`/admin/services/${service.id}/case-studies/${id}`)
    }
    return id
  }

  // ── Preview data ───────────────────────────────────────────────────────
  const previewData = {
    title: title || 'Untitled',
    summary: summary || null,
    body: editorRef.current?.getHTML() || html || null,
    coverImageUrl: coverImageUrl || null,
    clientName: clientName || null,
    location: location || null,
    outcome: outcome || null,
    service,
  }

  return (
    <div className="min-h-0 bg-navy flex flex-col">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-navy-mid border-b border-white/8 px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.push(`/admin/services/${service.id}/case-studies`)}
          className="inline-flex items-center min-h-11 text-gray hover:text-white text-sm"
        >
          ← Case Studies
        </button>
        <span className="hidden sm:inline text-white/20">|</span>
        <span className="hidden sm:inline text-xs text-gray uppercase tracking-widest truncate max-w-[40vw]">{service.name}</span>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:ml-auto w-full sm:w-auto">
          {/* Save status */}
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
            onClick={() => save(false)}
            className="inline-flex items-center min-h-11 px-3 rounded text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors disabled:opacity-40"
          >
            Save draft
          </button>

          <button
            type="button"
            disabled={isPending || !title.trim()}
            onClick={() => save(true)}
            className={`inline-flex items-center min-h-11 px-4 rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40 ${
              published
                ? 'bg-green/20 hover:bg-green/30 text-green border border-green/30'
                : 'bg-green hover:bg-green-dark text-navy'
            }`}
          >
            {published ? 'Update live' : 'Publish'}
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
              placeholder="Case study title…"
              className="w-full bg-transparent text-2xl sm:text-3xl font-bebas tracking-[3px] text-white placeholder-white/20 focus:outline-none border-b border-transparent focus:border-white/10 pb-2 transition-colors"
            />
          </div>

          {/* Summary (lead paragraph) */}
          <div className="px-4 sm:px-8 py-3">
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              placeholder="One-line summary or lead paragraph…"
              className="w-full bg-transparent text-base text-gray placeholder-gray/40 focus:outline-none resize-none border-l-2 border-green/30 pl-4 focus:border-green/60 transition-colors leading-relaxed"
            />
          </div>

          {/* TipTap editor */}
          <div className="flex-1 px-2">
            <RichEditor
              ref={editorRef}
              initialHTML={existing?.body ?? ''}
              storageKey={storageKey}
              placeholder="Write your case study… Use + Media to embed images and videos inline."
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
                  alt="Cover"
                  className="w-full rounded-md border border-white/10 object-cover aspect-video"
                />
                <button
                  type="button"
                  onClick={() => setCoverImageUrl('')}
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

          {/* Details */}
          <section className="p-5 border-b border-white/8 space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-gray">Details</h3>

            <label className="block">
              <span className="text-[11px] text-gray/70 uppercase tracking-widest">Client</span>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="ACME Corp"
                className="mt-1 w-full bg-navy-mid text-sm text-white px-3 py-1.5 rounded border border-white/8 focus:outline-none focus:border-green/40 placeholder-gray/40"
              />
            </label>

            <label className="block">
              <span className="text-[11px] text-gray/70 uppercase tracking-widest">Location</span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Cape Town, South Africa"
                className="mt-1 w-full bg-navy-mid text-sm text-white px-3 py-1.5 rounded border border-white/8 focus:outline-none focus:border-green/40 placeholder-gray/40"
              />
            </label>

            <label className="block">
              <span className="text-[11px] text-gray/70 uppercase tracking-widest">Outcome</span>
              <input
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="Saved 30% on project cost"
                className="mt-1 w-full bg-navy-mid text-sm text-white px-3 py-1.5 rounded border border-white/8 focus:outline-none focus:border-green/40 placeholder-gray/40"
              />
            </label>

            <label className="block">
              <span className="text-[11px] text-gray/70 uppercase tracking-widest">Tags</span>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="surveying, residential, 2024"
                className="mt-1 w-full bg-navy-mid text-sm text-white px-3 py-1.5 rounded border border-white/8 focus:outline-none focus:border-green/40 placeholder-gray/40"
              />
              <p className="mt-1 text-[10px] text-gray/50">Comma-separated</p>
            </label>
          </section>

          {/* Publish status */}
          <section className="p-5 space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-gray">Status</h3>
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${published ? 'bg-green' : 'bg-gray/30'}`} />
              <span className="text-sm text-white">{published ? 'Published' : 'Draft'}</span>
            </div>
            {published && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => save(false)}
                className="w-full py-2 text-xs font-semibold rounded border border-white/10 text-gray hover:text-white hover:border-white/20 transition-colors disabled:opacity-40"
              >
                Unpublish
              </button>
            )}
          </section>
        </aside>
      </div>

      {/* ── Media panel ───────────────────────────────────────────────────── */}
      <MediaPanel
        open={mediaPanelOpen}
        onClose={() => setMediaPanelOpen(false)}
        editorRef={editorRef}
        bucket="case-study-media"
        onUploadCover={(url) => { setCoverImageUrl(url); setMediaPanelOpen(false) }}
        getUploadFolder={async () => {
          const id = await getOrCreateId()
          return id ? `case-studies/${id}` : `case-studies/drafts/${service.id}`
        }}
      />

      {/* ── Studio preview ────────────────────────────────────────────────── */}
      <StudioPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={previewData}
      />
    </div>
  )
}
