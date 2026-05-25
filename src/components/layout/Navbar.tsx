import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-navy/90 backdrop-blur-md border-bottom border-green/15">
      <Link href="/" className="flex items-center gap-3.5 no-underline">
        <svg className="w-11 h-11" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 3L6 9v14c0 9 7 16.5 16 18 9-1.5 16-9 16-18V9L22 3z" fill="#162847" stroke="#7dc242" strokeWidth="1.2"/>
          <path d="M22 11l-7 6h2v7h10v-7h2l-7-6z" fill="white"/>
          <rect x="19" y="18" width="6" height="6" fill="#0d1f3c"/>
          <rect x="20" y="19" width="3" height="2" fill="#7dc242"/>
          <ellipse cx="22" cy="28" rx="8" ry="4" fill="#7dc242" opacity="0.7"/>
        </svg>
        <div className="leading-tight">
          <div className="font-bebas text-2xl text-white tracking-[3px]">VANROX</div>
          <div className="font-barlow-condensed text-[0.6rem] text-green tracking-[2.5px] font-semibold uppercase">
            Engineering & Surveying
          </div>
        </div>
      </Link>

      <ul className="hidden md:flex gap-9 list-none">
        <li><Link href="/" className="text-off-white hover:text-green text-[0.85rem] font-medium tracking-[1.5px] uppercase transition-colors">Home</Link></li>
        <li><Link href="/about" className="text-off-white hover:text-green text-[0.85rem] font-medium tracking-[1.5px] uppercase transition-colors">About</Link></li>
        <li><Link href="/services" className="text-off-white hover:text-green text-[0.85rem] font-medium tracking-[1.5px] uppercase transition-colors">Services</Link></li>
        <li><Link href="/insights" className="text-off-white hover:text-green text-[0.85rem] font-medium tracking-[1.5px] uppercase transition-colors">Insights</Link></li>
        <li><Link href="/schedule" className="bg-green text-navy px-6 py-2.5 rounded-sm font-bold text-[0.85rem] tracking-[1.5px] uppercase hover:bg-green/80 transition-all">Book Now</Link></li>
      </ul>
    </nav>
  )
}
