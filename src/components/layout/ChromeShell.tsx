'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import MobileBottomCta from './MobileBottomCta'
import { isAdminRoute, showMarketingChrome } from './nav-items'

export default function ChromeShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (isAdminRoute(pathname)) {
    return (
      <>
        <Navbar />
        <main className="site-main flex-grow flex flex-col min-h-0">{children}</main>
        <Footer />
      </>
    )
  }

  if (showMarketingChrome(pathname)) {
    return (
      <>
        <Navbar />
        <main className="site-main flex-grow">{children}</main>
        <Footer />
        <MobileBottomCta />
      </>
    )
  }

  return <main className="flex-grow">{children}</main>
}
