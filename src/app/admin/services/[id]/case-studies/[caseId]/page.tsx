import { notFound } from 'next/navigation'
import { getServiceById } from '@/lib/services/queries'
import { getCaseStudyForAdmin } from '@/lib/service-pages/queries'
import { CaseStudyEditor } from '../../../components/case-study-editor'

export default async function EditCaseStudyPage({
  params,
}: {
  params: Promise<{ id: string; caseId: string }>
}) {
  const { id, caseId } = await params
  const serviceId = Number(id)
  const caseStudyId = Number(caseId)
  if (!Number.isFinite(serviceId) || !Number.isFinite(caseStudyId)) notFound()

  const service = await getServiceById(serviceId)
  if (!service) notFound()

  let study = null
  try {
    study = await getCaseStudyForAdmin(serviceId, caseStudyId)
  } catch {
    study = null
  }

  if (!study) notFound()

  return (
    <CaseStudyEditor
      service={{ id: service.id, name: service.name, slug: service.slug ?? '' }}
      existing={study}
    />
  )
}
