export type AuthErrorCode =
  | 'unauthorized'
  | 'signed_out'
  | 'session_required'
  | 'auth_callback_failed'
  | 'invalid_credentials'

const AUTH_MESSAGES: Record<AuthErrorCode, string> = {
  unauthorized:
    'This account does not have admin access. Sign out and use an authorized staff account, or contact your administrator.',
  signed_out: 'You have been signed out.',
  session_required: 'Please sign in to access the admin portal.',
  auth_callback_failed: 'Sign in failed. Please try again.',
  invalid_credentials: 'Invalid email or password.',
}

export function getAuthErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null
  return AUTH_MESSAGES[code as AuthErrorCode] ?? null
}

export function isAdminRole(role: string | null | undefined): boolean {
  return role === 'admin' || role === 'super_admin'
}
