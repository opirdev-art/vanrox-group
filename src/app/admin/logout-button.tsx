'use client'

import { LogOut } from 'lucide-react'
import { logout } from './actions'

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-all font-barlow-condensed text-[0.9rem] font-bold tracking-widest uppercase"
      >
        <LogOut size={20} />
        Logout
      </button>
    </form>
  )
}
