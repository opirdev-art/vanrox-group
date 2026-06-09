export type ParseResult<T> = { ok: true; data: T } | { ok: false; error: string }

export function isParseFailure<T>(
  result: ParseResult<T>
): result is Extract<ParseResult<T>, { ok: false }> {
  return result.ok === false
}
