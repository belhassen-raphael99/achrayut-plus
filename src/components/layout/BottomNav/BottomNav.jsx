import { NavLink } from 'react-router'
import Icon from '../../ui/Icon/Icon.jsx'
import { appNavItems } from '../../../data/navigation.js'
import './BottomNav.css'

/** סרגל הניווט התחתון בטלפון (DESIGN.md §7.10): בית · מכשירים · התראות · הגדרות */
function BottomNav({ unread = false }) {
  return (
    <nav className="bottom-nav" aria-label="ניווט ראשי">
      <ul className="bottom-nav__list">
        {appNavItems
          .filter((item) => !item.desktopOnly)
          .map((item) => {
            const showDot = unread && item.to === '/notifications'
            return (
              <li key={item.to}>
                <NavLink to={item.to} className="bottom-nav__link" viewTransition>
                  <span className="bottom-nav__icon">
                    <Icon name={item.icon} />
                    {showDot && <span className="bottom-nav__dot" aria-hidden="true" />}
                  </span>
                  <span>{item.label}</span>
                  {showDot && <span className="visually-hidden">, יש התראות שלא נקראו</span>}
                </NavLink>
              </li>
            )
          })}
      </ul>
    </nav>
  )
}

export default BottomNav
