'use client'

import Link from 'next/link'
import { useBusinessSettings } from './business-settings-provider'
import { displayPhone, mailtoHref, phoneTelHref } from '@/lib/settings/contact'
import { VanroxLogo } from './VanroxLogo'

export default function Footer() {
  const { phone, email, address } = useBusinessSettings()
  const telHref = phoneTelHref(phone)
  const emailHref = mailtoHref(email)
  const phoneLabel = displayPhone(phone)

  return (
    <footer className="site-footer bg-[#081526] px-6 md:px-15 py-12 border-t border-green/10">
      <div className="flex flex-wrap justify-between items-center pb-6 border-b border-white/5 gap-5">
        <div className="flex items-center gap-3.5">
          <VanroxLogo size="sm" showSubtitle />
        </div>

        <ul className="flex flex-wrap gap-3 list-none m-0 p-0">
          <li><Link href="/" className="inline-flex items-center min-h-11 px-2 text-gray hover:text-green text-[0.8rem] font-medium tracking-[1.5px] uppercase transition-colors">Home</Link></li>
          <li><Link href="/about" className="inline-flex items-center min-h-11 px-2 text-gray hover:text-green text-[0.8rem] font-medium tracking-[1.5px] uppercase transition-colors">About</Link></li>
          <li><Link href="/services" className="inline-flex items-center min-h-11 px-2 text-gray hover:text-green text-[0.8rem] font-medium tracking-[1.5px] uppercase transition-colors">Services</Link></li>
          <li><Link href="/reviews" className="inline-flex items-center min-h-11 px-2 text-gray hover:text-green text-[0.8rem] font-medium tracking-[1.5px] uppercase transition-colors">Reviews</Link></li>
          <li><Link href="/insights" className="inline-flex items-center min-h-11 px-2 text-gray hover:text-green text-[0.8rem] font-medium tracking-[1.5px] uppercase transition-colors">Insights</Link></li>
          <li><Link href="/schedule" className="inline-flex items-center min-h-11 px-2 text-gray hover:text-green text-[0.8rem] font-medium tracking-[1.5px] uppercase transition-colors">Book Now</Link></li>
        </ul>
      </div>

      <div className="flex flex-wrap justify-between items-center pt-5 gap-2.5">
        <div className="text-[0.78rem] text-gray flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            © {new Date().getFullYear()} <span className="text-green">VANROX</span> Engineering and Surveying Services. All rights reserved.
          </span>
          <span className="text-white/10 hidden sm:inline" aria-hidden="true">·</span>
          <Link
            href="/login"
            className="text-white/25 hover:text-white/45 text-[0.65rem] tracking-[0.2em] uppercase transition-colors"
          >
            Staff
          </Link>
        </div>
        <div className="font-barlow-condensed text-[0.75rem] font-semibold tracking-[3px] uppercase text-gray/50 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>Mapping a Better Future</span>
          {address && <span className="hidden sm:inline text-white/20">|</span>}
          {address && <span>{address}</span>}
          {phoneLabel && (
            <>
              <span className="text-white/20">|</span>
              <a href={telHref} className="text-gray/70 hover:text-green transition-colors no-underline">
                {phoneLabel}
              </a>
            </>
          )}
          {emailHref && (
            <>
              <span className="text-white/20">|</span>
              <a href={emailHref} className="text-gray/70 hover:text-green transition-colors no-underline">
                {email}
              </a>
            </>
          )}
        </div>
      </div>
    </footer>
  )
}
