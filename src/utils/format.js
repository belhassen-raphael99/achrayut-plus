// פורמט מחירים ותאריכים בעברית (DESIGN.md §4.2)

const priceFormatter = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
})

/** מחיר בשקלים, למשל «149 ₪» */
export function formatPrice(amount) {
  return priceFormatter.format(amount)
}

const dateFormatter = new Intl.DateTimeFormat('he-IL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

/** תאריך בפורמט DD/MM/YYYY */
export function formatDate(date) {
  const parts = Object.fromEntries(
    dateFormatter.formatToParts(date).map(({ type, value }) => [type, value]),
  )
  return `${parts.day}/${parts.month}/${parts.year}`
}
