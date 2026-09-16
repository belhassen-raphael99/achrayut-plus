import { useEffect } from 'react'
import Icon from '../Icon/Icon.jsx'
import './Toast.css'

// DESIGN.md §7.12: ההודעה נעלמת אחרי 4 שניות
const TOAST_MS = 4000

/**
 * הודעה קצרה בתחתית המסך («המכשיר נשמר», F1). role="status" על אזור שקיים תמיד,
 * כדי שקורא המסך יכריז כשההודעה מופיעה. onDone נקרא כשהזמן עובר.
 */
function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return undefined
    const timer = setTimeout(onDone, TOAST_MS)
    return () => clearTimeout(timer)
    // הטיימר מתחיל מחדש רק כשההודעה משתנה
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message])

  return (
    <div className="toast-region" role="status">
      {message && (
        <p className="toast">
          <Icon name="check_circle" className="toast__icon" />
          <span>{message}</span>
        </p>
      )}
    </div>
  )
}

export default Toast
