import { useId } from 'react'
import { useModalDialog } from '../../../utils/useModalDialog.js'
import './Dialog.css'

/**
 * דיאלוג במרכז המסך (DESIGN.md §7.11): כותרת, משפט אחד או שניים, כפתורים.
 * dismissible=false כשהמשתמש חייב לבחור (למשל «החיבור הסתיים», A18).
 */
function Dialog({ open, onClose, title, children, actions, dismissible = true }) {
  const titleId = useId()
  const dialogProps = useModalDialog(open, onClose, { dismissible })

  return (
    <dialog {...dialogProps} className="dialog" aria-labelledby={titleId}>
      <div className="dialog__panel">
        <h2 id={titleId} className="dialog__title">
          {title}
        </h2>
        <div className="dialog__body">{children}</div>
        {actions && <div className="dialog__actions">{actions}</div>}
      </div>
    </dialog>
  )
}

export default Dialog
