import { getAllBlogCategories } from '@/lib/blog/queries'
import { BlogEditor } from '../components/blog-editor'

export default async function NewBlogPostPage() {
  let categories: Awaited<ReturnType<typeof getAllBlogCategories>> = []
  try {
    categories = await getAllBlogCategories()
  } catch {
    categories = []
  }

  return <BlogEditor categories={categories} />
}
