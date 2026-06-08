export type ActionResult = { ok: true; id?: number } | { ok: false; error: string }

export function getActionError(result: ActionResult): string | null {
  if (result.ok === false) return result.error
  return null
}
