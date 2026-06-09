import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { MarkdownContent } from '@/components/content/markdown-content'
import { getPublishedServiceDetailBySlug } from '@/lib/service-pages/queries'

function coverImage(study: { media: { url: string; is_cover: boolean; media_type: string }[] }) {
  const cover = study.media.find((m) => m.is_cover && m.media_type === 'image')
  const firstImage = study.media.find((m) => m.media_type === 'image')
  return cover?.url ?? firstImage?.url ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  let detail: Awaited<ReturnType<typeof getPublishedServiceDetailBySlug>> = null
  try {
    detail = await getPublishedServiceDetailBySlug(slug)
  } catch {
    detail = null
  }

  if (!detail) {
    return { title: 'Service Not Found' }
  }

  const tagline = detail.page?.tagline ?? detail.description ?? ''
  const title = `${detail.name} | VANROX Engineering & Surveying TT`
  const description = tagline
    ? `${tagline} — Professional ${detail.name.toLowerCase()} services across Trinidad & Tobago by VANROX Engineering.`
    : `Professional ${detail.name.toLowerCase()} services across Trinidad & Tobago. Licensed, precise, and trusted by 500+ clients. VANROX Engineering.`

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.vanrox-group.com/services/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.vanrox-group.com/services/${slug}`,
    },
  }
}

export async function generateStaticParams() {
  try {
    const { getActiveServiceSlugs } = await import('@/lib/service-pages/queries')
    const slugs = await getActiveServiceSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let detail: Awaited<ReturnType<typeof getPublishedServiceDetailBySlug>> = null
  try {
    detail = await getPublishedServiceDetailBySlug(slug)
  } catch {
    detail = null
  }

  if (!detail) notFound()

  const page = detail.page
  const icon = detail.metadata?.icon ?? '•'

  return (
    <div className="bg-navy min-h-screen">
      <section className="relative px-6 py-20 md:px-15 border-b border-white/5 overflow-hidden">
        {page?.hero_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={page.hero_image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        )}
        <div className="relative max-w-5xl mx-auto">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm text-gray hover:text-green mb-8 uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> All services
          </Link>
          <div className="flex items-start gap-4 mb-6">
            <span className="text-4xl">{icon}</span>
            <div>
              <h1 className="font-bebas text-4xl md:text-6xl tracking-[3px] text-white leading-none">
                {detail.name}
              </h1>
              {(page?.tagline || detail.description) && (
                <p className="text-gray font-light mt-4 max-w-2xl text-lg">
                  {page?.tagline ?? detail.description}
                </p>
              )}
            </div>
          </div>
          <Link
            href={`/schedule?service=${detail.id}`}
            className="inline-flex items-center gap-2 bg-green text-navy px-8 py-4 font-barlow-condensed font-bold tracking-widest uppercase text-sm rounded-sm hover:opacity-90"
          >
            Book a consultation <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {page?.overview && (
        <section className="px-6 py-16 md:px-15 max-w-4xl mx-auto">
          <h2 className="font-barlow-condensed text-xl tracking-[2px] uppercase text-green mb-6">
            Overview
          </h2>
          <MarkdownContent content={page.overview} />
        </section>
      )}

      {!page?.overview && detail.description && (
        <section className="px-6 py-16 md:px-15 max-w-4xl mx-auto">
          <p className="text-gray leading-relaxed">{detail.description}</p>
        </section>
      )}

      {page && page.process_steps.length > 0 && (
        <section className="px-6 py-16 md:px-15 bg-navy-light border-y border-white/5">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-barlow-condensed text-xl tracking-[2px] uppercase text-green mb-10">
              How we work
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {page.process_steps.map((step) => (
                <div
                  key={step.step_number}
                  className="bg-navy border border-white/5 rounded-lg p-6"
                >
                  <div className="text-green font-bebas text-3xl mb-2">{step.step_number}</div>
                  <h3 className="font-barlow-condensed text-lg tracking-wide text-white uppercase mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {detail.caseStudies.length > 0 && (
        <section className="px-6 py-16 md:px-15 max-w-6xl mx-auto">
          <h2 className="font-barlow-condensed text-xl tracking-[2px] uppercase text-green mb-10">
            Case studies
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {detail.caseStudies.map((study) => {
              const image = coverImage(study)
              return (
                <Link
                  key={study.id}
                  href={`/services/${detail.slug}/${study.slug}`}
                  className="group bg-navy-light border border-white/5 rounded-lg overflow-hidden hover:border-green/30 hover:-translate-y-1 transition-all"
                >
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt="" className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-white/5 flex items-center justify-center text-gray text-sm">
                      Case study
                    </div>
                  )}
                  <div className="p-6 space-y-3">
                    <h3 className="font-barlow-condensed text-lg tracking-wide text-white uppercase group-hover:text-green transition-colors">
                      {study.title}
                    </h3>
                    {study.summary && (
                      <p className="text-sm text-gray line-clamp-3">{study.summary}</p>
                    )}
                    {study.outcome && (
                      <span className="inline-block text-xs bg-green/10 text-green px-2 py-1 rounded">
                        {study.outcome}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section className="px-6 py-16 md:px-15 border-t border-white/5 text-center">
        <p className="text-gray mb-6">Ready to discuss your {detail.name.toLowerCase()} project?</p>
        <Link
          href={`/schedule?service=${detail.id}`}
          className="inline-flex items-center gap-2 border border-green/40 text-white px-8 py-4 font-barlow-condensed font-bold tracking-widest uppercase text-sm rounded-sm hover:border-green hover:bg-green/10"
        >
          Schedule a consultation <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  )
}
