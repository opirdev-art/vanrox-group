import { displayPhone, phoneTelHref } from '@/lib/settings/contact'
import { getBusinessSettings } from '@/lib/settings/queries'
import { getActiveServices } from '@/lib/booking/queries'
import { BookingWizard } from './booking-wizard'

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>
}) {
  const params = await searchParams
  const business = await getBusinessSettings()
  const contactPhone = displayPhone(business.phone)
  const contactTelHref = phoneTelHref(business.phone)
  const preselectedServiceId = params.service ? Number(params.service) : null

  let services: Awaited<ReturnType<typeof getActiveServices>> = []

  try {
    services = await getActiveServices()
  } catch {
    services = []
  }

  const initialServiceId =
    preselectedServiceId &&
    services.some((s) => s.id === preselectedServiceId)
      ? preselectedServiceId
      : null

  return (
    <div className="bg-navy min-h-screen py-16 md:py-24 px-6 md:px-15">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-15">
          <h1 className="font-bebas text-4xl md:text-6xl tracking-[4px] text-white mb-4">
            Book a <span className="text-green">Survey</span>
          </h1>
          <p className="text-gray font-light">
            Secure your consultation by following our simple booking process.
          </p>
        </header>

        <BookingWizard
          services={services}
          initialServiceId={initialServiceId}
          contactPhone={contactPhone}
          contactTelHref={contactTelHref}
        />
      </div>
    </div>
  )
}
