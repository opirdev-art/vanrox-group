import Link from 'next/link'
import { ArrowRight, Calendar, User } from 'lucide-react'

export default function InsightsPage() {
  const posts = [
    {
      title: 'Understanding Boundary Disputes in Tobago',
      slug: 'understanding-boundary-disputes-tobago',
      excerpt: 'Boundary disputes can be costly and stressful. Learn how professional surveying can help resolve issues before they escalate.',
      date: 'May 20, 2026',
      author: 'Njisane Mottley',
      category: 'Boundary Issues'
    },
    {
      title: 'How to Plan for a Successful Land Subdivision',
      slug: 'land-subdivision-planning-guide',
      excerpt: 'Subdividing land requires careful planning and regulatory approval. Here is a step-by-step guide for landowners in T&T.',
      date: 'May 15, 2026',
      author: 'Njisane Mottley',
      category: 'Development'
    },
    {
      title: 'The Importance of Topographic Surveys for Construction',
      slug: 'importance-of-topographic-surveys',
      excerpt: 'Before you build, you need to know the land. Discover why topographic mapping is crucial for any infrastructure project.',
      date: 'May 10, 2026',
      author: 'Njisane Mottley',
      category: 'Surveys'
    }
  ]

  return (
    <div className="bg-navy min-h-screen">
      <section className="px-6 py-24 md:px-15 max-w-7xl mx-auto">
        <div className="mb-15">
          <div className="inline-flex items-center gap-2.5 font-barlow-condensed text-[0.75rem] font-semibold tracking-[3px] uppercase text-green mb-4">
            <span className="block w-6 h-[0.5px] bg-green"></span>
            Land Insights
          </div>
          <h1 className="font-bebas text-4xl md:text-6xl tracking-[4px] leading-none text-white mb-6">
            Expert <span className="text-green">Knowledge</span> for Landowners
          </h1>
          <p className="text-gray text-[1.1rem] max-w-2xl font-light">
            Stay informed with the latest articles on surveying, land development, and regulatory compliance in Trinidad & Tobago.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <article key={index} className="bg-navy-light border border-white/5 rounded-lg overflow-hidden flex flex-col hover:border-green/20 transition-all group">
              <div className="aspect-video bg-navy-mid relative overflow-hidden">
                {/* Placeholder for featured image */}
                <div className="absolute inset-0 flex items-center justify-center text-green/20 font-bebas text-4xl tracking-widest">
                  VANROX
                </div>
                <div className="absolute top-4 left-4 bg-green text-navy px-3 py-1 font-barlow-condensed text-[0.7rem] font-bold tracking-wider uppercase rounded-sm">
                  {post.category}
                </div>
              </div>
              
              <div className="p-8 flex-grow flex flex-col">
                <div className="flex items-center gap-4 text-gray text-[0.75rem] mb-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User size={14} />
                    {post.author}
                  </div>
                </div>
                
                <h3 className="font-barlow-condensed text-xl font-bold tracking-wide text-white mb-4 group-hover:text-green transition-colors leading-tight">
                  <Link href={`/insights/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>
                
                <p className="text-gray text-[0.9rem] leading-relaxed mb-6 font-light flex-grow">
                  {post.excerpt}
                </p>
                
                <Link href={`/insights/${post.slug}`} className="text-green text-[0.85rem] font-bold tracking-widest uppercase flex items-center gap-2 hover:gap-3 transition-all">
                  Read Article <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
