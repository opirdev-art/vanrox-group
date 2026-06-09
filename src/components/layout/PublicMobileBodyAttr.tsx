'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { isPublicRoute } from './nav-items'

export default function PublicMobileBodyAttr() {
  const pathname = usePathname()

  useEffect(() => {
    if (isPublicRoute(pathname)) {
      document.body.dataset.publicMobile = 'true'
    } else {
      delete document.body.dataset.publicMobile
    }
    return () => {
      delete document.body.dataset.publicMobile
    }
  }, [pathname])

  return null
}
