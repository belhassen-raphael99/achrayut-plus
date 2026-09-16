import { Link } from 'react-router'
import Icon from '../Icon/Icon.jsx'
import './IconButton.css'

/**
 * כפתור אייקון בלבד, 44px, עם שם נגיש חובה (DESIGN.md §7.1).
 * to → קישור. dot → נקודה קטנה (למשל התראה שלא נקראה); המשמעות צריכה להופיע גם ב־label.
 */
function IconButton({ icon, label, to, dot = false, flipInRtl = false, className, ...rest }) {
  const classes = ['icon-button', className].filter(Boolean).join(' ')
  const content = (
    <>
      <Icon name={icon} flipInRtl={flipInRtl} />
      {dot && <span className="icon-button__dot" aria-hidden="true" />}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} aria-label={label} {...rest}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" className={classes} aria-label={label} {...rest}>
      {content}
    </button>
  )
}

export default IconButton
