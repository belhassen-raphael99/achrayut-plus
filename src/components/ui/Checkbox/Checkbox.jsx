import { useId } from 'react'
import '../FormField/FormField.css'
import './Checkbox.css'

/** תיבת סימון עם תווית (אפשר קישורים בתוכה) ושגיאה מקושרת (A7, A8) */
function Checkbox({ label, error, id: idProp, className, ...inputProps }) {
  const autoId = useId()
  const id = idProp ?? autoId
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className={['checkbox', error && 'checkbox--error', className].filter(Boolean).join(' ')}>
      <div className="checkbox__row">
        <input
          id={id}
          type="checkbox"
          className="checkbox__input"
          aria-describedby={errorId}
          aria-invalid={error ? 'true' : undefined}
          {...inputProps}
        />
        <label htmlFor={id} className="checkbox__label">
          {label}
        </label>
      </div>
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  )
}

export default Checkbox
