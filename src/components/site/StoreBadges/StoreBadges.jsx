import Icon from '../../ui/Icon/Icon.jsx'
import { stores } from '../../../data/site.js'
import './StoreBadges.css'

/**
 * «בקרוב גם באפליקציה» (בקשת רפאל, 16/09/2026).
 * תגיות הודעה, לא קישורים: האפליקציה עוד לא בחנויות, ולכן אין לאן להוביל.
 * aria-disabled לא מתאים כאן כי אלה לא פקדים — זה טקסט עם אייקון.
 */
function StoreBadges({ className, ...rest }) {
  return (
    <div className={['store-badges', className].filter(Boolean).join(' ')} {...rest}>
      <p className="store-badges__title">{stores.title}</p>
      <ul className="store-badges__list">
        {stores.items.map((item, index) => (
          <li key={item.id} className="store-badges__item" style={{ '--reveal-index': index }}>
            <Icon name={item.icon} className="store-badges__icon" />
            <span className="store-badges__text">
              <span className="store-badges__soon">בקרוב ב־</span>
              <span className="store-badges__name" dir="ltr">
                {item.label}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className="store-badges__note">{stores.note}</p>
    </div>
  )
}

export default StoreBadges
