import { useEffect, useRef } from 'react'

/**
 * מחבר <dialog> מודאלי ל־state (Sheet ו־Dialog): פתיחה וסגירה לפי open, Esc ולחיצה על הרקע.
 * Esc מטופל גם ידנית: בבדיקה בדפדפן, ההתנהגות המובנית של <dialog> לא סגרה אותו.
 * dismissible=false: רק כפתור בתוך הדיאלוג סוגר (למשל «החיבור הסתיים»).
 * מחזיר props לפזר על ה־<dialog>.
 */
export function useModalDialog(open, onClose, { dismissible = true } = {}) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  function requestClose(event) {
    event.preventDefault()
    if (dismissible) onClose()
  }

  return {
    ref: dialogRef,
    onClose,
    onCancel: requestClose,
    onKeyDown: (event) => {
      if (event.key === 'Escape') requestClose(event)
    },
    onClick: (event) => {
      if (dismissible && event.target === dialogRef.current) onClose()
    },
  }
}
