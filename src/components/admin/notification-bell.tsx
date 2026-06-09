'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Bell, X } from 'lucide-react'
import {
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/notifications/actions'
import type { AdminNotificationRow } from '@/lib/notifications/queries'

type NotificationBellProps = {
  initialNotifications: AdminNotificationRow[]
  initialUnreadCount: number
}

function formatRelativeTime(value: string): string {
  const date = new Date(value)
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / 60000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  return date.toLocaleDateString()
}

export function NotificationBell({
  initialNotifications,
  initialUnreadCount,
}: NotificationBellProps) {
  const router = useRouter()
  const panelId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  const refresh = useCallback(() => {
    router.refresh()
  }, [router])

  useEffect(() => {
    const interval = window.setInterval(refresh, 30000)
    return () => window.clearInterval(interval)
  }, [refresh])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  async function handleOpenItem(notification: AdminNotificationRow) {
    if (!notification.is_read) {
      await markNotificationRead(notification.id)
      refresh()
    }

    setOpen(false)

    if (notification.href) {
      router.push(notification.href)
    }
  }

  async function handleMarkAllRead() {
    const result = await markAllNotificationsRead()
    if (!result.ok) return
    refresh()
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        className="relative flex items-center justify-center min-h-11 min-w-11 rounded-sm border border-white/10 text-gray hover:text-white hover:border-green/30 transition-colors"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={initialUnreadCount > 0 ? `${initialUnreadCount} unread notifications` : 'Notifications'}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell size={20} aria-hidden="true" />
        {initialUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-green text-navy text-[0.65rem] font-bold flex items-center justify-center">
            {initialUnreadCount > 9 ? '9+' : initialUnreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div
            id={panelId}
            className="absolute right-0 top-full mt-2 z-50 w-[min(24rem,calc(100vw-2rem))] bg-navy-light border border-white/10 rounded-xl shadow-2xl overflow-hidden"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h2 className="font-barlow-condensed text-sm font-bold tracking-widest uppercase text-white">
                Notifications
              </h2>
              <div className="flex items-center gap-2">
                {initialUnreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[0.65rem] text-green font-barlow-condensed font-bold tracking-widest uppercase hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  className="text-gray hover:text-white"
                  aria-label="Close notifications panel"
                  onClick={() => setOpen(false)}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {initialNotifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-gray text-sm">No notifications yet.</p>
              ) : (
                <ul>
                  {initialNotifications.map((notification) => (
                    <li key={notification.id}>
                      <button
                        type="button"
                        onClick={() => handleOpenItem(notification)}
                        className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                          notification.is_read ? 'opacity-70' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {!notification.is_read && (
                            <span className="mt-1.5 h-2 w-2 rounded-full bg-green shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white font-medium truncate">
                              {notification.title}
                            </p>
                            {notification.body && (
                              <p className="text-xs text-gray mt-1 line-clamp-2">{notification.body}</p>
                            )}
                            <p className="text-[0.65rem] text-gray/80 mt-2">
                              {formatRelativeTime(notification.created_at)}
                            </p>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="px-4 py-3 border-t border-white/5">
              <Link
                href="/admin/notifications"
                onClick={() => setOpen(false)}
                className="text-xs text-green font-barlow-condensed font-bold tracking-widest uppercase hover:underline"
              >
                View all notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
