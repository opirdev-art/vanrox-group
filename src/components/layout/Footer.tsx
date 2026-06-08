import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#081526] px-15 py-12 border-t border-green/10">
      <div className="flex flex-wrap justify-between items-center pb-6 border-b border-white/5 gap-5">
        <div className="flex items-center gap-3.5">
          <svg className="w-9 h-9" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 3L6 9v14c0 9 7 16.5 16 18 9-1.5 16-9 16-18V9L22 3z" fill="#162847" stroke="#7dc242" strokeWidth="1.2"/>
            <path d="M22 11l-7 6h2v7h10v-7h2l-7-6z" fill="white"/>
            <rect x="19" y="18" width="6" height="6" fill="#0d1f3c"/>
            <rect x="20" y="19" width="3" height="2" fill="#7dc242"/>
            <ellipse cx="22" cy="28" rx="8" ry="4" fill="#7dc242" opacity="0.7"/>
          </svg>
          <div>
            <div className="font-bebas text-xl text-white tracking-[3px]">VANROX</div>
            <div className="font-barlow-condensed text-[0.55rem] text-green tracking-[2px] font-semibold uppercase">
              Engineering & Surveying Services
            </div>
          </div>
        </div>

        <ul className="flex flex-wrap gap-7 list-none">
          <li><Link href="/" className="text-gray hover:text-green text-[0.8rem] font-medium tracking-[1.5px] uppercase transition-colors">Home</Link></li>
          <li><Link href="/about" className="text-gray hover:text-green text-[0.8rem] font-medium tracking-[1.5px] uppercase transition-colors">About</Link></li>
          <li><Link href="/services" className="text-gray hover:text-green text-[0.8rem] font-medium tracking-[1.5px] uppercase transition-colors">Services</Link></li>
          <li><Link href="/insights" className="text-gray hover:text-green text-[0.8rem] font-medium tracking-[1.5px] uppercase transition-colors">Insights</Link></li>
          <li><Link href="/contact" className="text-gray hover:text-green text-[0.8rem] font-medium tracking-[1.5px] uppercase transition-colors">Contact</Link></li>
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
        <div className="font-barlow-condensed text-[0.75rem] font-semibold tracking-[3px] uppercase text-gray/50">
          Mapping a Better Future | Tobago: 2721240
        </div>
      </div>
    </footer>
  )
}
