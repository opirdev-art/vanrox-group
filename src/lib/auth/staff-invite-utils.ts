import { getAppOrigin } from '@/lib/settings/app-url'

export function buildStaffInviteAcceptUrl(hashedToken: string): string {
  const params = new URLSearchParams({
    token_hash: hashedToken,
    type: 'invite',
    next: '/admin/welcome',
  })

  return `${getAppOrigin()}/auth/callback?${params.toString()}`
}

export function isNewlyCreatedAuthUser(
  user: { created_at?: string },
  inviteStartedAtMs: number
): boolean {
  if (!user.created_at) return false
  return new Date(user.created_at).getTime() >= inviteStartedAtMs - 2000
}
