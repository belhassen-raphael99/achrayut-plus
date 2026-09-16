import { useId } from 'react'
import Button from '../../ui/Button/Button.jsx'
import './AddInvoiceButton.css'

/**
 * «צילום חשבונית», פעולת המוצר (DESIGN.md §7.1). פותח את תפריט ההוספה (N1).
 * בלי חיבור: כפתור משני מושבת, עם הסבר מקושר (E4, DESIGN.md §8).
 */
function AddInvoiceButton({ offline = false, onClick, className, ...rest }) {
  const helpId = useId()

  return (
    <div className={['add-invoice', className].filter(Boolean).join(' ')} {...rest}>
      <Button
        variant={offline ? 'secondary' : 'accent'}
        icon="photo_camera"
        fullWidth
        onClick={onClick}
        disabled={offline}
        aria-haspopup="dialog"
        aria-describedby={offline ? helpId : undefined}
      >
        צילום חשבונית
      </Button>
      {offline && (
        <p id={helpId} className="add-invoice__help">
          יהיה זמין כשהחיבור יחזור
        </p>
      )}
    </div>
  )
}

export default AddInvoiceButton
