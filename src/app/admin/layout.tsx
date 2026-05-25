import { LayoutDashboard, Calendar, FileText, Users, Settings, LogOut, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: MessageSquare, label: 'Leads & Quotes', href: '/admin/leads' },
    { icon: Calendar, label: 'Scheduler', href: '/admin/scheduler' },
    { icon: FileText, label: 'Blog Posts', href: '/admin/blog' },
    { icon: Users, label: 'Referrals', href: '/admin/referrals' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ]

  return (
    <div className="min-h-screen bg-navy text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-navy-light flex flex-col">
        <div className="p-6 border-b border-white/5">
          <Link href="/admin" className="flex items-center gap-3 no-underline">
            <svg className="w-8 h-8" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 3L6 9v14c0 9 7 16.5 16 18 9-1.5 16-9 16-18V9L22 3z" fill="#162847" stroke="#7dc242" strokeWidth="1.2"/>
              <path d="M22 11l-7 6h2v7h10v-7h2l-7-6z" fill="white"/>
            </svg>
            <div className="leading-tight">
              <div className="font-bebas text-xl text-white tracking-[2px]">VANROX</div>
              <div className="font-barlow-condensed text-[0.5rem] text-green tracking-[1px] font-semibold uppercase">Admin Panel</div>
            </div>
          </Link>
        </div>

        <nav className="flex-grow p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-gray hover:text-white hover:bg-white/5 rounded-md transition-all group"
            >
              <item.icon size={20} className="group-hover:text-green transition-colors" />
              <span className="font-barlow-condensed text-[0.9rem] font-bold tracking-widest uppercase">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-all font-barlow-condensed text-[0.9rem] font-bold tracking-widest uppercase">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-auto p-10 bg-navy">
        {children}
      </main>
    </div>
  )
}
