import { requireAdmin } from '@/lib/auth/require-admin'
import { SettingsTabs } from './settings-tabs'

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin()
  const isSuperAdmin = profile.role === 'super_admin'

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-bebas text-4xl tracking-[3px] text-white">System Settings</h1>
        <p className="text-gray font-light mt-1">
          Configure your administrative preferences and site behavior.
        </p>
      </header>

      <SettingsTabs isSuperAdmin={isSuperAdmin} />

      {children}
    </div>
  )
}
