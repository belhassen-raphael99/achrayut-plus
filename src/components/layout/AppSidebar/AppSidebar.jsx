import { NavLink } from 'react-router'
import Logo from '../../ui/Logo/Logo.jsx'
import Chip from '../../ui/Chip/Chip.jsx'
import Icon from '../../ui/Icon/Icon.jsx'
import SpaceChip from '../../app/SpaceChip/SpaceChip.jsx'
import AddInvoiceButton from '../../app/AddInvoiceButton/AddInvoiceButton.jsx'
import { useAppData } from '../../../data/useAppData.js'
import { appNavItems } from '../../../data/navigation.js'
import './AppSidebar.css'

/**
 * סרגל הצד מ־1024px (W1, DESIGN.md §7.10): לוגו, בורר המרחב, הניווט, ו«צילום חשבונית» בתחתית.
 * בצפייה בלבד «צילום חשבונית» לא מוצג (FR-1.6).
 */
function AppSidebar({ onOpenSwitcher, switcherOpen, onAdd, offline, showAddAction = true }) {
  const { activeSpace, isViewer, unreadCount } = useAppData()

  return (
    <aside className="app-sidebar" aria-label="תפריט האפליקציה">
      <Logo />
      <div className="app-sidebar__space">
        <SpaceChip name={activeSpace.name} onClick={onOpenSwitcher} expanded={switcherOpen} />
        {isViewer && <Chip tone="role">צפייה בלבד</Chip>}
      </div>

      <nav aria-label="ניווט ראשי">
        <ul className="app-sidebar__nav">
          {appNavItems.map((item) => {
            const showDot = unreadCount > 0 && item.to === '/notifications'
            return (
              <li key={item.to}>
                <NavLink to={item.to} className="app-sidebar__link" viewTransition>
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                  {showDot && (
                    <>
                      <span className="app-sidebar__dot" aria-hidden="true" />
                      <span className="visually-hidden">, יש התראות שלא נקראו</span>
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {!isViewer && showAddAction && (
        <AddInvoiceButton offline={offline} onClick={onAdd} className="app-sidebar__action" />
      )}
    </aside>
  )
}

export default AppSidebar
