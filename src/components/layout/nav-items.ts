export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/insights', label: 'Insights' },
] as const

export const NAV_CTA = { href: '/schedule', label: 'Book Now' } as const

export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin')
}

/** Public marketing chrome (navbar + footer) — excluded on auth routes; admin uses its own ChromeShell branch. */
export function showMarketingChrome(pathname: string): boolean {
  if (pathname.startsWith('/admin')) return false
  if (pathname.startsWith('/auth')) return false
  return true
}

/** Bottom CTA + extra bottom padding on public marketing pages. */
export function isPublicRoute(pathname: string): boolean {
  if (pathname.startsWith('/admin')) return false
  if (pathname.startsWith('/auth')) return false
  if (pathname === '/login') return false
  if (pathname === '/schedule') return false
  return true
}
