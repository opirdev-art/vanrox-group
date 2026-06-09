import 'server-only'
import { createAdminClient } from '@/utils/supabase/admin-client'
import type { StaffMember } from './staff-queries'

export type StaffMemberWithInviteStatus = StaffMember & {
  inviteStatus: 'active' | 'invite_pending'
  lastSignInAt: string | null
}

export async function enrichStaffWithInviteStatus(
  staff: StaffMember[]
): Promise<StaffMemberWithInviteStatus[]> {
  const adminClient = createAdminClient()

  return Promise.all(
    staff.map(async (member) => {
      const { data, error } = await adminClient.auth.admin.getUserById(member.id)

      if (error || !data.user) {
        return {
          ...member,
          inviteStatus: 'active' as const,
          lastSignInAt: null,
        }
      }

      const lastSignInAt = data.user.last_sign_in_at ?? null
      const invitePending = !lastSignInAt

      return {
        ...member,
        inviteStatus: invitePending ? 'invite_pending' : 'active',
        lastSignInAt,
      }
    })
  )
}
