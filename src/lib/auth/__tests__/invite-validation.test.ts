import { describe, expect, it } from 'vitest'
import { parseSetInvitePasswordForm } from '../invite-validation'

describe('parseSetInvitePasswordForm', () => {
  it('accepts valid passwords', () => {
    const formData = new FormData()
    formData.set('new_password', 'SecurePass1')
    formData.set('confirm_password', 'SecurePass1')

    const result = parseSetInvitePasswordForm(formData)
    expect(result.ok).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const formData = new FormData()
    formData.set('new_password', 'SecurePass1')
    formData.set('confirm_password', 'SecurePass2')

    const result = parseSetInvitePasswordForm(formData)
    expect(result.ok).toBe(false)
  })
})
