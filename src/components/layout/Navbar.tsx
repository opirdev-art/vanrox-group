'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NAV_CTA, NAV_LINKS } from './nav-items'
import { VanroxLogo } from './VanroxLogo'

const linkClass =
  'text-off-white hover:text-green text-[0.85rem] font-medium tracking-[1.5px] uppercase transition-colors'
const mobileLinkClass =
  'block min-h-11 py-3 text-off-white hover:text-green text-[1rem] font-medium tracking-[1.5px] uppercase transition-colors'

export default function Navbar() {
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
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top,0px)] bg-navy border-b border-green/15 md:bg-navy/90 md:backdrop-blur-md"
        role="banner"
      >
        <nav
          className="flex items-center justify-between px-6 h-[var(--header-height)]"
          aria-label="Main navigation"
        >
          <Link href="/" className="flex items-center gap-3.5 no-underline min-w-0">
            <VanroxLogo />
          </Link>

          <ul className="hidden md:flex gap-9 list-none m-0 p-0">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={linkClass}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={NAV_CTA.href} className="bg-green text-navy px-6 py-2.5 rounded-sm font-bold text-[0.85rem] tracking-[1.5px] uppercase hover:bg-green/80 transition-all min-h-11 inline-flex items-center">
                {NAV_CTA.label}
              </Link>
            </li>
          </ul>

          <button
            ref={menuButtonRef}
            type="button"
            className="md:hidden flex items-center justify-center min-h-11 min-w-11 rounded-sm border border-green/30 text-green hover:bg-green/10 transition-colors"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </nav>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-navy/80"
            aria-label="Close menu"
            onClick={closeMenu}
          />
          <div
            id={menuId}
            className="absolute top-[calc(var(--header-height)+env(safe-area-inset-top,0px))] left-0 right-0 bottom-0 bg-navy-light border-t border-green/15 overflow-y-auto px-6 py-6"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <ul className="list-none m-0 p-0 space-y-1">
              {NAV_LINKS.map((item, index) => (
                <li key={item.href}>
                  <Link
                    ref={index === 0 ? firstLinkRef : undefined}
                    href={item.href}
                    className={mobileLinkClass}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-4">
                <Link
                  href={NAV_CTA.href}
                  className="flex items-center justify-center min-h-11 w-full bg-green text-navy rounded-sm font-barlow-condensed font-bold text-[0.9rem] tracking-[1.5px] uppercase hover:bg-green/80 transition-all"
                  onClick={closeMenu}
                >
                  {NAV_CTA.label}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
