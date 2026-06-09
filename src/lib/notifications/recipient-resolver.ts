import type { SupabaseClient } from '@supabase/supabase-js'
import type { DomainEvent } from './events'
import type { RecipientRule } from './routing'

export type ResolvedRecipient = {
  profileId: string
  email: string | null
  fullName: string
  role: string
  metadata: Record<string, unknown> | null
  matchedRules: RecipientRule[]
}

type ProfileRow = {
  id: string
  full_name: string
  role: string
  metadata: Record<string, unknown> | null
}

function mergeRecipient(
  map: Map<string, ResolvedRecipient>,
  profile: ProfileRow,
  email: string | null,
  rule: RecipientRule
) {
  const existing = map.get(profile.id)
  if (existing) {
    if (!existing.matchedRules.includes(rule)) {
      existing.matchedRules.push(rule)
    }
    return
  }

  map.set(profile.id, {
    profileId: profile.id,
    email,
    fullName: profile.full_name,
    role: profile.role,
    metadata: profile.metadata,
    matchedRules: [rule],
  })
}

async function fetchAdminProfiles(client: SupabaseClient): Promise<ProfileRow[]> {
  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, role, metadata')
    .in('role', ['admin', 'super_admin'])
    .is('deleted_at', null)

  if (error) throw new Error(error.message)
  return (data ?? []) as ProfileRow[]
}

async function fetchSuperAdminProfiles(client: SupabaseClient): Promise<ProfileRow[]> {
  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, role, metadata')
    .eq('role', 'super_admin')
    .is('deleted_at', null)

  if (error) throw new Error(error.message)
  return (data ?? []) as ProfileRow[]
}

async function fetchProfileById(client: SupabaseClient, profileId: string): Promise<ProfileRow | null> {
  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, role, metadata')
    .eq('id', profileId)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (data as ProfileRow | null) ?? null
}

function resolveSubjectUserId(event: DomainEvent): string | null {
  const payload = event.payload as Record<string, unknown>

  if ('userId' in payload && typeof payload.userId === 'string') return payload.userId
  if ('invitedUserId' in payload && typeof payload.invitedUserId === 'string') return payload.invitedUserId
  if ('subjectUserId' in payload && typeof payload.subjectUserId === 'string') return payload.subjectUserId

  if (event.aggregateId && /^[0-9a-f-]{36}$/i.test(event.aggregateId)) {
    return event.aggregateId
  }

  return null
}

function resolveActorUserId(event: DomainEvent): string | null {
  if (event.actorId) return event.actorId
  return resolveSubjectUserId(event)
}

async function resolveBusinessContactRecipients(client: SupabaseClient): Promise<ResolvedRecipient[]> {
  const { data, error } = await client.from('business_settings').select('email').eq('id', 1).maybeSingle()
  if (error) throw new Error(error.message)

  const email = data?.email?.trim()
  if (!email) return []

  return [
    {
      profileId: `business_contact:${email}`,
      email,
      fullName: 'Business Contact',
      role: 'business_contact',
      metadata: null,
      matchedRules: ['business_contact'],
    },
  ]
}

export async function resolveRecipients(
  client: SupabaseClient,
  event: DomainEvent,
  rules: RecipientRule[] | 'off'
): Promise<ResolvedRecipient[]> {
  if (rules === 'off' || rules.length === 0) return []

  const map = new Map<string, ResolvedRecipient>()

  for (const rule of rules) {
    switch (rule) {
      case 'all_admins': {
        const admins = await fetchAdminProfiles(client)
        for (const profile of admins) {
          mergeRecipient(map, profile, null, rule)
        }
        break
      }
      case 'super_admins_only': {
        const superAdmins = await fetchSuperAdminProfiles(client)
        for (const profile of superAdmins) {
          mergeRecipient(map, profile, null, rule)
        }
        break
      }
      case 'actor': {
        const actorId = resolveActorUserId(event)
        if (!actorId) break
        const profile = await fetchProfileById(client, actorId)
        if (profile) mergeRecipient(map, profile, null, rule)
        break
      }
      case 'subject': {
        const subjectId = resolveSubjectUserId(event)
        if (subjectId) {
          const profile = await fetchProfileById(client, subjectId)
          if (profile) {
            mergeRecipient(map, profile, null, rule)
            break
          }
        }

        const payload = event.payload as Record<string, unknown>
        const subjectEmail =
          typeof payload.inviteeEmail === 'string'
            ? payload.inviteeEmail
            : typeof payload.subjectEmail === 'string'
              ? payload.subjectEmail
              : typeof payload.email === 'string'
                ? payload.email
                : null

        if (subjectEmail) {
          const syntheticId = `subject:${subjectEmail}`
          map.set(syntheticId, {
            profileId: syntheticId,
            email: subjectEmail,
            fullName: typeof payload.inviteeName === 'string' ? payload.inviteeName : 'User',
            role: 'subject',
            metadata: null,
            matchedRules: [rule],
          })
        }
        break
      }
      case 'business_contact': {
        const contacts = await resolveBusinessContactRecipients(client)
        for (const contact of contacts) {
          map.set(contact.profileId, contact)
        }
        break
      }
    }
  }

  return [...map.values()]
}
