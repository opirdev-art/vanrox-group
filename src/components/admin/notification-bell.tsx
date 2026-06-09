'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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

const PANEL_WIDTH = 384 // 24rem
const VIEWPORT_MARGIN = 16

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

function computePanelPosition(anchor: DOMRect) {
  const maxWidth = Math.min(PANEL_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2)
  let left = anchor.right - maxWidth

  if (left < VIEWPORT_MARGIN) {
    left = VIEWPORT_MARGIN
  }

  if (left + maxWidth > window.innerWidth - VIEWPORT_MARGIN) {
    left = window.innerWidth - VIEWPORT_MARGIN - maxWidth
  }

  return {
    top: anchor.bottom + 8,
    left,
    width: maxWidth,
  }
}

export function NotificationBell({
  initialNotifications,
  initialUnreadCount,
}: NotificationBellProps) {
  const router = useRouter()
  const panelId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0, width: PANEL_WIDTH })
  const [mounted, setMounted] = useState(false)

  const refresh = useCallback(() => {
    router.refresh()
  }, [router])

  const updatePanelPosition = useCallback(() => {
    if (!buttonRef.current) return
    setPanelPosition(computePanelPosition(buttonRef.current.getBoundingClientRect()))
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const interval = window.setInterval(refresh, 30000)
    return () => window.clearInterval(interval)
  }, [refresh])

  useEffect(() => {
    if (!open) return

    updatePanelPosition()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    const handleLayoutChange = () => updatePanelPosition()

    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleLayoutChange)
    window.addEventListener('scroll', handleLayoutChange, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleLayoutChange)
      window.removeEventListener('scroll', handleLayoutChange, true)
    }
  }, [open, updatePanelPosition])

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

  const panel =
    open && mounted ? (
      <>
        <button
          type="button"
          className="fixed inset-0 z-[70] cursor-default bg-transparent"
          aria-label="Close notifications"
          onClick={() => setOpen(false)}
        />
        <div
          id={panelId}
          style={{
            position: 'fixed',
            top: panelPosition.top,
            left: panelPosition.left,
            width: panelPosition.width,
          }}
          className="z-[80] bg-navy-light border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 gap-3">
            <h2 className="font-barlow-condensed text-sm font-bold tracking-widest uppercase text-white shrink-0">
              Notifications
            </h2>
            <div className="flex items-center gap-2 shrink-0">
              {initialUnreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[0.65rem] text-green font-barlow-condensed font-bold tracking-widest uppercase hover:underline whitespace-nowrap"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                className="flex items-center justify-center min-h-9 min-w-9 text-gray hover:text-white"
                aria-label="Close notifications panel"
                onClick={() => setOpen(false)}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="max-h-[min(20rem,50dvh)] overflow-y-auto overscroll-contain">
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
                          <p className="text-sm text-white font-medium break-words">
                            {notification.title}
                          </p>
                          {notification.body && (
                            <p className="text-xs text-gray mt-1 line-clamp-3 break-words">
                              {notification.body}
                            </p>
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
    ) : null

  return (
    <div className="relative shrink-0">
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

      {mounted && panel ? createPortal(panel, document.body) : null}
    </div>
  )
}
