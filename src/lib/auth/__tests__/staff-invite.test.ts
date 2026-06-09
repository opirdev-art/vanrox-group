import { describe, expect, it } from 'vitest'
import { buildStaffInviteAcceptUrl, isNewlyCreatedAuthUser } from '../staff-invite-utils'

describe('staff invite helpers', () => {
  it('builds callback url with token_hash for server-side otp verification', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

    const url = buildStaffInviteAcceptUrl('abc123token')
    const parsed = new URL(url)

    expect(parsed.pathname).toBe('/auth/callback')
    expect(parsed.searchParams.get('token_hash')).toBe('abc123token')
    expect(parsed.searchParams.get('type')).toBe('invite')
    expect(parsed.searchParams.get('next')).toBe('/admin/welcome')
  })

  it('detects users created during the current invite attempt', () => {
    const startedAt = Date.now()
    expect(isNewlyCreatedAuthUser({ created_at: new Date(startedAt).toISOString() }, startedAt)).toBe(
      true
    )
    expect(
      isNewlyCreatedAuthUser({ created_at: new Date(startedAt - 60_000).toISOString() }, startedAt)
    ).toBe(false)
  })
})
