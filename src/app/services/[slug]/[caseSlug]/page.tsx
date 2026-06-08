import { notFound } from 'next/navigation'
import { CaseStudyArticle } from '@/components/content/case-study-article'
import { getPublishedCaseStudyBySlugs } from '@/lib/service-pages/queries'

export async function generateStaticParams() {
  try {
    const { getPublishedCaseStudyPaths } = await import('@/lib/service-pages/queries')
    const paths = await getPublishedCaseStudyPaths()
    return paths.map(({ serviceSlug, caseSlug }) => ({
      slug: serviceSlug,
      caseSlug,
    }))
  } catch {
    return []
  }
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string; caseSlug: string }>
}) {
  const { slug, caseSlug } = await params

  let study: Awaited<ReturnType<typeof getPublishedCaseStudyBySlugs>> = null
  try {
    study = await getPublishedCaseStudyBySlugs(slug, caseSlug)
  } catch {
    study = null
  }

  if (!study) notFound()

  return (
    <CaseStudyArticle
      data={{
        title: study.title,
        summary: study.summary,
        body: study.body,
        coverImageUrl: study.cover_image_url,
        clientName: study.client_name,
        location: study.location,
        outcome: study.outcome,
        tags: study.tags,
        service: study.service,
      }}
    />
  )
}
