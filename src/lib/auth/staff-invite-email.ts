import 'server-only'
import { buildStaffInviteEmail } from '@/lib/auth/staff-invite-email-template'
import { createEmailProvider } from '@/lib/notifications/providers/email/factory'

export async function sendStaffInviteEmail(input: {
  to: string
  inviteeName: string
  acceptUrl: string
}) {
  const provider = createEmailProvider()
  const message = buildStaffInviteEmail(input)
  return provider.send(message)
}
