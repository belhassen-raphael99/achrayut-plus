/** מזהה חדש לרשומה מזויפת. בשלב 8 המזהים מגיעים מ־Postgres */
export function createId(prefix) {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${prefix}-${random}`
}
