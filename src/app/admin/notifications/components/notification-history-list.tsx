'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/notifications/actions'
import type { AdminNotificationRow } from '@/lib/notifications/queries'

type NotificationHistoryListProps = {
  initialNotifications: AdminNotificationRow[]
}

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString()
}

export function NotificationHistoryList({
  initialNotifications,
}: NotificationHistoryListProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState(initialNotifications)
  const unreadCount = notifications.filter((item) => !item.is_read).length

  async function handleMarkAllRead() {
    const result = await markAllNotificationsRead()
    if (!result.ok) return

    setNotifications((current) => current.map((item) => ({ ...item, is_read: true })))
    router.refresh()
  }

  async function handleOpen(notification: AdminNotificationRow) {
    if (!notification.is_read) {
      const result = await markNotificationRead(notification.id)
      if (result.ok) {
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id ? { ...item, is_read: true } : item
          )
        )
      }
    }

    if (notification.href) {
      router.push(notification.href)
    }
  }

  if (notifications.length === 0) {
    return <p className="text-gray text-sm font-light">No notifications yet.</p>
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="text-green text-xs font-barlow-condensed font-bold tracking-widest uppercase hover:underline"
        >
          Mark all as read ({unreadCount})
        </button>
      )}

      <ul className="divide-y divide-white/5">
        {notifications.map((notification) => (
          <li key={notification.id}>
            <button
              type="button"
              onClick={() => handleOpen(notification)}
              className={`w-full text-left py-4 hover:bg-white/5 px-2 rounded-lg transition-colors ${
                notification.is_read ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {!notification.is_read && (
                  <span className="mt-2 h-2 w-2 rounded-full bg-green shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium">{notification.title}</p>
                  {notification.body && (
                    <p className="text-gray text-sm mt-1">{notification.body}</p>
                  )}
                  <p className="text-xs text-gray/70 mt-2">{formatTimestamp(notification.created_at)}</p>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
