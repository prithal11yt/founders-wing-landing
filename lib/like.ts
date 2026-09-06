// Escapes LIKE / ILIKE wildcards so a value is matched literally instead of as
// a pattern. Without this, an input of "%" matches every row — which is how the
// member-login lookup could be turned into an account-takeover / enumeration
// oracle. Use this on ANY value that reaches .ilike()/.like() from user input.
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`)
}
