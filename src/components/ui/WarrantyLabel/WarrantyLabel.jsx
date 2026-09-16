import { formatDate } from '../../../utils/format.js'
import './WarrantyLabel.css'

const STAGES = [
  { id: 'protected', label: 'מוגנת' },
  { id: 'soon', label: 'מסתיימת בקרוב' },
  { id: 'expired', label: 'הסתיימה' },
]

/**
 * תו האחריות, החתימה של המוצר (DESIGN.md §6): שלושה פסים במדרגות וחץ שמצביע על השלב הנוכחי.
 * stage: protected · soon · expired · unknown (בלי חץ)
 * prefix: מילה לפני המספר בחץ («לפני», כשהאחריות הסתיימה) · lines / children: השורות התחתונות, כולל קישורים
 * הפסים דקורטיביים; `summary` נותן לקורא המסך את המשמעות במשפט אחד.
 */
function WarrantyLabel({
  brand,
  purchaseDate,
  stage,
  value,
  unit,
  prefix,
  estimated = false,
  lines = [],
  summary,
  className,
  children,
}) {
  return (
    <figure className={['warranty-label', className].filter(Boolean).join(' ')}>
      <figcaption className="warranty-label__header">
        <span>תו אחריות</span>
        {brand && purchaseDate && (
          <span className="warranty-label__meta">
            <bdi>{brand}</bdi> · נקנתה {formatDate(purchaseDate)}
          </span>
        )}
      </figcaption>

      {summary && <p className="visually-hidden">{summary}</p>}

      <ol className="warranty-label__bars" aria-hidden="true">
        {STAGES.map((item) => (
          <li key={item.id} className={`warranty-label__row warranty-label__row--${item.id}`}>
            <span className="warranty-label__bar">{item.label}</span>
            {stage === item.id && (
              <span className="warranty-label__arrow">
                <span className="warranty-label__value">{value}</span>
                {(prefix || unit) && (
                  <span className="warranty-label__units">
                    {prefix && <span>{prefix}</span>}
                    {unit && <span>{unit}</span>}
                  </span>
                )}
              </span>
            )}
          </li>
        ))}
      </ol>

      {estimated && <p className="warranty-label__estimated">משוער</p>}
      {stage === 'unknown' && <p className="warranty-label__unknown">תאריך לא ידוע</p>}

      {(lines.length > 0 || children) && (
        <div className="warranty-label__footer">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          {children}
        </div>
      )}
    </figure>
  )
}

export default WarrantyLabel
