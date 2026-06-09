import { finalizeEmailMessage } from '@/lib/email/envelope'
import { buildTransactionalHtml, buildTransactionalText } from '@/lib/email/layout'
import { formatInviteSubject } from '@/lib/email/subject'
import { getAppOrigin } from '@/lib/settings/app-url'
import type { EmailMessage } from '@/lib/notifications/providers/email/types'

export function buildStaffInviteEmail(input: {
  to: string
  inviteeName: string
  acceptUrl: string
}): EmailMessage {
  const appUrl = getAppOrigin()
  const content = {
    preheader: 'Accept your invitation to access the VANROX admin portal and set your password.',
    eyebrow: 'Admin Portal Invitation',
    greeting: `Hi ${input.inviteeName},`,
    paragraphs: [
      'You have been invited to join the VANROX admin portal. Use the secure link below to accept your invitation and finish account setup.',
      'This invitation link expires for your security. If you did not expect this message, you can ignore it.',
    ],
    cta: {
      label: 'Accept invitation',
      url: input.acceptUrl,
    },
    secondaryNote: `If the button does not work, open this link in your browser: ${input.acceptUrl}`,
    footerNotes: [`After accepting, complete setup at ${appUrl}/admin/welcome.`],
  }

  return finalizeEmailMessage({
    to: input.to,
    subject: formatInviteSubject(),
    html: buildTransactionalHtml(content),
    text: buildTransactionalText(content),
    tags: [{ name: 'event_type', value: 'auth.staff.invited' }],
    referenceId: `staff-invite:${input.to}`,
  })
}
