import { Outlet } from 'react-router'
import ScrollManager from '../ScrollManager/ScrollManager.jsx'
import useRevealOnScroll from '../../../utils/useRevealOnScroll.js'
import './OnboardingLayout.css'

/** שלד הכניסה הראשונה (O1–O5): בלי ניווט, כדי שהדבר היחיד במסך יהיה הצעד הבא */
function OnboardingLayout() {
  useRevealOnScroll()

  return (
    <div className="onboarding-layout">
      <a className="skip-link" href="#content">
        דילוג לתוכן
      </a>
      <ScrollManager />
      <main id="content" className="onboarding-layout__main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}

export default OnboardingLayout
