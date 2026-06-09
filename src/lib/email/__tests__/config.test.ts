import { afterEach, describe, expect, it } from 'vitest'
import { formatEmailFromAddress, getEmailReplyTo } from '../config'

describe('email config', () => {
  afterEach(() => {
    delete process.env.EMAIL_FROM
    delete process.env.EMAIL_FROM_NAME
    delete process.env.EMAIL_REPLY_TO
  })

  it('formats from address with display name', () => {
    process.env.EMAIL_FROM = 'alerts@vanrox-group.com'
    process.env.EMAIL_FROM_NAME = 'VANROX Group'

    expect(formatEmailFromAddress()).toBe('VANROX Group <alerts@vanrox-group.com>')
  })

  it('falls back reply-to to from mailbox', () => {
    process.env.EMAIL_FROM = 'alerts@vanrox-group.com'
    expect(getEmailReplyTo()).toBe('alerts@vanrox-group.com')
  })
})
