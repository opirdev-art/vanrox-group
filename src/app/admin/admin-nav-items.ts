import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  Settings,
  MessageSquare,
  Briefcase,
  type LucideIcon,
} from 'lucide-react'

export type AdminNavItem = {
  icon: LucideIcon
  label: string
  href: string
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: MessageSquare, label: 'Leads & Quotes', href: '/admin/leads' },
  { icon: Calendar, label: 'Scheduler', href: '/admin/scheduler' },
  { icon: Briefcase, label: 'Services', href: '/admin/services' },
  { icon: FileText, label: 'Blog Posts', href: '/admin/blog' },
  { icon: Users, label: 'Referrals', href: '/admin/referrals' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
]
