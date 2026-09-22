import { useState } from 'react'
import { Navigate, Outlet, useSearchParams } from 'react-router'
import AppSidebar from '../AppSidebar/AppSidebar.jsx'
import BottomNav from '../BottomNav/BottomNav.jsx'
import ScrollManager from '../ScrollManager/ScrollManager.jsx'
import OfflineBanner from '../../app/OfflineBanner/OfflineBanner.jsx'
import SpaceSwitcherSheet from '../../app/SpaceSwitcherSheet/SpaceSwitcherSheet.jsx'
import AddApplianceSheet from '../../app/AddApplianceSheet/AddApplianceSheet.jsx'
import { useAppData } from '../../../data/useAppData.js'
import { useOnlineStatus } from '../../../utils/useOnlineStatus.js'
import useRevealOnScroll from '../../../utils/useRevealOnScroll.js'
import './AppShell.css'

/**
 * שלד האפליקציה: פס «אין חיבור», סרגל צד מ־1024px, סרגל תחתון בטלפון (APP LAYOUT).
 * subPage: בלי סרגל תחתון (SUB-PAGE LAYOUT); במחשב סרגל הצד נשאר (W3).
 * hideAddAction: בלי «צילום חשבונית» בסרגל הצד (בתוך תהליך ההוספה עצמו).
 * העמודים מקבלים דרך useOutletContext: offline, openSpaceSwitcher, switcherOpen, openAddAppliance.
 * ?offline=1 מדמה «אין חיבור» לבדיקה (E4).
 */
function AppShell({ subPage = false, hideAddAction = false }) {
  useRevealOnScroll()

  const { spaces, unreadCount } = useAppData()
  const [searchParams] = useSearchParams()
  const online = useOnlineStatus()
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  // משתמש בלי מרחב מגיע למסך «יצירה או הצטרפות» (FR-1.4)
  if (spaces.length === 0) return <Navigate to="/onboarding" replace />

  const offline = !online || searchParams.get('offline') === '1'
  const context = {
    offline,
    switcherOpen,
    openSpaceSwitcher: () => setSwitcherOpen(true),
    openAddAppliance: () => setAddOpen(true),
  }

  return (
    <div className={['app-shell', !subPage && 'app-shell--with-nav'].filter(Boolean).join(' ')}>
      <a className="skip-link" href="#content">
        דילוג לתוכן
      </a>
      <ScrollManager />
      <OfflineBanner offline={offline} />

      <div className="app-shell__body">
        <AppSidebar
          onOpenSwitcher={context.openSpaceSwitcher}
          switcherOpen={switcherOpen}
          onAdd={context.openAddAppliance}
          offline={offline}
          showAddAction={!hideAddAction}
        />
        <main id="content" className="app-shell__main" tabIndex={-1}>
          <Outlet context={context} />
        </main>
      </div>

      {!subPage && <BottomNav unread={unreadCount > 0} />}

      <SpaceSwitcherSheet open={switcherOpen} onClose={() => setSwitcherOpen(false)} />
      <AddApplianceSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}

export default AppShell
