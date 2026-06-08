'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'
import type { CaseStudyRecord } from '@/lib/service-pages/types'
import type { ServiceRecord } from '@/lib/services/queries'
import { getActionError } from '@/lib/service-pages/action-result'
import {
  deleteCaseStudy,
  toggleCaseStudyPublished,
  updateCaseStudySortOrder,
} from '../content-actions'

type CaseStudyListProps = {
  service: ServiceRecord
  studies: CaseStudyRecord[]
}

function actionError(result: Parameters<typeof getActionError>[0]): string | null {
  return getActionError(result)
}

export function CaseStudyList({ service, studies: initialStudies }: CaseStudyListProps) {
  const [studies, setStudies] = useState(initialStudies)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function moveStudy(index: number, direction: -1 | 1) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= studies.length) return

    const reordered = [...studies]
    const [item] = reordered.splice(index, 1)
    reordered.splice(nextIndex, 0, item)
    setStudies(reordered)

    startTransition(async () => {
      const result = await updateCaseStudySortOrder(
        service.id,
        reordered.map((s) => s.id)
      )
      const err = actionError(result)
      if (err) setError(err)
    })
  }

  function handleToggle(id: number, published: boolean) {
    setError('')
    startTransition(async () => {
      const result = await toggleCaseStudyPublished(service.id, id, published)
      const err = actionError(result)
      if (err) {
        setError(err)
        return
      }
      setStudies((rows) =>
        rows.map((row) => (row.id === id ? { ...row, published } : row))
      )
    })
  }

  function handleDelete(id: number) {
    if (!confirm('Delete this case study?')) return
    setError('')
    startTransition(async () => {
      const result = await deleteCaseStudy(service.id, id)
      const err = actionError(result)
      if (err) {
        setError(err)
        return
      }
      setStudies((rows) => rows.filter((row) => row.id !== id))
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/admin/services/${service.id}/content`}
          className="text-sm text-gray border border-white/10 px-3 py-1.5 rounded font-bold tracking-widest uppercase hover:text-white"
        >
          Service page
        </Link>
        <Link
          href={`/admin/services/${service.id}/case-studies/new`}
          className="bg-green text-navy px-4 py-2 rounded-lg font-barlow-condensed font-bold tracking-widest uppercase text-sm hover:opacity-90"
        >
          Add case study
        </Link>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {studies.length === 0 ? (
        <div className="bg-navy-light border border-white/5 rounded-xl p-10 text-center text-gray">
          No case studies yet. Add your first project story.
        </div>
      ) : (
        <section className="bg-navy-light border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[0.7rem] text-gray uppercase tracking-widest font-bold bg-white/[0.02]">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {studies.map((study, index) => (
                <tr key={study.id} className="hover:bg-white/5">
                  <td className="px-6 py-5">
                    <div className="text-white font-medium">{study.title}</div>
                    {study.summary && (
                      <div className="text-xs text-gray line-clamp-1 max-w-md">{study.summary}</div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-gray text-sm">{study.slug}</td>
                  <td className="px-6 py-5">
                    <label className="flex items-center gap-2 text-sm text-gray">
                      <input
                        type="checkbox"
                        checked={study.published}
                        disabled={pending}
                        onChange={(e) => handleToggle(study.id, e.target.checked)}
                        className="accent-green"
                      />
                      Published
                    </label>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        type="button"
                        disabled={pending || index === 0}
                        onClick={() => moveStudy(index, -1)}
                        className="p-1.5 text-gray hover:text-white disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={pending || index === studies.length - 1}
                        onClick={() => moveStudy(index, 1)}
                        className="p-1.5 text-gray hover:text-white disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <Link
                        href={`/admin/services/${service.id}/case-studies/${study.id}`}
                        className="text-[0.7rem] text-green border border-green/30 px-3 py-1.5 rounded font-bold tracking-widest uppercase hover:bg-green/10"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleDelete(study.id)}
                        className="p-1.5 text-gray hover:text-red-400 disabled:opacity-30"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
