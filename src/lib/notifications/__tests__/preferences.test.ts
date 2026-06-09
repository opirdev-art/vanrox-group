import { describe, expect, it } from 'vitest'
import { isChannelEnabledForRecipient } from '../preferences'
import { getEventRouting } from '../routing'

describe('notification preferences', () => {
  it('forces email for required security events', () => {
    const routing = getEventRouting('auth.password.changed')
    const enabled = isChannelEnabledForRecipient(
      'auth.password.changed',
      'email',
      { profileId: 'user-1', role: 'admin', metadata: { notification_preferences: { 'auth.password.changed': { in_app: false, email: false } } } },
      routing
    )

    expect(enabled).toBe(true)
  })

  it('skips delivery for audit-only events', () => {
    const routing = getEventRouting('auth.login.failed')
    const enabled = isChannelEnabledForRecipient(
      'auth.login.failed',
      'in_app',
      { profileId: 'user-1', role: 'super_admin', metadata: null },
      routing
    )

    expect(enabled).toBe(false)
  })
})
