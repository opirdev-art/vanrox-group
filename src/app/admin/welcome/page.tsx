import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/require-admin'
import { WelcomeSetupForm } from './components/welcome-setup-form'

export default async function WelcomePage() {
  const { user, profile } = await requireAdmin()

  const invitePending = user.app_metadata?.invite_pending === true
  if (!invitePending) {
    redirect('/admin')
  }

  return (
    <div className="max-w-lg mx-auto">
      <section className="bg-navy-light border border-white/5 rounded-xl p-8 space-y-6">
        <div>
          <h1 className="font-bebas text-3xl tracking-[3px] text-white">Welcome to VANROX</h1>
          <p className="text-gray text-sm font-light mt-3">
            Hi {profile.full_name}, set a password to finish activating your{' '}
            <span className="text-white capitalize">{profile.role.replace('_', ' ')}</span> account.
          </p>
        </div>
        <WelcomeSetupForm />
      </section>
    </div>
  )
}
