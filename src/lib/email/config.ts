export function getEmailFromMailbox(): string | undefined {
  return process.env.EMAIL_FROM?.trim() || undefined
}

export function getEmailFromName(): string {
  return process.env.EMAIL_FROM_NAME?.trim() || 'VANROX Group'
}

export function formatEmailFromAddress(): string {
  const mailbox = getEmailFromMailbox()
  const name = getEmailFromName()

  if (!mailbox) return name
  return `${name} <${mailbox}>`
}

export function getEmailReplyTo(): string | undefined {
  return process.env.EMAIL_REPLY_TO?.trim() || getEmailFromMailbox()
}

export function getEmailPhysicalAddress(): string | undefined {
  return process.env.EMAIL_PHYSICAL_ADDRESS?.trim() || undefined
}

export function getEmailSupportMailbox(): string | undefined {
  return getEmailReplyTo() || getEmailFromMailbox()
}
