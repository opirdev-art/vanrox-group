const SUBJECT_MAX_LENGTH = 78

export function formatNotificationSubject(title: string): string {
  const normalized = title.replace(/\s+/g, ' ').trim()
  const subject = `VANROX: ${normalized}`
  return subject.length > SUBJECT_MAX_LENGTH ? `${subject.slice(0, SUBJECT_MAX_LENGTH - 1)}…` : subject
}

export function formatInviteSubject(): string {
  return "You're invited to the VANROX admin portal"
}
