import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getBlogPostsForAdmin } from '@/lib/blog/queries'
import { BlogList } from './components/blog-list'

export default async function AdminBlogPage() {
  let posts: Awaited<ReturnType<typeof getBlogPostsForAdmin>> = { posts: [], total: 0 }
  try {
    posts = await getBlogPostsForAdmin({ limit: 50 })
  } catch {
    posts = { posts: [], total: 0 }
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="font-bebas text-4xl tracking-[3px] text-white">Content Hub</h1>
          <p className="text-gray font-light mt-1">
            Write and manage articles for the Land Insights blog.
            {posts.total > 0 && (
              <span className="ml-2 text-gray/60">({posts.total} post{posts.total !== 1 ? 's' : ''})</span>
            )}
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="bg-green text-navy px-6 py-3 rounded-lg font-barlow-condensed font-bold tracking-widest uppercase flex items-center gap-2 hover:bg-green/80 transition-all"
        >
          <Plus size={18} />
          New Article
        </Link>
      </header>

      <BlogList posts={posts.posts} />
    </div>
  )
}
