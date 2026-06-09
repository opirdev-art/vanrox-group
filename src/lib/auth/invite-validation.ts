import type { ParseResult } from '@/lib/parse-result'

export type SetInvitePasswordInput = {
  newPassword: string
  confirmPassword: string
}

function hasMixedCharacterTypes(value: string): boolean {
  const hasLetter = /[a-zA-Z]/.test(value)
  const hasDigit = /\d/.test(value)
  return hasLetter && hasDigit
}

export function parseSetInvitePasswordForm(formData: FormData): ParseResult<SetInvitePasswordInput> {
  const newPassword = String(formData.get('new_password') ?? '')
  const confirmPassword = String(formData.get('confirm_password') ?? '')

  if (!newPassword || !confirmPassword) {
    return { ok: false, error: 'Both password fields are required' }
  }

  if (newPassword.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters' }
  }

  if (!hasMixedCharacterTypes(newPassword)) {
    return { ok: false, error: 'Password must include letters and numbers' }
  }

  if (newPassword !== confirmPassword) {
    return { ok: false, error: 'Passwords do not match' }
  }

  return { ok: true, data: { newPassword, confirmPassword } }
}
