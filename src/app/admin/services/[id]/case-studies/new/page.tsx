import { notFound } from 'next/navigation'
import { getServiceById } from '@/lib/services/queries'
import { CaseStudyEditor } from '../../../components/case-study-editor'

export default async function NewCaseStudyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const serviceId = Number(id)
  if (!Number.isFinite(serviceId)) notFound()

  const service = await getServiceById(serviceId)
  if (!service) notFound()

  return (
    <CaseStudyEditor
      service={{ id: service.id, name: service.name, slug: service.slug ?? '' }}
    />
  )
}
