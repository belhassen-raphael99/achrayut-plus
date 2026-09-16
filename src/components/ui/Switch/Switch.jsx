import { useId } from 'react'
import './Switch.css'

/**
 * מתג הפעלה/כיבוי (N11 «יש אחריות מורחבת», F10, P1): תיבת סימון אמיתית עם role="switch".
 * שאר ה־props (name, checked, onChange) עוברים לשדה.
 */
function Switch({ label, description, id: idProp, className, ...inputProps }) {
  const autoId = useId()
  const id = idProp ?? autoId
  const descriptionId = description ? `${id}-description` : undefined

  return (
    <div className={['switch', className].filter(Boolean).join(' ')}>
      <span className="switch__text">
        <label htmlFor={id} className="switch__label">
          {label}
        </label>
        {description && (
          <span id={descriptionId} className="switch__description">
            {description}
          </span>
        )}
      </span>
      <span className="switch__control">
        <input
          id={id}
          type="checkbox"
          role="switch"
          className="switch__input"
          aria-describedby={descriptionId}
          {...inputProps}
        />
        <span className="switch__track" aria-hidden="true" />
      </span>
    </div>
  )
}

export default Switch
