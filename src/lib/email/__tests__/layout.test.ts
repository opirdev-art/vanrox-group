import { describe, expect, it } from 'vitest'
import { buildTransactionalHeaders } from '../headers'
import { buildTransactionalHtml, buildTransactionalText } from '../layout'
import { finalizeEmailMessage } from '../envelope'

describe('transactional email layout', () => {
  it('includes preheader, multipart bodies, and deliverability headers', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    process.env.EMAIL_REPLY_TO = 'info@vanrox-group.com'

    const content = {
      preheader: 'Preview copy for inbox',
      greeting: 'Hi Pat,',
      paragraphs: ['Your account was updated.'],
    }

    const message = finalizeEmailMessage({
      to: 'pat@example.com',
      subject: 'VANROX: Account update',
      html: buildTransactionalHtml(content),
      text: buildTransactionalText(content),
      referenceId: 'evt-123',
    })

    expect(message.html).toContain('Preview copy for inbox')
    expect(message.html).toContain('color-scheme')
    expect(message.text).toContain('Hi Pat,')
    expect(message.text).toContain('transactional message')
    expect(message.replyTo).toBe('info@vanrox-group.com')
    expect(message.headers).toEqual({
      ...buildTransactionalHeaders({ referenceId: 'evt-123' }),
    })
  })
})
