import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getNotificationHistory } from '@/lib/notifications/queries'
import { NotificationHistoryList } from './components/notification-history-list'

export default async function NotificationsPage() {
  const { user } = await requireAdmin()
  const notifications = await getNotificationHistory(user.id, { limit: 100 })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-bebas text-3xl tracking-[3px] text-white">Notifications</h1>
          <p className="text-gray text-sm font-light mt-2">
            Your in-app notification history
          </p>
        </div>
        <Link
          href="/admin"
          className="text-green text-sm font-barlow-condensed font-bold tracking-widest uppercase hover:underline"
        >
          Back to dashboard
        </Link>
      </div>

      <section className="bg-navy-light border border-white/5 rounded-xl p-6 md:p-8">
        <NotificationHistoryList initialNotifications={notifications} />
      </section>
    </div>
  )
}
