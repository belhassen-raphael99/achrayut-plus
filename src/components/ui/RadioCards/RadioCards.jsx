import { useId } from 'react'
import Icon from '../Icon/Icon.jsx'
import '../FormField/FormField.css'
import './RadioCards.css'

/**
 * בחירה אחת מתוך כרטיסים (O2, M2): כפתורי רדיו אמיתיים, עם אייקון, כותרת ושורת הסבר.
 * options: [{ id, label, description?, icon?, disabled? }]. onChange מקבל את האירוע (תואם ל־useValidatedForm).
 * helper: הסבר מתחת לכרטיסים (למשל למה אפשרות לא זמינה).
 */
function RadioCards({ legend, name, options, value, onChange, error, helper }) {
  const id = useId()
  const errorId = error ? `${id}-error` : undefined

  return (
    <fieldset className={['radio-cards', error && 'radio-cards--error'].filter(Boolean).join(' ')}>
      <legend className="radio-cards__legend">{legend}</legend>
      <div className="radio-cards__options">
        {options.map((option) => (
          <label key={option.id} className="radio-card">
            <input
              type="radio"
              className="radio-card__input"
              name={name}
              value={option.id}
              checked={value === option.id}
              disabled={option.disabled}
              onChange={onChange}
              aria-describedby={[errorId, helper && `${id}-helper`].filter(Boolean).join(' ') || undefined}
              aria-invalid={error ? 'true' : undefined}
            />
            {option.icon && (
              <span className="radio-card__icon">
                <Icon name={option.icon} />
              </span>
            )}
            <span className="radio-card__text">
              <span className="radio-card__title">{option.label}</span>
              {option.description && (
                <span className="radio-card__description">{option.description}</span>
              )}
            </span>
            <span className="radio-card__indicator" aria-hidden="true">
              <Icon name="check" size="sm" />
            </span>
          </label>
        ))}
      </div>
      {helper && (
        <p id={`${id}-helper`} className="field__helper">
          {helper}
        </p>
      )}
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </fieldset>
  )
}

export default RadioCards
