'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Trash2, Edit, Eye, EyeOff } from 'lucide-react'
import type { BlogPostSummary } from '@/lib/blog/types'
import { deleteBlogPost, toggleBlogPublished } from '../actions'

type BlogListProps = {
  posts: BlogPostSummary[]
}

export function BlogList({ posts: initialPosts }: BlogListProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (id: number, currentPublished: boolean) => {
    setError(null)
    startTransition(async () => {
      const result = await toggleBlogPublished(id, !currentPublished)
      if (result.ok === false) { setError(result.error); return }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: !currentPublished ? 'published' : 'draft' }
            : p
        )
      )
    })
  }

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setError(null)
    startTransition(async () => {
      const result = await deleteBlogPost(id)
      if (result.ok === false) { setError(result.error); return }
      setPosts((prev) => prev.filter((p) => p.id !== id))
    })
  }

  if (posts.length === 0) {
    return (
      <div className="bg-navy-light border border-white/5 rounded-xl p-16 text-center">
        <p className="text-gray text-sm">No posts yet.</p>
        <Link href="/admin/blog/new" className="mt-4 inline-block bg-green text-navy px-5 py-2.5 rounded-lg font-barlow-condensed font-bold tracking-widest uppercase text-sm hover:opacity-90">
          Write your first post
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded px-4 py-2">{error}</p>
      )}
      <section className="bg-navy-light border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[0.7rem] text-gray uppercase tracking-widest font-bold bg-white/[0.02]">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-medium text-white max-w-sm truncate group-hover:text-green transition-colors">
                      {post.title}
                    </div>
                    {post.excerpt && (
                      <div className="text-xs text-gray line-clamp-1 max-w-sm mt-0.5">{post.excerpt}</div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {post.category ? (
                      <span className="text-[0.65rem] px-2 py-1 bg-white/5 text-gray rounded font-bold tracking-widest uppercase">
                        {post.category.name}
                      </span>
                    ) : (
                      <span className="text-gray/40 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[0.65rem] px-2 py-0.5 rounded-full font-bold tracking-widest uppercase ${
                      post.status === 'published'
                        ? 'bg-green/10 text-green'
                        : post.status === 'archived'
                          ? 'bg-white/5 text-gray/50'
                          : 'bg-gray/10 text-gray'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-gray text-xs">
                    {new Date(post.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end items-center gap-1">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="p-2 text-gray hover:text-white transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleToggle(post.id, post.status === 'published')}
                        className="p-2 text-gray hover:text-green transition-colors disabled:opacity-40"
                        title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                      >
                        {post.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      {post.status === 'published' && (
                        <a
                          href={`/insights/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray hover:text-green transition-colors"
                          title="View live"
                        >
                          ↗
                        </a>
                      )}
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDelete(post.id, post.title)}
                        className="p-2 text-gray hover:text-red-400 transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
