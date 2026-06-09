'use client'

import { Lock } from 'lucide-react'
import { useActionState } from 'react'
import type { NotificationChannelPrefs } from '@/lib/settings/notification-preferences'
import { NOTIFICATION_PREFERENCE_ROWS } from '@/lib/settings/notification-preferences'
import { saveNotificationPreferences } from '../actions'

const initialState = { ok: false as const, error: '' }

type NotificationPreferencesFormProps = {
  preferences: Record<string, NotificationChannelPrefs>
  isSuperAdmin: boolean
}

const GROUP_LABELS = {
  business: 'Business',
  content: 'Content',
  security: 'Security',
} as const

export function NotificationPreferencesForm({
  preferences,
  isSuperAdmin,
}: NotificationPreferencesFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await saveNotificationPreferences(formData)
      if (result.ok === false) {
        return { ok: false as const, error: result.error }
      }
      return { ok: true as const, error: '' }
    },
    initialState
  )

  const rows = NOTIFICATION_PREFERENCE_ROWS.filter(
    (row) => !row.superAdminOnly || isSuperAdmin
  )

  const groups = ['business', 'content', 'security'] as const

  return (
    <form action={formAction} className="space-y-8">
      {groups.map((group) => {
        const groupRows = rows.filter((row) => row.group === group)
        if (groupRows.length === 0) return null

        return (
          <div key={group} className="space-y-4">
            <h3 className="font-barlow-condensed text-sm font-bold tracking-widest uppercase text-green">
              {GROUP_LABELS[group]}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray border-b border-white/5">
                    <th className="py-2 pr-4 font-barlow-condensed tracking-widest uppercase text-xs">
                      Event
                    </th>
                    <th className="py-2 pr-4 font-barlow-condensed tracking-widest uppercase text-xs">
                      In-app
                    </th>
                    <th className="py-2 font-barlow-condensed tracking-widest uppercase text-xs">
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupRows.map((row) => {
                    const prefs = preferences[row.eventType] ?? row.defaults
                    return (
                      <tr key={row.eventType} className="border-b border-white/5">
                        <td className="py-3 pr-4 text-white">{row.label}</td>
                        <td className="py-3 pr-4">
                          {row.locked ? (
                            <span className="inline-flex items-center gap-1 text-gray text-xs">
                              <Lock size={12} aria-hidden="true" />
                              Always on
                            </span>
                          ) : (
                            <input
                              type="checkbox"
                              name={`${row.eventType}:in_app`}
                              defaultChecked={prefs.in_app}
                              className="accent-green"
                            />
                          )}
                        </td>
                        <td className="py-3">
                          {row.locked ? (
                            <span className="text-gray text-xs">—</span>
                          ) : (
                            <input
                              type="checkbox"
                              name={`${row.eventType}:email`}
                              defaultChecked={prefs.email}
                              className="accent-green"
                            />
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {state.error && <p className="text-red-400 text-sm">{state.error}</p>}
      {state.ok && <p className="text-green text-sm">Notification preferences saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-green text-navy px-6 py-3 rounded-lg font-barlow-condensed font-bold tracking-widest uppercase text-sm hover:bg-green/80 transition-all disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save Preferences'}
      </button>
    </form>
  )
}
