import Chip from '../../ui/Chip/Chip.jsx'
import './UsageMeter.css'

/**
 * שימוש מול מגבלה במסך התוכנית (P9, FR-6.1): «3 מתוך 5», פס, ו«הגעתם למגבלה».
 * limit = null → «ללא הגבלה», בלי פס. המספר תמיד כתוב; הפס רק מחזק אותו (NFR-2).
 */
function UsageMeter({ label, used, limit, helper }) {
  const unlimited = limit === null
  const reached = !unlimited && used >= limit
  const ratio = unlimited ? 0 : Math.min(1, used / limit)

  return (
    <div className="usage">
      <div className="usage__head">
        <span className="usage__label">{label}</span>
        <span className="usage__value">{unlimited ? 'ללא הגבלה' : `${used} מתוך ${limit}`}</span>
      </div>
      {!unlimited && (
        <span className={['usage__track', reached && 'usage__track--reached'].filter(Boolean).join(' ')} aria-hidden="true">
          <span className="usage__fill" style={{ '--usage': ratio }} />
        </span>
      )}
      {(reached || helper) && (
        <p className="usage__helper">
          {reached && <Chip tone="soon">הגעתם למגבלה</Chip>}
          {helper && <span>{helper}</span>}
        </p>
      )}
    </div>
  )
}

export default UsageMeter
