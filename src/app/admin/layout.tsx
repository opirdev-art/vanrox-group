import { requireAdmin } from '@/lib/auth/require-admin'
import {
  getRecentNotifications,
  getUnreadNotificationCount,
} from '@/lib/notifications/queries'
import { AdminShell } from './components/admin-shell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await requireAdmin()

  const [notifications, unreadCount] = await Promise.all([
    getRecentNotifications(user.id, 15),
    getUnreadNotificationCount(user.id),
  ])

  return (
    <AdminShell initialNotifications={notifications} initialUnreadCount={unreadCount}>
      {children}
    </AdminShell>
  )
}
