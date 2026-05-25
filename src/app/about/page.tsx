import Link from 'next/link'

export default function AboutPage() {
  const pillars = [
    { icon: '🎯', title: 'Precision', desc: 'State-of-the-art GPS and total station technology for survey-grade accuracy.' },
    { icon: '⚡', title: 'Efficiency', desc: 'Fast turnaround times without compromising quality or compliance.' },
    { icon: '📋', title: 'Compliance', desc: 'Fully licensed and operating in accordance with T&T regulatory standards.' },
    { icon: '🤝', title: 'Integrity', desc: 'Transparent communication and honest advice on every engagement.' },
  ]

  return (
    <div className="bg-navy-light relative overflow-hidden">
      <section id="about" className="px-6 py-24 md:px-15 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <div className="about-text">
            <div className="inline-flex items-center gap-2.5 font-barlow-condensed text-[0.75rem] font-semibold tracking-[3px] uppercase text-green mb-4">
              <span className="block w-6 h-[0.5px] bg-green"></span>
              Who We Are
            </div>
            <h2 className="font-bebas text-4xl md:text-5xl tracking-[3px] leading-none mb-5">
              Precision & <span className="text-green">Expertise</span> You Can Rely On
            </h2>
            <div className="space-y-4 text-off-white font-light leading-[1.85]">
              <p>
                VANROX Engineering and Surveying Services is a trusted leader in land surveying and engineering consultancy across Trinidad & Tobago. We combine modern technology with deep local knowledge to deliver results with unmatched accuracy.
              </p>
              <p>
                Our team of licensed surveyors and engineers brings decades of combined experience to every project — whether it's a residential boundary survey, a large-scale infrastructure development, or a complex topographic assessment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-9">
              {pillars.map((pillar, index) => (
                <div key={index} className="bg-green/5 border border-green/15 rounded-md p-5 hover:bg-green/10 hover:border-green/35 transition-all group">
                  <div className="text-2xl mb-2.5">{pillar.icon}</div>
                  <h4 className="font-barlow-condensed text-[0.95rem] font-bold tracking-[1.5px] uppercase text-green mb-1.5">{pillar.title}</h4>
                  <p className="text-[0.82rem] text-gray leading-normal">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="about-visual">
            <div className="bg-gradient-to-br from-navy-mid to-navy-light border border-green/20 rounded-xl p-12 text-center relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-green to-transparent opacity-50"></div>
              
              <svg className="w-35 mx-auto mb-6 block" viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 10L20 38v55c0 45 32 82 80 92 48-10 80-47 80-92V38L100 10z" fill="#162847" stroke="#7dc242" strokeWidth="2"/>
                <path d="M100 42L66 72h8v36h52V72h8L100 42z" fill="white"/>
                <rect x="86" y="84" width="28" height="24" fill="#0d1f3c"/>
                <rect x="89" y="87" width="12" height="10" fill="#7dc242" opacity="0.85"/>
                <path d="M68 108 Q100 122 132 108" stroke="#7dc242" strokeWidth="1.5" fill="none"/>
                <ellipse cx="100" cy="115" rx="34" ry="14" fill="#7dc242" opacity="0.35"/>
                <ellipse cx="100" cy="113" rx="28" ry="10" fill="#7dc242" opacity="0.55"/>
              </svg>

              <div className="font-bebas text-3xl tracking-[4px] mb-1.5 text-white">VANROX</div>
              <div className="font-barlow-condensed text-green text-[0.75rem] font-semibold tracking-[2.5px] uppercase mb-1">Engineering and Surveying Services</div>
              <div className="text-gray text-[0.8rem] tracking-[2px] uppercase mb-7.5">Mapping a Better Future</div>

              <div className="h-[1px] bg-green/15 my-6"></div>

              <div className="flex justify-center gap-10">
                <div className="text-center">
                  <div className="font-bebas text-2xl text-green tracking-[2px]">15+</div>
                  <div className="text-[0.7rem] text-gray tracking-[1.5px] uppercase">Years</div>
                </div>
                <div className="text-center">
                  <div className="font-bebas text-2xl text-green tracking-[2px]">T&T</div>
                  <div className="text-[0.7rem] text-gray tracking-[1.5px] uppercase">Licensed</div>
                </div>
                <div className="text-center">
                  <div className="font-bebas text-2xl text-green tracking-[2px]">500+</div>
                  <div className="text-[0.7rem] text-gray tracking-[1.5px] uppercase">Projects</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Background Decorative Elements */}
      <div className="absolute -right-[200px] -top-[200px] w-[600px] h-[600px] rounded-full border border-green/[0.08] pointer-events-none"></div>
      <div className="absolute -right-[100px] -top-[100px] w-[400px] h-[400px] rounded-full border border-green/[0.06] pointer-events-none"></div>
    </div>
  )
}
