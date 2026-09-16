import { useRef, useState } from 'react'
import Dialog from '../../ui/Dialog/Dialog.jsx'
import Button from '../../ui/Button/Button.jsx'
import TextField from '../../ui/TextField/TextField.jsx'

/**
 * אישור של פעולה שאי אפשר לבטל, בהקלדת מילה (P5 שם המרחב, P6 «מחיקה» · FR-1.7, FR-1.9).
 * הכפתור לא מושבת: לחיצה עם טקסט שלא תואם מציגה הסבר ליד השדה (DESIGN.md §7.1).
 * הרכיב נבנה מחדש בכל פתיחה (key בעמוד), כדי שהשדה יתחיל ריק.
 */
function TypedConfirmDialog({ open, onClose, title, confirmWord, actionLabel, onConfirm, children }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const fieldRef = useRef(null)

  function handleConfirm() {
    if (value.trim() !== confirmWord) {
      setError(`הטקסט לא תואם. הקלידו «${confirmWord}» בדיוק.`)
      // הפוקוס חוזר לשדה, אחרת המשתמש נשאר על כפתור שלא עשה כלום
      fieldRef.current?.focus()
      return
    }
    onConfirm()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      actions={
        <>
          <Button variant="danger" fullWidth onClick={handleConfirm}>
            {actionLabel}
          </Button>
          <Button variant="secondary" fullWidth onClick={onClose}>
            ביטול
          </Button>
        </>
      }
    >
      {children}
      <TextField
        label={
          <>
            כדי לאשר, הקלידו: <bdi>{confirmWord}</bdi>
          </>
        }
        name="confirm"
        autoComplete="off"
        ref={fieldRef}
        alertError
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
          if (error) setError('')
        }}
        error={error}
      />
    </Dialog>
  )
}

export default TypedConfirmDialog
