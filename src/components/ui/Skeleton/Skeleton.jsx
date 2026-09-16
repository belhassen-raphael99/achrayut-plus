import './Skeleton.css'

/**
 * בלוק טעינה סטטי, באותה צורה כמו התוכן (DESIGN.md §8): בלי הבהוב ובלי ספינר.
 * size: text · title · number · bar · icon · width: sm · md · lg · full · inverse: על בלוק כחול לילה
 */
function Skeleton({ size = 'text', width = 'full', inverse = false, className }) {
  const classes = [
    'skeleton',
    `skeleton--${size}`,
    `skeleton--width-${width}`,
    inverse && 'skeleton--inverse',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <span className={classes} aria-hidden="true" />
}

export default Skeleton
