import { Outlet } from 'react-router'
import Logo from '../../ui/Logo/Logo.jsx'
import Container from '../Container/Container.jsx'
import ScrollManager from '../ScrollManager/ScrollManager.jsx'
import './SystemLayout.css'

/** דף מערכת (404 וכו'): לוגו בלבד, בלי ניווט (prompt 0 v2, SYSTEM PAGE) */
function SystemLayout() {
  return (
    <div className="system-layout">
      <ScrollManager />
      <header className="system-layout__header">
        <Container>
          <Logo />
        </Container>
      </header>
      <main id="content" className="system-layout__main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}

export default SystemLayout
