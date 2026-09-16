import Icon from '../Icon/Icon.jsx'
import './Notice.css'

const DEFAULT_ICONS = { error: 'error', info: 'info', warning: 'schedule' }

/**
 * הודעה בתוך טופס או כרטיס (A2, A4, A5, A6).
 * tone: error (אדום, מוכרז מיד) · info (דיו, לא אדום) · warning (זעפרן בהיר)
 */
function Notice({ tone = 'info', icon, title, children, action }) {
  return (
    <div className={`notice notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={icon ?? DEFAULT_ICONS[tone]} className="notice__icon" />
      <div className="notice__content">
        {title && <p className="notice__title">{title}</p>}
        <div>{children}</div>
        {action && <div className="notice__action">{action}</div>}
      </div>
    </div>
  )
}

export default Notice
