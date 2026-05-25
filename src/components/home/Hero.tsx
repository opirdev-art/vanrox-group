import Link from 'next/link'

export default function Hero() {
  return (
    <section id="home" className="min-h-screen flex items-center relative px-15 py-30 overflow-hidden">
      {/* Background with gradients */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_70%_60%_at_80%_50%,rgba(125,194,66,0.08)_0%,transparent_70%),radial-gradient(ellipse_50%_80%_at_10%_80%,rgba(22,40,71,0.9)_0%,transparent_60%),linear-gradient(135deg,#0d1f3c_0%,#1a3258_50%,#0d1f3c_100%)]"></div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(125,194,66,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(125,194,66,0.04)_1px,transparent_1px)] bg-[length:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"></div>

      {/* Hero Deco SVG */}
      <div className="absolute right-0 top-0 w-[55%] h-full overflow-hidden opacity-15 z-0 pointer-events-none">
        <svg viewBox="0 0 600 700" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <line x1="0" y1="150" x2="600" y2="150" stroke="#7dc242" strokeWidth="0.5"/>
          <line x1="0" y1="300" x2="600" y2="300" stroke="#7dc242" strokeWidth="0.5"/>
          <line x1="0" y1="450" x2="600" y2="450" stroke="#7dc242" strokeWidth="0.5"/>
          <line x1="0" y1="600" x2="600" y2="600" stroke="#7dc242" strokeWidth="0.5"/>
          <line x1="150" y1="0" x2="150" y2="700" stroke="#7dc242" strokeWidth="0.5"/>
          <line x1="300" y1="0" x2="300" y2="700" stroke="#7dc242" strokeWidth="0.5"/>
          <line x1="450" y1="0" x2="450" y2="700" stroke="#7dc242" strokeWidth="0.5"/>
          <g stroke="#7dc242" strokeWidth="1">
            <line x1="145" y1="145" x2="155" y2="155"/><line x1="155" y1="145" x2="145" y2="155"/>
            <line x1="295" y1="295" x2="305" y2="305"/><line x1="305" y1="295" x2="295" y2="305"/>
            <line x1="445" y1="145" x2="455" y2="155"/><line x1="455" y1="145" x2="445" y2="155"/>
            <line x1="295" y1="445" x2="305" y2="455"/><line x1="305" y1="445" x2="295" y2="455"/>
            <line x1="445" y1="445" x2="455" y2="455"/><line x1="455" y1="445" x2="445" y2="455"/>
            <line x1="145" y1="595" x2="155" y2="605"/><line x1="155" y1="595" x2="145" y2="605"/>
          </g>
          <path d="M600 350 Q 400 200 200 350 Q 0 500 200 500 Q 400 500 600 350" stroke="#7dc242" strokeWidth="0.8" fill="none"/>
          <path d="M600 280 Q 380 100 160 280 Q -60 460 160 430 Q 380 400 600 280" stroke="#7dc242" strokeWidth="0.5" fill="none"/>
          <circle cx="300" cy="350" r="80" stroke="#7dc242" strokeWidth="0.6" strokeDasharray="4 6" fill="none"/>
          <line x1="300" y1="350" x2="380" y2="350" stroke="#7dc242" strokeWidth="1"/>
          <line x1="300" y1="350" x2="350" y2="280" stroke="#7dc242" strokeWidth="1"/>
        </svg>
      </div>

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
          Professional land surveying and engineering services based in Scarborough, Tobago. 
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
