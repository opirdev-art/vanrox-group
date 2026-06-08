'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toggleServiceActive } from '../actions'

export function ServiceToggle({
  serviceId,
  isActive,
}: {
  serviceId: number
  isActive: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleServiceActive(serviceId, !isActive)
          router.refresh()
        })
      }
      className={`text-[0.65rem] px-2.5 py-1 rounded-full font-bold tracking-widest uppercase ${
        isActive ? 'bg-green/10 text-green' : 'bg-gray-500/10 text-gray-400'
      } disabled:opacity-50`}
    >
      {pending ? '…' : isActive ? 'Active' : 'Hidden'}
    </button>
  )
}
