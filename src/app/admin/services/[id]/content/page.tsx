import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServiceById } from '@/lib/services/queries'
import { getServicePageForAdmin } from '@/lib/service-pages/queries'
import { ServicePageEditor } from '../../components/service-page-editor'

export default async function AdminServiceContentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const serviceId = Number(id)
  if (!Number.isFinite(serviceId)) notFound()

  const service = await getServiceById(serviceId)
  if (!service) notFound()

  let page = null
  try {
    page = await getServicePageForAdmin(serviceId)
  } catch {
    page = null
  }

  return (
    <div className="space-y-8">
      <header>
        <Link href="/admin/services" className="text-xs text-gray hover:text-green uppercase tracking-widest">
          ← Services
        </Link>
        <h1 className="font-bebas text-4xl tracking-[3px] text-white mt-2">Service Page</h1>
        <p className="text-gray font-light mt-1">{service.name}</p>
      </header>
      <ServicePageEditor service={service} page={page} />
    </div>
  )
}
