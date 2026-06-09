import { requireAdmin } from '@/lib/auth/require-admin'
import { resolveNotificationPreferences } from '@/lib/settings/notification-preferences'
import { createClient } from '@/utils/supabase/server'
import { NotificationPreferencesForm } from './components/notification-preferences-form'

function readStoredPreferences(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null
  const prefs = (metadata as { notification_preferences?: unknown }).notification_preferences
  if (!prefs || typeof prefs !== 'object' || Array.isArray(prefs)) return null
  return prefs as Record<string, { in_app: boolean; email: boolean }>
}

export default async function NotificationsSettingsPage() {
  const { user, profile } = await requireAdmin()
  const isSuperAdmin = profile.role === 'super_admin'

  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('metadata').eq('id', user.id).single()

  const preferences = resolveNotificationPreferences(readStoredPreferences(data?.metadata), isSuperAdmin)

  return (
    <section className="bg-navy-light border border-white/5 rounded-xl p-8 space-y-6">
      <div>
        <h2 className="font-barlow-condensed text-lg font-bold tracking-widest uppercase text-white border-b border-white/5 pb-4">
          Notification Preferences
        </h2>
        <p className="text-gray text-sm font-light mt-4">
          Choose how you want to be notified for each event. Locked events are always enabled.
        </p>
      </div>
      <NotificationPreferencesForm preferences={preferences} isSuperAdmin={isSuperAdmin} />
    </section>
  )
}
