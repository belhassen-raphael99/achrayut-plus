import { Link } from 'react-router'
import Icon from '../../ui/Icon/Icon.jsx'
import { relativeDayLabel } from '../../../utils/relativeDay.js'
import './NotificationRow.css'

const TONE_ICONS = { soon: 'schedule', member: 'group', added: 'check_circle', error: 'error', inbox: 'forward_to_inbox' }

/**
 * התראה (T1, DESIGN.md §7.13): אייקון, טקסט וזמן. לא נקראה → רקע כחול בהיר ו«לא נקראה» לקורא המסך.
 * לחיצה מסמנת כנקראה ופותחת את היעד — הכרטיס או חברי המרחב (FR-5.6).
 */
function NotificationRow({ notification, onOpen }) {
  const tone = TONE_ICONS[notification.tone] ? notification.tone : 'member'

  return (
    <Link
      to={notification.target}
      onClick={() => onOpen(notification.id)}
      className={['notification-row', !notification.read && 'notification-row--unread'].filter(Boolean).join(' ')}
    >
      <span className={`notification-row__icon notification-row__icon--${tone}`} aria-hidden="true">
        <Icon name={TONE_ICONS[tone]} />
      </span>
      <span className="notification-row__text">
        <span className="notification-row__message">
          {!notification.read && <span className="visually-hidden">לא נקראה: </span>}
          <bdi>{notification.text}</bdi>
        </span>
        <span className="notification-row__time">{relativeDayLabel(notification.createdAt)}</span>
      </span>
    </Link>
  )
}

export default NotificationRow
