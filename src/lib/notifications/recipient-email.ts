import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ResolvedRecipient } from './recipient-resolver'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isRealProfileId(profileId: string): boolean {
  return UUID_RE.test(profileId)
}

export async function enrichRecipientsWithEmails(
  adminClient: SupabaseClient,
  recipients: ResolvedRecipient[]
): Promise<ResolvedRecipient[]> {
  return Promise.all(
    recipients.map(async (recipient) => {
      if (recipient.email || !isRealProfileId(recipient.profileId)) {
        return recipient
      }

      const { data, error } = await adminClient.auth.admin.getUserById(recipient.profileId)
      if (error || !data.user?.email) {
        return recipient
      }

      return {
        ...recipient,
        email: data.user.email,
      }
    })
  )
}
