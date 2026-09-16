// כתובות תמונה מה־CDN של Unsplash, בגדלים שהדפדפן בוחר מהם (srcset)

const WIDTHS = [480, 768, 1080, 1440, 1920, 2400]

/** כתובת אחת: auto=format מגיש WebP/AVIF לדפדפן שתומך */
export function unsplashUrl(id, width, quality = 72) {
  return `https://images.unsplash.com/${id}?w=${width}&q=${quality}&auto=format&fit=crop`
}

/** srcset מלא, עד הרוחב המקסימלי שבאמת צריך */
export function unsplashSrcSet(id, maxWidth = 2400) {
  return WIDTHS.filter((width) => width <= maxWidth)
    .map((width) => `${unsplashUrl(id, width)} ${width}w`)
    .join(', ')
}
