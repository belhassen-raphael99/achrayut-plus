import { icons } from './icons.js'
import './Icon.css'

/**
 * אייקון SVG מ־Material Symbols Outlined (DESIGN.md §9), צבוע בצבע הטקסט.
 * דקורטיבי כברירת מחדל; `label` הופך אותו לתמונה עם שם נגיש.
 */
function Icon({ name, size = 'md', flipInRtl = false, label, className }) {
  const src = icons[name]

  if (!src) {
    if (import.meta.env.DEV) console.warn(`Icon: "${name}" חסר ב־icons.js`)
    return null
  }

  const classes = ['icon', `icon--${size}`, flipInRtl && 'icon-flip-rtl', className]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      className={classes}
      style={{ '--icon-src': `url("${src}")` }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
    />
  )
}

export default Icon
