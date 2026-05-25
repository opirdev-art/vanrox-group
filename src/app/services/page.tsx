import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function ServicesPage() {
  const services = [
    {
      icon: '📐',
      title: 'Boundary Surveys',
      desc: 'Precise determination and marking of property boundaries in accordance with T&T Land Registry requirements. Essential for land transfers and disputes.'
    },
    {
      icon: '🗺️',
      title: 'Topographic Surveys',
      desc: 'Detailed mapping of natural and man-made features including elevation data. Vital for construction, drainage design, and site planning.'
    },
    {
      icon: '🏗️',
      title: 'Construction Stakeout',
      desc: 'Accurate staking of building footprints, infrastructure alignments and grades to guide contractors during construction phases.'
    },
    {
      icon: '📄',
      title: 'Cadastral Surveys',
      desc: 'Legal boundary surveys for subdivision, amalgamation, and land registration. Prepared to satisfy the requirements of the Land Registry of T&T.'
    },
    {
      icon: '🛰️',
      title: 'GPS / GNSS Surveys',
      desc: 'High-precision GPS-based surveys for control networks, infrastructure projects, and large-scale mapping operations across the country.'
    },
    {
      icon: '📊',
      title: 'Engineering Consultancy',
      desc: 'Expert engineering advice and technical reporting for residential, commercial, and government development projects throughout T&T.'
    }
  ]

  return (
    <section id="services" className="px-6 py-24 md:px-15 bg-navy">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-end mb-15 gap-5">
          <div>
            <div className="inline-flex items-center gap-2.5 font-barlow-condensed text-[0.75rem] font-semibold tracking-[3px] uppercase text-green mb-4">
              <span className="block w-6 h-[0.5px] bg-green"></span>
              What We Do
            </div>
            <h2 className="font-bebas text-4xl md:text-5xl tracking-[3px] leading-none text-white">Our <span className="text-green">Services</span></h2>
          </div>
          <Link href="/schedule" className="border border-green/40 text-white px-9 py-4 font-barlow-condensed text-[0.95rem] font-semibold tracking-[2px] uppercase rounded-sm hover:border-green hover:bg-green/10 hover:-translate-y-1 transition-all flex items-center gap-2 whitespace-nowrap">
            Request a Service <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div key={index} className="bg-navy-light border border-green/10 rounded-lg p-9 transition-all duration-300 relative overflow-hidden hover:border-green/30 hover:-translate-y-1.5 hover:shadow-2xl group cursor-default">
              {/* Progress bar effect on hover */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-green scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              
              <div className="w-13 h-13 bg-green/10 rounded-xl flex items-center justify-center text-2xl mb-5.5 group-hover:bg-green/20 transition-colors">
                {service.icon}
              </div>
              
              <h3 className="font-barlow-condensed text-[1.15rem] font-bold tracking-[1.5px] uppercase text-white mb-3 transition-colors group-hover:text-green">
                {service.title}
              </h3>
              <p className="text-[0.88rem] text-gray leading-[1.75] font-light">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
