import { Outlet } from 'react-router'
import SiteHeader from '../SiteHeader/SiteHeader.jsx'
import SiteFooter from '../SiteFooter/SiteFooter.jsx'
import ScrollManager from '../ScrollManager/ScrollManager.jsx'
import useRevealOnScroll from '../../../utils/useRevealOnScroll.js'
import './SiteLayout.css'

/** שלד האתר הציבורי: דילוג לתוכן, כותרת, תוכן העמוד, כותרת תחתונה */
function SiteLayout() {
  useRevealOnScroll()

  return (
    <div className="site-layout">
      <a className="skip-link" href="#content">
        דילוג לתוכן
      </a>
      <ScrollManager />
      <SiteHeader />
      <main id="content" className="site-layout__main" tabIndex={-1}>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}

export default SiteLayout
