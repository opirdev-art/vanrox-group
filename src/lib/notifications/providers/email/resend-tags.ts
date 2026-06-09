export function sanitizeResendTagValue(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, '_')
}

export function sanitizeResendTags(
  tags: { name: string; value: string }[] | undefined
): { name: string; value: string }[] | undefined {
  if (!tags?.length) return tags

  return tags.map((tag) => ({
    name: sanitizeResendTagValue(tag.name),
    value: sanitizeResendTagValue(tag.value),
  }))
}
