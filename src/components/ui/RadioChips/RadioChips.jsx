import { useId } from 'react'
import Icon from '../Icon/Icon.jsx'
import '../FormField/FormField.css'
import '../CheckboxChips/CheckboxChips.css'

/**
 * בחירה אחת מתוך תגיות (N11 «משך האחריות», F10 «סוג איש הקשר», F12 «סוג המסמך»):
 * כפתורי רדיו אמיתיים בתוך fieldset, באותו מראה כמו CheckboxChips.
 * options: [{ id, label, disabled? }]. onChange מקבל את האירוע (תואם ל־useValidatedForm).
 */
function RadioChips({ legend, name, options, value, onChange, helper, error }) {
  const id = useId()
  const describedBy = [helper && `${id}-helper`, error && `${id}-error`].filter(Boolean).join(' ') || undefined

  return (
    <fieldset className="checkbox-chips" aria-describedby={describedBy}>
      <legend className="checkbox-chips__legend">{legend}</legend>
      <div className="checkbox-chips__options">
        {options.map((option) => {
          const checked = value === option.id
          return (
            <label key={option.id} className="checkbox-chip">
              <input
                type="radio"
                className="checkbox-chip__input"
                name={name}
                value={option.id}
                checked={checked}
                disabled={option.disabled}
                onChange={onChange}
              />
              <span className="checkbox-chip__label">
                {checked && <Icon name="check" size="sm" />}
                {option.label}
              </span>
            </label>
          )
        })}
      </div>
      {helper && (
        <p id={`${id}-helper`} className="field__helper checkbox-chips__helper">
          {helper}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field__error">
          {error}
        </p>
      )}
    </fieldset>
  )
}

export default RadioChips
