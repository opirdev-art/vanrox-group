import type { ParseResult } from '@/lib/parse-result'

export type ChangePasswordInput = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

function hasMixedCharacterTypes(value: string): boolean {
  const hasLetter = /[a-zA-Z]/.test(value)
  const hasDigit = /\d/.test(value)
  return hasLetter && hasDigit
}

export function parseChangePasswordForm(formData: FormData): ParseResult<ChangePasswordInput> {
  const currentPassword = String(formData.get('current_password') ?? '')
  const newPassword = String(formData.get('new_password') ?? '')
  const confirmPassword = String(formData.get('confirm_password') ?? '')

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { ok: false, error: 'All password fields are required' }
  }

  if (newPassword.length < 8) {
    return { ok: false, error: 'New password must be at least 8 characters' }
  }

  if (!hasMixedCharacterTypes(newPassword)) {
    return { ok: false, error: 'New password must include letters and numbers' }
  }

  if (newPassword !== confirmPassword) {
    return { ok: false, error: 'New passwords do not match' }
  }

  if (newPassword === currentPassword) {
    return { ok: false, error: 'New password must be different from your current password' }
  }

  return {
    ok: true,
    data: { currentPassword, newPassword, confirmPassword },
  }
}
