import { Plus, Search, Filter, MoreHorizontal, Edit, Trash, Eye } from 'lucide-react'

export default function AdminBlog() {
  const posts = [
    { id: 1, title: 'Understanding Boundary Disputes in Tobago', category: 'Boundary Issues', status: 'Published', date: 'May 20, 2026', views: 142 },
    { id: 2, title: 'How to Plan for a Successful Land Subdivision', category: 'Development', status: 'Draft', date: 'May 15, 2026', views: 0 },
    { id: 3, title: 'The Importance of Topographic Surveys', category: 'Surveys', status: 'Published', date: 'May 10, 2026', views: 89 },
  ]

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-bebas text-4xl tracking-[3px] text-white">Content Hub</h1>
          <p className="text-gray font-light mt-1">Write and manage articles for the Land Insights blog.</p>
        </div>
        <button className="bg-green text-navy px-6 py-3 rounded-lg font-barlow-condensed font-bold tracking-widest uppercase flex items-center gap-2 hover:bg-green/80 transition-all">
          <Plus size={18} />
          New Article
        </button>
      </header>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-navy-light p-4 rounded-xl border border-white/5 shadow-lg">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray" size={18} />
          <input 
            type="text" 
            placeholder="Search articles..." 
            className="w-full bg-navy border border-white/10 rounded-lg py-2.5 pl-12 pr-4 focus:border-green outline-none transition-all text-white text-sm"
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-navy border border-white/10 rounded-lg text-gray text-sm hover:text-white transition-all">
            <Filter size={16} />
            Filter
          </button>
          <select className="bg-navy border border-white/10 rounded-lg px-4 py-2.5 text-gray text-sm outline-none focus:border-green transition-all cursor-pointer">
            <option>All Status</option>
            <option>Published</option>
            <option>Draft</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <section className="bg-navy-light border border-white/5 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[0.7rem] text-gray uppercase tracking-widest font-bold bg-white/[0.02]">
                <th className="px-6 py-4">Article Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date Created</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-medium text-white max-w-xs truncate">{post.title}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[0.65rem] px-2 py-1 bg-white/5 text-gray rounded font-bold tracking-widest uppercase">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[0.65rem] px-2 py-0.5 rounded-full font-bold tracking-widest uppercase ${
                      post.status === 'Published' ? 'bg-green/10 text-green' : 'bg-gray/10 text-gray'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-gray text-sm font-light">{post.date}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-gray text-sm">
                      <Eye size={14} />
                      {post.views}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray hover:text-white transition-colors" title="Edit"><Edit size={16} /></button>
                      <button className="p-2 text-gray hover:text-red-400 transition-colors" title="Delete"><Trash size={16} /></button>
                      <button className="p-2 text-gray hover:text-green transition-colors" title="More"><MoreHorizontal size={16} /></button>
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
