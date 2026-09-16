import './SegmentedBar.css'

const STAGE_ORDER = ['protected', 'soon', 'expired', 'unknown']

// מעל 30 מכשירים מקטע לכל מכשיר צר מדי: בלוק אחד לכל שלב, באורך יחסי (DESIGN.md §7.8)
const MAX_SEGMENTS = 30

/**
 * הפס המחולק בבלוק הראש (DESIGN.md §7.8): מקטע לכל מכשיר, בצבע השלב שלו.
 * דקורטיבי (aria-hidden): המשמעות נמסרת בשורת הסיכום שמתחתיו.
 */
function SegmentedBar({ counts, animate = false, className }) {
  const total = STAGE_ORDER.reduce((sum, stage) => sum + counts[stage], 0)

  const segments =
    total > MAX_SEGMENTS
      ? STAGE_ORDER.filter((stage) => counts[stage] > 0).map((stage) => ({ stage, grow: counts[stage] }))
      : STAGE_ORDER.flatMap((stage) => Array.from({ length: counts[stage] }, () => ({ stage, grow: 1 })))

  return (
    <div
      className={['segmented-bar', animate && 'segmented-bar--animate', className].filter(Boolean).join(' ')}
      style={{ '--segment-count': segments.length }}
      aria-hidden="true"
    >
      {segments.map((segment, index) => (
        <span
          key={index}
          className={`segmented-bar__segment segmented-bar__segment--${segment.stage}`}
          style={{ flexGrow: segment.grow, '--segment-index': index }}
        />
      ))}
    </div>
  )
}

export default SegmentedBar
