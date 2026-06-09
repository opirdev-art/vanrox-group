'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_CTA, isPublicRoute } from './nav-items'

export default function MobileBottomCta() {
  const pathname = usePathname()
  const show = isPublicRoute(pathname)

  if (!show) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden border-t border-green/20 bg-navy/95 px-6 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
      role="region"
      aria-label="Quick booking"
    >
      <Link
        href={NAV_CTA.href}
        className="flex items-center justify-center min-h-11 w-full bg-green text-navy rounded-sm font-barlow-condensed font-bold text-[0.9rem] tracking-[1.5px] uppercase hover:bg-green/80 transition-all"
      >
        {NAV_CTA.label}
      </Link>
    </div>
  )
}
