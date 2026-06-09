export function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  const text = String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export function buildCsv(headers: string[], rows: unknown[][]): string {
  const lines = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) => row.map(escapeCsvValue).join(',')),
  ]
  return lines.join('\r\n')
}

export function csvDownloadFilename(prefix: string): string {
  const date = new Date().toISOString().slice(0, 10)
  return `${prefix}-${date}.csv`
}
