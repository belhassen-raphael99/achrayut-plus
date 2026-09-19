// כתובות תמונה מה־CDN של Unsplash, בגדלים שהדפדפן בוחר מהם (srcset)

const WIDTHS = [480, 768, 1080, 1440, 1920, 2400]

/*
 * צבעוני קולנוע אפוי ב־CDN (DESIGN.md §14.6), לא filter בזמן גלילה.
 * פרמטרי imgix שנבדקו ב־17/09/2026 (HTTP 200, נבחנו בעין): לילה = חשיפה נמוכה ומיזוג צבע בכחול לילה.
 */
const GRADES = {
  day: '&sat=-12',
  night: '&exp=-40&blend-color=1b2559&blend-mode=color&blend-alpha=80',
  // ערב (פרק 3 אחרי החלטת הזכוכית, 17/09): הכחול כגוון קל, לא לילה כבד
  dusk: '&exp=-12&blend-color=1b2559&blend-mode=color&blend-alpha=45',
  blur: '&blur=180&sat=-30',
}

/** כתובת אחת: auto=format מגיש WebP/AVIF לדפדפן שתומך */
export function unsplashUrl(id, width, quality = 72, grade) {
  const tone = (grade && GRADES[grade]) || ''
  return `https://images.unsplash.com/${id}?w=${width}&q=${quality}&auto=format&fit=crop${tone}`
}

/** srcset מלא, עד הרוחב המקסימלי שבאמת צריך */
export function unsplashSrcSet(id, maxWidth = 2400, grade) {
  return WIDTHS.filter((width) => width <= maxWidth)
    .map((width) => `${unsplashUrl(id, width, 72, grade)} ${width}w`)
    .join(', ')
}
