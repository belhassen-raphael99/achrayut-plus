import { useId, useState } from 'react'
import Icon from '../Icon/Icon.jsx'
import '../FormField/FormField.css'

/**
 * שדה סיסמה עם כפתור הצג/הסתר בתוך השדה, בצד שמאל (DESIGN.md §7.3).
 * children: מקום למד החוזק, בין העזרה לשגיאה.
 */
function PasswordField({ label, helper, error, invalid = false, id: idProp, className, children, ...inputProps }) {
  const autoId = useId()
  const id = idProp ?? autoId
  const [visible, setVisible] = useState(false)
  const helperId = helper ? `${id}-helper` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined
  const hasError = Boolean(error) || invalid

  return (
    <div className={['field', hasError && 'field--error', className].filter(Boolean).join(' ')}>
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <div className="field__password">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          dir="ltr"
          className="field__control field__control--password"
          aria-describedby={describedBy}
          aria-invalid={hasError ? 'true' : undefined}
          {...inputProps}
        />
        <button
          type="button"
          className="field__reveal"
          aria-label="הצגת הסיסמה"
          aria-pressed={visible}
          aria-controls={id}
          onClick={() => setVisible((value) => !value)}
        >
          <Icon name={visible ? 'visibility_off' : 'visibility'} />
        </button>
      </div>
      {helper && (
        <p id={helperId} className="field__helper">
          {helper}
        </p>
      )}
      {children}
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  )
}

export default PasswordField
