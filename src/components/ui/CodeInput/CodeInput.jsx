import { useId, useState } from 'react'
import { INVITE_CODE_LENGTH, normalizeInviteCode } from '../../../utils/inviteCode.js'
import '../FormField/FormField.css'
import './CodeInput.css'

/**
 * קוד הזמנה ב־6 תיבות, משמאל לימין (O3, O4, DESIGN.md §7.3).
 * מאחורי התיבות יש שדה אמיתי אחד, כדי שהקלדה, הדבקה, השלמה אוטומטית וקורא מסך יעבדו כמו בשדה רגיל.
 * onChange מקבל את הקוד המנורמל («blh-4k2» → «BLH4K2»).
 */
function CodeInput({ label, value, onChange, error, name = 'code', ref }) {
  const id = useId()
  const errorId = error ? `${id}-error` : undefined
  const [focused, setFocused] = useState(false)
  const activeIndex = Math.min(value.length, INVITE_CODE_LENGTH - 1)

  return (
    <div className={['code-input', error && 'code-input--error'].filter(Boolean).join(' ')}>
      <label htmlFor={id} className="code-input__label">
        {label}
      </label>
      <div className="code-input__boxes" dir="ltr">
        <input
          ref={ref}
          id={id}
          name={name}
          className="code-input__control"
          value={value}
          onChange={(event) => onChange(normalizeInviteCode(event.target.value))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="one-time-code"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId}
        />
        {Array.from({ length: INVITE_CODE_LENGTH }, (_, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={['code-input__box', focused && index === activeIndex && 'code-input__box--active']
              .filter(Boolean)
              .join(' ')}
          >
            {value[index] ?? ''}
          </span>
        ))}
      </div>
      {error && (
        <p id={errorId} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default CodeInput
