import { getAuthErrorMessage } from '@/lib/auth/messages'
import { getBusinessSettings } from '@/lib/settings/queries'
import { BusinessSettingsForm } from './components/business-settings-form'

type GeneralSettingsPageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function GeneralSettingsPage({ searchParams }: GeneralSettingsPageProps) {
  const settings = await getBusinessSettings()
  const params = await searchParams
  const accessError =
    params.error === 'super_admin_required'
      ? 'You need super admin access to view that settings section.'
      : getAuthErrorMessage(params.error)

  return (
    <section className="bg-navy-light border border-white/5 rounded-xl p-8 space-y-6">
      <h2 className="font-barlow-condensed text-lg font-bold tracking-widest uppercase text-white border-b border-white/5 pb-4">
        Business Information
      </h2>
      {accessError && <p className="text-amber-400 text-sm">{accessError}</p>}
      <BusinessSettingsForm settings={settings} />
    </section>
  )
}
