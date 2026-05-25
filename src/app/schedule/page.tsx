'use client'

import { useState } from 'react'
import { MapPin, User, Phone, CheckCircle2 } from 'lucide-react'

export default function SchedulerPage() {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState('')
  
  const services = [
    'Boundary Survey',
    'Topographic Survey',
    'Construction Stakeout',
    'Cadastral Survey',
    'Engineering Consultancy',
    'Other'
  ]

  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => s - 1)

  return (
    <div className="bg-navy min-h-screen py-24 px-6 md:px-15">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-15">
          <h1 className="font-bebas text-4xl md:text-6xl tracking-[4px] text-white mb-4">Book a <span className="text-green">Survey</span></h1>
          <p className="text-gray font-light">Secure your consultation by following our simple booking process.</p>
        </header>

        {/* Progress Bar */}
        <div className="flex justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5 -z-10 -translate-y-1/2"></div>
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bebas text-lg tracking-widest border transition-all ${
                step >= i ? 'bg-green border-green text-navy' : 'bg-navy border-white/10 text-gray'
              }`}
            >
              {step > i ? <CheckCircle2 size={20} /> : i}
            </div>
          ))}
        </div>

        <div className="bg-navy-light border border-white/5 rounded-2xl p-8 md:p-12 shadow-2xl">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="font-barlow-condensed text-2xl font-bold tracking-widest uppercase text-white mb-6">Select Service</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <button
                    key={service}
                    onClick={() => { setSelectedService(service); nextStep(); }}
                    className={`p-6 text-left border rounded-xl transition-all ${
                      selectedService === service 
                        ? 'bg-green/10 border-green text-green' 
                        : 'bg-white/5 border-white/10 text-gray hover:border-white/20'
                    }`}
                  >
                    <div className="font-barlow-condensed font-bold tracking-widest uppercase">{service}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="font-barlow-condensed text-2xl font-bold tracking-widest uppercase text-white mb-6">Your Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray" size={18} />
                    <input type="text" placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-lg py-3.5 pl-12 pr-4 focus:border-green outline-none transition-all text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray" size={18} />
                    <input type="tel" placeholder="+1 (868) 272-1240" className="w-full bg-white/5 border border-white/10 rounded-lg py-3.5 pl-12 pr-4 focus:border-green outline-none transition-all text-white" />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">Site Location / Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray" size={18} />
                    <input type="text" placeholder="Scarborough, Tobago" className="w-full bg-white/5 border border-white/10 rounded-lg py-3.5 pl-12 pr-4 focus:border-green outline-none transition-all text-white" />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button onClick={prevStep} className="flex-1 py-4 font-barlow-condensed text-[0.9rem] font-bold tracking-widest uppercase border border-white/10 rounded-lg hover:bg-white/5 transition-all">Back</button>
                <button onClick={nextStep} className="flex-[2] py-4 font-barlow-condensed text-[0.9rem] font-bold tracking-widest uppercase bg-green text-navy rounded-lg hover:bg-green/80 transition-all">Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center py-10">
                <CheckCircle2 size={80} className="text-green mx-auto mb-6" />
                <h2 className="font-bebas text-4xl tracking-[3px] text-white mb-2">Request Received</h2>
                <p className="text-gray font-light max-w-sm mx-auto">
                  Thank you! We have received your request for a <span className="text-white font-medium">{selectedService}</span>. 
                  Our team will contact you shortly to confirm the appointment.
                </p>
              </div>
              <button onClick={() => setStep(1)} className="w-full py-4 font-barlow-condensed text-[0.9rem] font-bold tracking-widest uppercase border border-green text-green rounded-lg hover:bg-green/10 transition-all">Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
