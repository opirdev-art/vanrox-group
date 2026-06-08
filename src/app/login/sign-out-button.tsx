'use client'

import { useTransition } from 'react'
import { LogOut } from 'lucide-react'
import { signOutFromLogin } from './actions'

export function SignOutButton() {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => signOutFromLogin())}
      className="w-full flex items-center justify-center gap-2 py-3 border border-white/10 rounded-lg text-gray hover:text-white hover:bg-white/5 transition-all font-barlow-condensed text-[0.8rem] font-bold tracking-widest uppercase disabled:opacity-50"
    >
      <LogOut size={16} />
      {pending ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
