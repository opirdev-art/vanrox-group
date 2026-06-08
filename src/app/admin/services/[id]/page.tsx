import { notFound } from 'next/navigation'
import { getServiceById } from '@/lib/services/queries'
import { ServiceForm } from '../components/service-form'

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const serviceId = Number(id)

  if (!Number.isFinite(serviceId)) {
    notFound()
  }

  const service = await getServiceById(serviceId)

  if (!service) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-bebas text-4xl tracking-[3px] text-white">Edit Service</h1>
        <p className="text-gray font-light mt-1">{service.name}</p>
      </header>
      <ServiceForm service={service} />
    </div>
  )
}
