import { Link } from 'react-router'
import Icon from '../Icon/Icon.jsx'
import './ActionRow.css'

/**
 * שורת פעולה: אייקון באריח, כותרת, שורה משנית ו־chevron (O1, O6, N1).
 * to → קישור, אחרת כפתור. variant: flat (בתוך גיליון) · card (שורה לבנה עם מסגרת, O1).
 * selected: השורה הנבחרת, עם סימן ו־aria-current (O6). iconTone: neutral · accent (זעפרן).
 * fileInput: { accept, capture, onFile } → השורה פותחת בחירת קובץ או את המצלמה של הטלפון (N1).
 */
function ActionRow({
  to,
  fileInput,
  icon,
  iconTone = 'neutral',
  title,
  description,
  trailing = 'chevron',
  selected = false,
  variant = 'flat',
  className,
  ...rest
}) {
  const classes = ['action-row', `action-row--${variant}`, selected && 'action-row--selected', className]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {icon && (
        <span className={`action-row__icon action-row__icon--${iconTone}`}>
          <Icon name={icon} />
        </span>
      )}
      <span className="action-row__text">
        <bdi className="action-row__title">{title}</bdi>
        {description && <span className="action-row__description">{description}</span>}
      </span>
      {trailing === 'chevron' && (
        <Icon name="chevron_right" size="sm" flipInRtl className="action-row__trailing" />
      )}
      {trailing === 'check' && selected && (
        <Icon name="check" className="action-row__trailing action-row__check" />
      )}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }

  if (fileInput) {
    return (
      <label className={`${classes} action-row--file`}>
        <input
          type="file"
          className="visually-hidden action-row__file"
          accept={fileInput.accept}
          capture={fileInput.capture}
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) fileInput.onFile(file)
          }}
        />
        {content}
      </label>
    )
  }

  return (
    <button type="button" className={classes} aria-current={selected ? 'true' : undefined} {...rest}>
      {content}
    </button>
  )
}

export default ActionRow
