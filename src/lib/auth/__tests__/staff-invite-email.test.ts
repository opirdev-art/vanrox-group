import { describe, expect, it } from 'vitest'
import { buildStaffInviteEmail } from '../staff-invite-email-template'

describe('buildStaffInviteEmail', () => {
  it('uses deliverability-first transactional envelope', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    process.env.EMAIL_REPLY_TO = 'info@vanrox-group.com'
    process.env.EMAIL_FROM = 'alerts@vanrox-group.com'

    const message = buildStaffInviteEmail({
      to: 'user@example.com',
      inviteeName: 'Xern <script>',
      acceptUrl: 'http://localhost:3000/auth/callback?token_hash=abc&type=invite',
    })

    expect(message.subject).toBe("You're invited to the VANROX admin portal")
    expect(message.html).toContain('Accept your invitation to access the VANROX admin portal')
    expect(message.html).toContain('Xern &lt;script&gt;')
    expect(message.html).not.toContain('<script>')
    expect(message.text).toContain('Accept invitation:')
    expect(message.text).toContain('transactional message')
    expect(message.headers?.['Auto-Submitted']).toBe('auto-generated')
    expect(message.replyTo).toBe('info@vanrox-group.com')
  })
})
