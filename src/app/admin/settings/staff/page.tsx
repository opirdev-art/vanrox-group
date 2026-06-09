import { requireSuperAdmin } from '@/lib/auth/require-super-admin'
import { enrichStaffWithInviteStatus } from '@/lib/settings/staff-invite-status'
import { getAllStaffProfiles } from '@/lib/settings/staff-queries'
import { InviteStaffForm } from './components/invite-staff-form'
import { StaffList } from './components/staff-list'

export default async function StaffSettingsPage() {
  const { user } = await requireSuperAdmin()
  const staff = await enrichStaffWithInviteStatus(await getAllStaffProfiles(user.id))

  return (
    <div className="space-y-6">
      <section className="bg-navy-light border border-white/5 rounded-xl p-8 space-y-6">
        <h2 className="font-barlow-condensed text-lg font-bold tracking-widest uppercase text-white border-b border-white/5 pb-4">
          Invite Staff Member
        </h2>
        <InviteStaffForm />
      </section>

      <section className="bg-navy-light border border-white/5 rounded-xl p-8 space-y-6">
        <h2 className="font-barlow-condensed text-lg font-bold tracking-widest uppercase text-white border-b border-white/5 pb-4">
          Team Members
        </h2>
        <StaffList staff={staff} />
      </section>
    </div>
  )
}
