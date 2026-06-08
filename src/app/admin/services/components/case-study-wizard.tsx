'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { slugifyServiceName } from '@/lib/services/slug'
import type { CaseStudyWithMedia } from '@/lib/service-pages/types'
import type { ServiceRecord } from '@/lib/services/queries'
import { MarkdownContent } from '@/components/content/markdown-content'
import { parseYouTubeEmbedUrl } from '@/lib/service-pages/youtube'
import { getActionError } from '@/lib/service-pages/action-result'
import {
  createCaseStudy,
  updateCaseStudy,
  uploadCaseStudyImage,
} from '../content-actions'

type MediaDraft = {
  media_type: 'image' | 'video_embed' | 'video_upload'
  url: string
  caption: string
  is_cover: boolean
  sort_order: number
}

type CaseStudyWizardProps = {
  service: ServiceRecord
  existing?: CaseStudyWithMedia
}

const STEPS = ['Details', 'Story', 'Media', 'Review'] as const

function draftStorageKey(serviceId: number) {
  return `vanrox-case-study-draft-${serviceId}`
}

export function CaseStudyWizard({ service, existing }: CaseStudyWizardProps) {
  const router = useRouter()
  const isEdit = Boolean(existing)
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState(existing?.title ?? '')
  const [slug, setSlug] = useState(existing?.slug ?? '')
  const [summary, setSummary] = useState(existing?.summary ?? '')
  const [clientName, setClientName] = useState(existing?.client_name ?? '')
  const [location, setLocation] = useState(existing?.location ?? '')
  const [outcome, setOutcome] = useState(existing?.outcome ?? '')
  const [tags, setTags] = useState(existing?.tags.join(', ') ?? '')
  const [body, setBody] = useState(existing?.body ?? '')
  const [media, setMedia] = useState<MediaDraft[]>(
    existing?.media.map((m, index) => ({
      media_type: m.media_type,
      url: m.url,
      caption: m.caption ?? '',
      is_cover: m.is_cover,
      sort_order: m.sort_order ?? index,
    })) ?? []
  )
  const [videoUrl, setVideoUrl] = useState('')
  const [published, setPublished] = useState(existing?.published ?? false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)

  const autoSlug = useMemo(() => slugifyServiceName(title), [title])

  useEffect(() => {
    if (isEdit) return
    const raw = localStorage.getItem(draftStorageKey(service.id))
    if (!raw) return
    try {
      const draft = JSON.parse(raw) as Record<string, unknown>
      if (typeof draft.title === 'string') setTitle(draft.title)
      if (typeof draft.slug === 'string') setSlug(draft.slug)
      if (typeof draft.summary === 'string') setSummary(draft.summary)
      if (typeof draft.clientName === 'string') setClientName(draft.clientName)
      if (typeof draft.location === 'string') setLocation(draft.location)
      if (typeof draft.outcome === 'string') setOutcome(draft.outcome)
      if (typeof draft.tags === 'string') setTags(draft.tags)
      if (typeof draft.body === 'string') setBody(draft.body)
      if (Array.isArray(draft.media)) setMedia(draft.media as MediaDraft[])
    } catch {
      // ignore corrupt draft
    }
  }, [isEdit, service.id])

  useEffect(() => {
    if (isEdit) return
    localStorage.setItem(
      draftStorageKey(service.id),
      JSON.stringify({ title, slug, summary, clientName, location, outcome, tags, body, media })
    )
  }, [isEdit, service.id, title, slug, summary, clientName, location, outcome, tags, body, media])

  async function handleImageUpload(file: File) {
    setUploading(true)
    setError('')
    const formData = new FormData()
    formData.set('file', file)
    const result = await uploadCaseStudyImage(service.id, existing?.id ?? null, formData)
    setUploading(false)
    if (!result.ok || !result.url) {
      setError(getActionError(result) ?? 'Upload failed')
      return
    }
    setMedia((rows) => [
      ...rows,
      {
        media_type: 'image',
        url: result.url!,
        caption: '',
        is_cover: rows.length === 0,
        sort_order: rows.length,
      },
    ])
  }

  function addVideoEmbed() {
    const embed = parseYouTubeEmbedUrl(videoUrl)
    if (!embed) {
      setError('Enter a valid YouTube URL')
      return
    }
    setError('')
    setMedia((rows) => [
      ...rows,
      {
        media_type: 'video_embed',
        url: embed,
        caption: '',
        is_cover: false,
        sort_order: rows.length,
      },
    ])
    setVideoUrl('')
  }

  function setCover(index: number) {
    setMedia((rows) => rows.map((row, i) => ({ ...row, is_cover: i === index })))
  }

  function removeMedia(index: number) {
    setMedia((rows) =>
      rows
        .filter((_, i) => i !== index)
        .map((row, i) => ({ ...row, sort_order: i, is_cover: row.is_cover && i === 0 ? true : row.is_cover }))
    )
  }

  function handleSubmit(savePublished: boolean) {
    setError('')
    startTransition(async () => {
      const payload = {
        details: {
          title,
          slug: slug || autoSlug,
          summary,
          client_name: clientName,
          location,
          outcome,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        },
        body,
        media,
        published: savePublished,
      }

      const result = isEdit
        ? await updateCaseStudy(service.id, existing!.id, payload)
        : await createCaseStudy(service.id, payload)

      const err = getActionError(result)
      if (err) {
        setError(err)
        return
      }

      if (!isEdit) localStorage.removeItem(draftStorageKey(service.id))
      router.push(`/admin/services/${service.id}/case-studies`)
      router.refresh()
    })
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(index)}
            className={`px-3 py-1.5 rounded text-xs font-bold tracking-widest uppercase ${
              step === index
                ? 'bg-green text-navy'
                : 'border border-white/10 text-gray hover:text-white'
            }`}
          >
            {index + 1}. {label}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Case study title"
            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-green outline-none"
          />
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={`Slug (default: ${autoSlug || 'auto-generated'})`}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-green outline-none text-sm"
          />
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Short teaser for cards"
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-green outline-none resize-none"
          />
          <div className="grid md:grid-cols-2 gap-4">
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Client type / name"
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-green outline-none"
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-green outline-none"
            />
          </div>
          <input
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="Outcome (one line result)"
            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-green outline-none"
          />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-green outline-none text-sm"
          />
        </div>
      )}

      {step === 1 && (
        <div className="grid lg:grid-cols-2 gap-6">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={18}
            placeholder="Full case study in markdown"
            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-green outline-none font-mono text-sm"
          />
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 min-h-[18rem]">
            <MarkdownContent content={body} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[0.65rem] text-gray uppercase tracking-widest font-bold">Upload images</label>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleImageUpload(file)
              }}
              className="block text-sm text-gray"
            />
          </div>
          <div className="flex gap-2">
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="YouTube URL"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-green outline-none text-sm"
            />
            <button
              type="button"
              onClick={addVideoEmbed}
              className="px-4 py-2 border border-green/30 text-green rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-green/10"
            >
              Add video
            </button>
          </div>
          <div className="space-y-3">
            {media.map((item, index) => (
              <div key={index} className="flex gap-4 items-start bg-white/5 border border-white/10 rounded-lg p-3">
                {item.media_type === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt="" className="w-24 h-16 object-cover rounded" />
                ) : (
                  <div className="w-24 h-16 bg-navy rounded flex items-center justify-center text-xs text-gray">Video</div>
                )}
                <div className="flex-1 space-y-2">
                  <input
                    value={item.caption}
                    onChange={(e) =>
                      setMedia((rows) =>
                        rows.map((row, i) => (i === index ? { ...row, caption: e.target.value } : row))
                      )
                    }
                    placeholder="Caption"
                    className="w-full bg-navy border border-white/10 rounded py-2 px-3 text-white text-sm focus:border-green outline-none"
                  />
                  <label className="flex items-center gap-2 text-xs text-gray">
                    <input
                      type="radio"
                      name="cover"
                      checked={item.is_cover}
                      onChange={() => setCover(index)}
                      className="accent-green"
                    />
                    Cover image
                  </label>
                </div>
                <button type="button" onClick={() => removeMedia(index)} className="text-gray hover:text-red-400 text-sm">
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-navy-light border border-white/5 rounded-xl p-6 space-y-3">
            <h3 className="font-barlow-condensed text-xl tracking-wide text-white">{title || 'Untitled'}</h3>
            {summary && <p className="text-gray text-sm">{summary}</p>}
            {(clientName || location) && (
              <p className="text-xs text-gray uppercase tracking-widest">
                {[clientName, location].filter(Boolean).join(' · ')}
              </p>
            )}
            {outcome && (
              <span className="inline-block text-xs bg-green/10 text-green px-2 py-1 rounded">{outcome}</span>
            )}
          </div>
          <MarkdownContent content={body} />
          <label className="flex items-center gap-3 text-sm text-gray">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="accent-green"
            />
            Publish immediately
          </label>
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex flex-wrap gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="px-5 py-2.5 border border-white/10 text-gray rounded-lg text-sm font-bold uppercase tracking-widest hover:text-white"
          >
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="bg-green text-navy px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest hover:opacity-90"
          >
            Next
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => handleSubmit(false)}
              className="px-5 py-2.5 border border-white/10 text-white rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-white/5 disabled:opacity-50"
            >
              Save draft
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => handleSubmit(published || true)}
              className="bg-green text-navy px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
            >
              {pending ? 'Saving…' : isEdit ? 'Update case study' : 'Publish case study'}
            </button>
          </>
        )}
        <Link
          href={`/admin/services/${service.id}/case-studies`}
          className="px-5 py-2.5 text-gray hover:text-white text-sm font-bold uppercase tracking-widest"
        >
          Cancel
        </Link>
      </div>
    </div>
  )
}
