import Link from 'next/link'

import { HeroEffects } from '@/components/home/HeroEffects'

type HeroProps = {
  serviceArea?: string
}

export default function Hero({ serviceArea }: HeroProps) {
  return (
    <section id="home" className="group min-h-screen flex items-center relative px-6 py-20 md:px-15 md:py-30 overflow-hidden">
      <HeroEffects />

      <div className="relative z-10 max-w-[700px]">
        <div className="flex items-center gap-2.5 font-barlow-condensed text-[0.8rem] font-semibold tracking-[3px] uppercase text-green mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <span className="block w-8 h-[2px] bg-green"></span>
          Tobago & Trinidad
        </div>
        <h1 className="font-bebas text-[clamp(3.5rem,7vw,6.5rem)] leading-[0.95] tracking-[4px] mb-2.5 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          VANROX<br/>
          <span className="text-green">Engineering</span>
        </h1>
        <div className="font-barlow-condensed text-[1.1rem] font-normal tracking-[4px] text-gray uppercase mb-7.5 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          Mapping a Better Future
        </div>
        <p className="text-[1.05rem] leading-[1.75] text-off-white max-w-[520px] mb-11 font-light animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          Professional land surveying and engineering services
          {serviceArea ? ` based in ${serviceArea}` : ' across Trinidad & Tobago'}.
          From boundary surveys to development planning, we deliver precision you can trust.
        </p>
        <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-400">
          <Link href="/services" className="bg-green text-navy px-9 py-4 font-barlow-condensed text-[0.95rem] font-bold tracking-[2px] uppercase rounded-sm hover:bg-green/80 hover:-translate-y-0.5 transition-all shadow-[0_0_30px_rgba(125,194,66,0.3)] hover:shadow-[0_8px_40px_rgba(125,194,66,0.4)]">
            Our Services
          </Link>
          <Link href="/schedule" className="border border-green/40 text-white px-9 py-4 font-barlow-condensed text-[0.95rem] font-semibold tracking-[2px] uppercase rounded-sm hover:border-green hover:bg-green/10 hover:-translate-y-0.5 transition-all">
            Get a Quote
          </Link>
        </div>
      </div>

      <div className="absolute bottom-15 right-15 hidden lg:flex gap-12 z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
        <div className="text-center">
          <div className="font-bebas text-[2.8rem] text-green leading-none tracking-[2px]">15+</div>
          <div className="text-[0.7rem] font-medium tracking-[2px] uppercase text-gray mt-1">Years Experience</div>
        </div>
        <div className="text-center">
          <div className="font-bebas text-[2.8rem] text-green leading-none tracking-[2px]">500+</div>
          <div className="text-[0.7rem] font-medium tracking-[2px] uppercase text-gray mt-1">Projects Done</div>
        </div>
        <div className="text-center">
          <div className="font-bebas text-[2.8rem] text-green leading-none tracking-[2px]">100%</div>
          <div className="text-[0.7rem] font-medium tracking-[2px] uppercase text-gray mt-1">Licensed</div>
        </div>
      </div>
    </section>
  )
}
