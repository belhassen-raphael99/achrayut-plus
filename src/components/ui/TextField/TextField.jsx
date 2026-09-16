import { useId } from 'react'
import '../FormField/FormField.css'

/**
 * שדה טקסט עם תווית גלויה, עזרה ושגיאה מקושרת (DESIGN.md §7.3).
 * dir="auto" כברירת מחדל; אימייל, טלפון וקודים מקבלים dir="ltr".
 * invalid: גבול אדום בלי הודעה מתחת לשדה (כשההודעה משותפת לכמה שדות, A2).
 * alertError: השגיאה מוכרזת מיד לקורא מסך (שגיאה שמופיעה אחרי לחיצה, לא בזמן ההקלדה).
 */
function TextField({
  label,
  helper,
  error,
  invalid = false,
  alertError = false,
  multiline = false,
  dir = 'auto',
  id: idProp,
  className,
  ...controlProps
}) {
  const autoId = useId()
  const id = idProp ?? autoId
  const helperId = helper ? `${id}-helper` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined
  const hasError = Boolean(error) || invalid
  const Control = multiline ? 'textarea' : 'input'

  return (
    <div className={['field', hasError && 'field--error', className].filter(Boolean).join(' ')}>
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <Control
        id={id}
        dir={dir}
        className={['field__control', multiline && 'field__control--multiline'].filter(Boolean).join(' ')}
        aria-describedby={describedBy}
        aria-invalid={hasError ? 'true' : undefined}
        {...controlProps}
      />
      {helper && (
        <p id={helperId} className="field__helper">
          {helper}
        </p>
      )}
      {error && (
        <p id={errorId} className="field__error" role={alertError ? 'alert' : undefined}>
          {error}
        </p>
      )}
    </div>
  )
}

export default TextField
