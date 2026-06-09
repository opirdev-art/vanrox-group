'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NotificationBell } from '@/components/admin/notification-bell'
import type { AdminNotificationRow } from '@/lib/notifications/queries'
import { ADMIN_NAV_ITEMS } from '../admin-nav-items'
import { LogoutButton } from '../logout-button'

function NavLinks({
  pathname,
  onNavigate,
  linkRef,
}: {
  pathname: string
  onNavigate?: () => void
  linkRef?: React.Ref<HTMLAnchorElement>
}) {
  return (
    <nav className="flex-grow p-4 pt-6 space-y-1" aria-label="Admin navigation">
      {ADMIN_NAV_ITEMS.map((item, index) => {
        const isActive =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.label}
            ref={index === 0 ? linkRef : undefined}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-3 px-4 py-3 min-h-11 rounded-md transition-all group ${
              isActive
                ? 'bg-white/10 text-white'
                : 'text-gray hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={20} className={`transition-colors ${isActive ? 'text-green' : 'group-hover:text-green'}`} />
            <span className="font-barlow-condensed text-[0.9rem] font-bold tracking-widest uppercase">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

type AdminShellProps = {
  children: React.ReactNode
  initialNotifications: AdminNotificationRow[]
  initialUnreadCount: number
}

export function AdminShell({
  children,
  initialNotifications,
  initialUnreadCount,
}: AdminShellProps) {
  const pathname = usePathname()
  const menuId = useId()
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useEffect(() => {
    closeMenu()
  }, [pathname, closeMenu])

  useEffect(() => {
    if (!menuOpen) return

    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu()
        menuButtonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const focusTimer = window.setTimeout(() => firstLinkRef.current?.focus(), 0)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
      window.clearTimeout(focusTimer)
    }
  }, [menuOpen, closeMenu])

  return (
    <div className="flex-grow bg-navy text-white flex flex-col lg:flex-row min-h-0 w-full">
      <header className="lg:hidden sticky top-[calc(var(--header-height)+env(safe-area-inset-top,0px))] z-40 flex items-center justify-between px-4 h-14 bg-navy-light border-b border-white/5 shrink-0">
        <Link href="/admin" className="font-bebas text-xl tracking-[2px] text-white no-underline">
          VANROX <span className="text-green text-sm font-barlow-condensed tracking-widest uppercase">Admin</span>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationBell
            initialNotifications={initialNotifications}
            initialUnreadCount={initialUnreadCount}
          />
          <button
          ref={menuButtonRef}
          type="button"
          className="flex items-center justify-center min-h-11 min-w-11 rounded-sm border border-green/30 text-green hover:bg-green/10 transition-colors"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? 'Close admin menu' : 'Open admin menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </header>

      <aside className="hidden lg:flex w-64 shrink-0 border-r border-white/5 bg-navy-light flex-col">
        <div className="px-4 pt-6 pb-2 flex items-center justify-between gap-2">
          <span className="font-bebas text-lg tracking-[2px] text-white">VANROX</span>
          <NotificationBell
            initialNotifications={initialNotifications}
            initialUnreadCount={initialUnreadCount}
          />
        </div>
        <NavLinks pathname={pathname} />
        <div className="p-4 border-t border-white/5">
          <LogoutButton />
        </div>
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-navy/80"
            aria-label="Close admin menu"
            onClick={closeMenu}
          />
          <aside
            id={menuId}
            className="absolute top-[calc(var(--header-height)+env(safe-area-inset-top,0px))] left-0 bottom-0 w-72 max-w-[85vw] bg-navy-light border-r border-white/5 flex flex-col shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
          >
            <div className="flex items-center justify-between px-4 h-14 border-b border-white/5 shrink-0">
              <span className="font-bebas text-xl tracking-[2px]">VANROX Admin</span>
              <button
                type="button"
                className="flex items-center justify-center min-h-11 min-w-11 text-gray hover:text-white"
                aria-label="Close admin menu"
                onClick={closeMenu}
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={closeMenu} linkRef={firstLinkRef} />
            <div className="p-4 border-t border-white/5">
              <LogoutButton />
            </div>
          </aside>
        </div>
      )}

      <div className="flex-grow min-w-0 overflow-auto p-4 md:p-6 lg:p-10 bg-navy">
        {children}
      </div>
    </div>
  )
}
