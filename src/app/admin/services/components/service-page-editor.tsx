'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ExternalLink, Plus, Trash2 } from 'lucide-react'
import type { ProcessStep, ServicePageRecord } from '@/lib/service-pages/types'
import type { ServiceRecord } from '@/lib/services/queries'
import { MarkdownContent } from '@/components/content/markdown-content'
import { getActionError } from '@/lib/service-pages/action-result'
import { uploadServiceHeroImage, upsertServicePage } from '../content-actions'

type ServicePageEditorProps = {
  service: ServiceRecord
  page: ServicePageRecord | null
}

function emptyStep(count: number): ProcessStep {
  return { step_number: count, title: '', description: '' }
}

export function ServicePageEditor({ service, page }: ServicePageEditorProps) {
  const [tagline, setTagline] = useState(page?.tagline ?? '')
  const [heroImageUrl, setHeroImageUrl] = useState(page?.hero_image_url ?? '')
  const [overview, setOverview] = useState(page?.overview ?? '')
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(
    page?.process_steps?.length ? page.process_steps : [emptyStep(1)]
  )
  const [published, setPublished] = useState(page?.published ?? false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pending, startTransition] = useTransition()
  const [uploadingHero, setUploadingHero] = useState(false)

  function updateStep(index: number, patch: Partial<ProcessStep>) {
    setProcessSteps((steps) =>
      steps.map((step, i) => (i === index ? { ...step, ...patch } : step))
    )
  }

  function addStep() {
    setProcessSteps((steps) => [...steps, emptyStep(steps.length + 1)])
  }

  function removeStep(index: number) {
    setProcessSteps((steps) =>
      steps
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, step_number: i + 1 }))
    )
  }

  async function handleHeroUpload(file: File) {
    setUploadingHero(true)
    setError('')
    const formData = new FormData()
    formData.set('file', file)
    const result = await uploadServiceHeroImage(service.id, formData)
    setUploadingHero(false)
    if (!result.ok) {
      setError(getActionError(result) ?? 'Upload failed')
      return
    }
    if (result.url) setHeroImageUrl(result.url)
  }

  function handleSave() {
    setError('')
    setSuccess('')
    startTransition(async () => {
      const cleanedSteps = processSteps
        .map((step, index) => ({
          step_number: index + 1,
          title: step.title.trim(),
          description: step.description.trim(),
        }))
        .filter((step) => step.title && step.description)

      const result = await upsertServicePage(service.id, {
        tagline,
        hero_image_url: heroImageUrl,
        overview,
        process_steps: cleanedSteps,
        published,
      })

      const err = getActionError(result)
      if (err) {
        setError(err)
        return
      }
      setSuccess('Service page saved.')
    })
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/services/${service.slug}`}
          target="_blank"
          className="inline-flex items-center gap-2 text-sm text-green border border-green/30 px-3 py-1.5 rounded font-bold tracking-widest uppercase hover:bg-green/10"
        >
          Preview <ExternalLink size={14} />
        </Link>
        <Link
          href={`/admin/services/${service.id}/case-studies`}
          className="text-sm text-gray border border-white/10 px-3 py-1.5 rounded font-bold tracking-widest uppercase hover:text-white"
        >
          Case studies
        </Link>
      </div>

      <section className="space-y-4">
        <label className="text-[0.65rem] text-gray uppercase tracking-widest font-bold">Tagline</label>
        <input
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Hero headline for this service"
          className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-green outline-none"
        />
      </section>

      <section className="space-y-4">
        <label className="text-[0.65rem] text-gray uppercase tracking-widest font-bold">Hero image</label>
        {heroImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroImageUrl} alt="" className="max-h-48 rounded-lg border border-white/10" />
        )}
        <input
          type="file"
          accept="image/*"
          disabled={uploadingHero}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleHeroUpload(file)
          }}
          className="block text-sm text-gray"
        />
        <input
          value={heroImageUrl}
          onChange={(e) => setHeroImageUrl(e.target.value)}
          placeholder="Or paste image URL"
          className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-green outline-none text-sm"
        />
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[0.65rem] text-gray uppercase tracking-widest font-bold">Overview (markdown)</label>
          <textarea
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            rows={16}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-green outline-none resize-y font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[0.65rem] text-gray uppercase tracking-widest font-bold">Preview</label>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 min-h-[20rem]">
            <MarkdownContent content={overview} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-barlow-condensed text-lg tracking-widest uppercase text-white">How we work</h2>
          <button
            type="button"
            onClick={addStep}
            className="inline-flex items-center gap-1 text-sm text-green hover:underline"
          >
            <Plus size={16} /> Add step
          </button>
        </div>
        <div className="space-y-4">
          {processSteps.map((step, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray uppercase tracking-widest">Step {index + 1}</span>
                {processSteps.length > 1 && (
                  <button type="button" onClick={() => removeStep(index)} className="text-gray hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <input
                value={step.title}
                onChange={(e) => updateStep(index, { title: e.target.value })}
                placeholder="Step title"
                className="w-full bg-navy border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:border-green outline-none"
              />
              <textarea
                value={step.description}
                onChange={(e) => updateStep(index, { description: e.target.value })}
                placeholder="What happens in this step"
                rows={2}
                className="w-full bg-navy border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:border-green outline-none resize-none"
              />
            </div>
          ))}
        </div>
      </section>

      <label className="flex items-center gap-3 text-sm text-gray">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="accent-green"
        />
        Published (visible on public service page)
      </label>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green text-sm">{success}</p>}

      <button
        type="button"
        disabled={pending}
        onClick={handleSave}
        className="bg-green text-navy px-6 py-3 rounded-lg font-barlow-condensed font-bold tracking-widest uppercase text-sm hover:opacity-90 disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save service page'}
      </button>
    </div>
  )
}
