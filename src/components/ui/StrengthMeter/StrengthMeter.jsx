import { passwordStrength } from '../../../utils/password.js'
import './StrengthMeter.css'

/** מד חוזק הסיסמה (A14, A15, DESIGN.md §7.19). מוצג רק כשיש סיסמה */
function StrengthMeter({ password }) {
  const { score, label } = passwordStrength(password)
  if (score === 0) return null

  return (
    <div className={`strength strength--${score}`}>
      <div className="strength__bar" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="strength__label" aria-live="polite">
        חוזק הסיסמה: {label}
      </p>
    </div>
  )
}

export default StrengthMeter
