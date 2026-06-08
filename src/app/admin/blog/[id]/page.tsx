import { notFound } from 'next/navigation'
import { getAllBlogCategories, getBlogPostForAdmin } from '@/lib/blog/queries'
import { BlogEditor } from '../components/blog-editor'

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const postId = Number(id)
  if (!Number.isFinite(postId)) notFound()

  const [post, categories] = await Promise.all([
    getBlogPostForAdmin(postId).catch(() => null),
    getAllBlogCategories().catch(() => []),
  ])

  if (!post) notFound()

  return <BlogEditor categories={categories} existing={post} />
}
