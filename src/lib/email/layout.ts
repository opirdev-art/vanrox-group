import { escapeHtml } from '@/lib/auth/escape-html'
import { getAppOrigin } from '@/lib/settings/app-url'
import { getEmailPhysicalAddress, getEmailSupportMailbox } from './config'

export type TransactionalEmailContent = {
  preheader: string
  eyebrow?: string
  greeting?: string
  paragraphs: string[]
  cta?: { label: string; url: string }
  secondaryNote?: string
  footerNotes?: string[]
}

const PREHEADER_SPACER = '&nbsp;&zwnj;&nbsp;'.repeat(12)

function footerLines(): string[] {
  const lines = [
    'This is a transactional message from VANROX Group about your account or activity.',
  ]

  const physicalAddress = getEmailPhysicalAddress()
  if (physicalAddress) {
    lines.push(physicalAddress)
  }

  const supportMailbox = getEmailSupportMailbox()
  if (supportMailbox) {
    lines.push(`Questions? Reply to this email or contact ${supportMailbox}.`)
  }

  lines.push(`${getAppOrigin()}`)
  return lines
}

export function buildTransactionalHtml(content: TransactionalEmailContent): string {
  const safePreheader = escapeHtml(content.preheader)
  const eyebrow = content.eyebrow ? escapeHtml(content.eyebrow) : 'VANROX'
  const greeting = content.greeting ? `<p style="margin:0 0 16px;color:#ffffff;font-size:17px;">${escapeHtml(content.greeting)}</p>` : ''
  const paragraphs = content.paragraphs
    .map((paragraph) => `<p style="margin:0 0 16px;">${escapeHtml(paragraph)}</p>`)
    .join('')
  const cta = content.cta
    ? `<tr>
        <td align="center" style="padding:8px 36px 28px;">
          <a href="${escapeHtml(content.cta.url)}" style="display:inline-block;padding:14px 28px;background-color:#00c853;color:#0a1628;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;letter-spacing:1px;text-transform:uppercase;border-radius:8px;mso-padding-alt:0;">
            <span style="mso-text-raise:4px;">${escapeHtml(content.cta.label)}</span>
          </a>
        </td>
      </tr>`
    : ''
  const secondaryNote = content.secondaryNote
    ? `<tr>
        <td style="padding:0 36px 28px;font-family:Arial,Helvetica,sans-serif;color:#9ca3af;font-size:13px;line-height:1.6;">
          <p style="margin:0;word-break:break-word;">${escapeHtml(content.secondaryNote)}</p>
        </td>
      </tr>`
    : ''
  const extraFooter = (content.footerNotes ?? [])
    .map((note) => `<p style="margin:0 0 10px;">${escapeHtml(note)}</p>`)
    .join('')
  const footer = footerLines()
    .map((line) => `<p style="margin:0 0 8px;">${escapeHtml(line)}</p>`)
    .join('')

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>VANROX</title>
  </head>
  <body style="margin:0;padding:0;background-color:#eceff1;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:#eceff1;">
      ${safePreheader}${PREHEADER_SPACER}
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#eceff1;border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background-color:#0a1628;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;">
            <tr>
              <td style="padding:28px 36px 22px;border-bottom:1px solid rgba(255,255,255,0.08);">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:30px;font-weight:700;letter-spacing:4px;color:#ffffff;line-height:1;">VANROX</div>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#00c853;margin-top:6px;">${eyebrow}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 36px 12px;font-family:Arial,Helvetica,sans-serif;color:#d1d5db;line-height:1.65;font-size:15px;">
                ${greeting}
                ${paragraphs}
              </td>
            </tr>
            ${cta}
            ${secondaryNote}
            <tr>
              <td style="padding:20px 36px 28px;border-top:1px solid rgba(255,255,255,0.08);font-family:Arial,Helvetica,sans-serif;color:#6b7280;font-size:12px;line-height:1.5;">
                ${extraFooter}
                ${footer}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export function buildTransactionalText(content: TransactionalEmailContent): string {
  const lines: string[] = []

  if (content.greeting) {
    lines.push(content.greeting, '')
  }

  for (const paragraph of content.paragraphs) {
    lines.push(paragraph, '')
  }

  if (content.cta) {
    lines.push(`${content.cta.label}: ${content.cta.url}`, '')
  }

  if (content.secondaryNote) {
    lines.push(content.secondaryNote, '')
  }

  for (const note of content.footerNotes ?? []) {
    lines.push(note, '')
  }

  lines.push('---')
  for (const line of footerLines()) {
    lines.push(line)
  }

  return lines.join('\n').trim()
}
