import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServiceById } from '@/lib/services/queries'
import { getCaseStudiesForAdmin } from '@/lib/service-pages/queries'
import { CaseStudyList } from '../../components/case-study-list'

export default async function AdminCaseStudiesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const serviceId = Number(id)
  if (!Number.isFinite(serviceId)) notFound()

  const service = await getServiceById(serviceId)
  if (!service) notFound()

  let studies: Awaited<ReturnType<typeof getCaseStudiesForAdmin>> = []
  try {
    studies = await getCaseStudiesForAdmin(serviceId)
  } catch {
    studies = []
  }

  return (
    <div className="space-y-8">
      <header>
        <Link href="/admin/services" className="text-xs text-gray hover:text-green uppercase tracking-widest">
          ← Services
        </Link>
        <h1 className="font-bebas text-4xl tracking-[3px] text-white mt-2">Case Studies</h1>
        <p className="text-gray font-light mt-1">{service.name}</p>
      </header>
      <CaseStudyList service={service} studies={studies} />
    </div>
  )
}
