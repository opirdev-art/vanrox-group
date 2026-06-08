'use client'

import { useEffect, useState, useTransition } from 'react'
import { User, Phone, Mail, CheckCircle2, Calendar, Loader2 } from 'lucide-react'
import {
  SiteLocationPicker,
  emptySiteLocation,
  type SiteLocationValue,
} from './components/site-location-picker'
import type { ServiceOption } from '@/lib/booking/queries'
import { formatSlotTime } from '@/lib/booking/format-slot'
import { getAvailableSlots, submitBookingRequest } from './actions'

type Slot = { slot_start: string; slot_end: string }

type BookingWizardProps = {
  services: ServiceOption[]
  initialServiceId?: number | null
}

export function BookingWizard({ services, initialServiceId = null }: BookingWizardProps) {
  const preselected = initialServiceId
    ? services.find((s) => s.id === initialServiceId)
    : null

  const [step, setStep] = useState(preselected ? 2 : 1)
  const [serviceId, setServiceId] = useState<number | null>(preselected?.id ?? null)
  const [serviceName, setServiceName] = useState(preselected?.name ?? '')
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [slotsError, setSlotsError] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [siteLocation, setSiteLocation] = useState<SiteLocationValue>(emptySiteLocation())
  const [inquiryDetails, setInquiryDetails] = useState('')

  const [submitError, setSubmitError] = useState('')
  const [leadId, setLeadId] = useState('')
  const [pending, startTransition] = useTransition()

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (!selectedDate || step !== 2) return

    setLoadingSlots(true)
    setSlotsError('')
    setSelectedSlot(null)

    getAvailableSlots(selectedDate).then((result) => {
      setLoadingSlots(false)
      if (!result.ok) {
        setSlotsError(result.error)
        setSlots([])
        return
      }
      setSlots(result.slots)
      if (result.slots.length === 0) {
        setSlotsError('No available times on this date. Please try another day.')
      }
    })
  }, [selectedDate, step])

  function selectService(service: ServiceOption) {
    setServiceId(service.id)
    setServiceName(service.name)
    setStep(2)
  }

  function canContinueFromStep2() {
    return selectedDate && selectedSlot
  }

  function handleSubmit() {
    if (!serviceId || !selectedSlot) return

    setSubmitError('')
    startTransition(async () => {
      const result = await submitBookingRequest({
        serviceId,
        fullName,
        phone,
        email,
        siteLocation: siteLocation.address,
        siteLat: siteLocation.coordinates!.lat,
        siteLng: siteLocation.coordinates!.lng,
        preferredStart: selectedSlot.slot_start,
        preferredEnd: selectedSlot.slot_end,
        inquiryDetails,
      })

      if (result.ok === false) {
        setSubmitError(result.error)
        return
      }

      setLeadId(result.leadId)
      setStep(4)
    })
  }

  return (
    <>
      <div className="flex justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5 -z-10 -translate-y-1/2" />
        {[1, 2, 3, 4].map((i) => (
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
          <div className="space-y-8">
            <h2 className="font-barlow-condensed text-2xl font-bold tracking-widest uppercase text-white mb-6">
              Select Service
            </h2>
            {services.length === 0 ? (
              <p className="text-gray text-sm">
                No bookable services are available right now. Please call{' '}
                <a href="tel:+18682721240" className="text-green hover:underline">
                  2721240
                </a>
                .
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => selectService(service)}
                    className={`p-6 text-left border rounded-xl transition-all ${
                      serviceId === service.id
                        ? 'bg-green/10 border-green text-green'
                        : 'bg-white/5 border-white/10 text-gray hover:border-white/20'
                    }`}
                  >
                    <div className="font-barlow-condensed font-bold tracking-widest uppercase">
                      {service.name}
                    </div>
                    {service.description && (
                      <p className="text-xs mt-2 opacity-80 font-light normal-case tracking-normal">
                        {service.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <h2 className="font-barlow-condensed text-2xl font-bold tracking-widest uppercase text-white mb-6">
              Choose Date & Time
            </h2>
            <div className="space-y-2">
              <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray" size={18} />
                <input
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3.5 pl-12 pr-4 focus:border-green outline-none text-white"
                />
              </div>
            </div>

            {loadingSlots && (
              <div className="flex items-center gap-2 text-gray text-sm">
                <Loader2 size={16} className="animate-spin" />
                Loading available times…
              </div>
            )}

            {slotsError && <p className="text-yellow-400 text-sm">{slotsError}</p>}

            {slots.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slots.map((slot) => (
                  <button
                    key={slot.slot_start}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-3 px-4 rounded-lg border text-sm font-barlow-condensed font-bold tracking-widest uppercase transition-all ${
                      selectedSlot?.slot_start === slot.slot_start
                        ? 'bg-green/10 border-green text-green'
                        : 'border-white/10 text-gray hover:border-white/20'
                    }`}
                  >
                    {formatSlotTime(slot.slot_start)}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-4 font-barlow-condensed text-[0.9rem] font-bold tracking-widest uppercase border border-white/10 rounded-lg hover:bg-white/5 transition-all"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!canContinueFromStep2()}
                onClick={() => setStep(3)}
                className="flex-[2] py-4 font-barlow-condensed text-[0.9rem] font-bold tracking-widest uppercase bg-green text-navy rounded-lg hover:bg-green/80 transition-all disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <h2 className="font-barlow-condensed text-2xl font-bold tracking-widest uppercase text-white mb-6">
              Your Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray" size={18} />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3.5 pl-12 pr-4 focus:border-green outline-none text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray" size={18} />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="2721240"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3.5 pl-12 pr-4 focus:border-green outline-none text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">
                  Email (optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3.5 pl-12 pr-4 focus:border-green outline-none text-white"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <SiteLocationPicker value={siteLocation} onChange={setSiteLocation} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[0.7rem] text-gray uppercase tracking-widest font-bold">
                  Additional details (optional)
                </label>
                <textarea
                  value={inquiryDetails}
                  onChange={(e) => setInquiryDetails(e.target.value)}
                  rows={3}
                  placeholder="Lot number, landmarks, urgency…"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 focus:border-green outline-none text-white resize-none"
                />
              </div>
            </div>

            {submitError && <p className="text-red-400 text-sm">{submitError}</p>}

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-4 font-barlow-condensed text-[0.9rem] font-bold tracking-widest uppercase border border-white/10 rounded-lg hover:bg-white/5 transition-all"
              >
                Back
              </button>
              <button
                type="button"
                disabled={
                  pending ||
                  !fullName.trim() ||
                  !phone.trim() ||
                  !siteLocation.coordinates ||
                  !siteLocation.address.trim()
                }
                onClick={handleSubmit}
                className="flex-[2] py-4 font-barlow-condensed text-[0.9rem] font-bold tracking-widest uppercase bg-green text-navy rounded-lg hover:bg-green/80 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {pending && <Loader2 size={18} className="animate-spin" />}
                {pending ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            <div className="text-center py-10">
              <CheckCircle2 size={80} className="text-green mx-auto mb-6" />
              <h2 className="font-bebas text-4xl tracking-[3px] text-white mb-2">Request Received</h2>
              <p className="text-gray font-light max-w-md mx-auto">
                Thank you! We received your request for a{' '}
                <span className="text-white font-medium">{serviceName}</span>
                {selectedSlot && (
                  <>
                    {' '}
                    on{' '}
                    <span className="text-white font-medium">{formatSlotTime(selectedSlot.slot_start)}</span>
                  </>
                )}
                . We will confirm your site visit within one business day. For urgent matters call{' '}
                <span className="text-green">2721240</span>.
              </p>
              {leadId && (
                <p className="text-xs text-gray mt-4 uppercase tracking-widest">
                  Reference: {leadId.slice(0, 8)}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setStep(1)
                setServiceId(null)
                setSelectedSlot(null)
                setSelectedDate('')
                setLeadId('')
              }}
              className="w-full py-4 font-barlow-condensed text-[0.9rem] font-bold tracking-widest uppercase border border-green text-green rounded-lg hover:bg-green/10 transition-all"
            >
              Book another survey
            </button>
          </div>
        )}
      </div>
    </>
  )
}
