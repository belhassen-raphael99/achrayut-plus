import { useId } from 'react'
import Icon from '../Icon/Icon.jsx'
import '../FormField/FormField.css'

/** אפשרות יכולה להיות מחרוזת («תקלה») או { value, label } כשהערך שונה מהטקסט */
function toOption(option) {
  return typeof option === 'string' ? { value: option, label: option } : option
}

/** רשימה נפתחת עם תווית גלויה (DESIGN.md §7.3) */
function SelectField({ label, options, helper, error, id: idProp, className, ...selectProps }) {
  const autoId = useId()
  const id = idProp ?? autoId
  const helperId = helper ? `${id}-helper` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={['field', error && 'field--error', className].filter(Boolean).join(' ')}>
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <div className="field__select">
        <select
          id={id}
          className="field__control field__control--select"
          aria-describedby={describedBy}
          aria-invalid={error ? 'true' : undefined}
          {...selectProps}
        >
          {options.map(toOption).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="keyboard_arrow_down" className="field__select-icon" />
      </div>
      {helper && (
        <p id={helperId} className="field__helper">
          {helper}
        </p>
      )}
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  )
}

export default SelectField
