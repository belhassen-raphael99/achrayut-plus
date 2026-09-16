import { useId } from 'react'
import Icon from '../Icon/Icon.jsx'
import { useModalDialog } from '../../../utils/useModalDialog.js'
import './Sheet.css'

/**
 * גיליון תחתון (DESIGN.md §7.11) על בסיס <dialog>:
 * הדפדפן מספק לכידת פוקוס והחזרת הפוקוס; Esc ולחיצה על הרקע דרך useModalDialog.
 */
function Sheet({ open, onClose, title, children }) {
  const titleId = useId()
  const dialogProps = useModalDialog(open, onClose)

  return (
    <dialog {...dialogProps} className="sheet" aria-labelledby={titleId}>
      <div className="sheet__panel">
        <div className="sheet__header">
          <h2 id={titleId} className="sheet__title">
            {title}
          </h2>
          <button type="button" className="sheet__close" onClick={onClose} aria-label="סגירה">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}

export default Sheet
