import { createClient } from '@/utils/supabase/server'
import { SecuritySettingsPanel } from './components/security-settings-panel'

export default async function SecuritySettingsPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <SecuritySettingsPanel
      sessionExpiresAt={
        session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
      }
    />
  )
}
