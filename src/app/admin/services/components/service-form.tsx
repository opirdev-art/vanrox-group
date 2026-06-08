'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import type { ServiceRecord } from '@/lib/services/queries'
import { createService, updateService } from '../actions'

type ServiceFormProps = {
  service?: ServiceRecord
}

export function ServiceForm({ service }: ServiceFormProps) {
  const isEdit = Boolean(service)
  const action = isEdit
    ? updateService.bind(null, service!.id)
    : createService

  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string }, formData: FormData) => {
      const result = await action(formData)
      if (result.ok === false) return { error: result.error }
      return { error: '' }
    },
    { error: '' }
  )

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <label className="text-[0.65rem] text-gray uppercase tracking-widest font-bold">Name</label>
        <input
          name="name"
          required
          defaultValue={service?.name ?? ''}
          className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-green outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[0.65rem] text-gray uppercase tracking-widest font-bold">Slug</label>
        <input
          name="slug"
          defaultValue={service?.slug ?? ''}
          placeholder="auto-generated-from-name if empty"
          className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-green outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[0.65rem] text-gray uppercase tracking-widest font-bold">Description</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={service?.description ?? ''}
          className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-green outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[0.65rem] text-gray uppercase tracking-widest font-bold">Icon (emoji)</label>
          <input
            name="icon"
            defaultValue={service?.metadata?.icon ?? ''}
            placeholder="📐"
            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-green outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[0.65rem] text-gray uppercase tracking-widest font-bold">Sort order</label>
          <input
            name="sort_order"
            type="number"
            defaultValue={service?.sort_order ?? 0}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-green outline-none"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm text-gray">
        <input
          name="is_active"
          type="checkbox"
          defaultChecked={service?.is_active ?? true}
          className="accent-green"
        />
        Active (visible on website and booking)
      </label>

      {state.error && <p className="text-red-400 text-sm">{state.error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-green text-navy px-6 py-3 rounded-lg font-barlow-condensed font-bold tracking-widest uppercase text-sm hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Saving…' : isEdit ? 'Update service' : 'Create service'}
        </button>
        <Link
          href="/admin/services"
          className="px-6 py-3 rounded-lg border border-white/10 text-gray hover:text-white font-barlow-condensed font-bold tracking-widest uppercase text-sm"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
