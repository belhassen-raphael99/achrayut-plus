import { Outlet, useLocation, useNavigate } from 'react-router'
import Logo from '../../ui/Logo/Logo.jsx'
import Icon from '../../ui/Icon/Icon.jsx'
import WarrantyLabel from '../../ui/WarrantyLabel/WarrantyLabel.jsx'
import ScrollManager from '../ScrollManager/ScrollManager.jsx'
import { hero, sampleAppliance } from '../../../data/site.js'
import useRevealOnScroll from '../../../utils/useRevealOnScroll.js'
import './AuthLayout.css'

/**
 * שלד עמודי ההתחברות (DESIGN.md §7.17).
 * מובייל: פס כחול לילה עם חץ חזרה ולוגו, והכרטיס חופף אותו. מחשב (A20): מסך מפוצל.
 */
function AuthLayout() {
  useRevealOnScroll()

  const navigate = useNavigate()
  const location = useLocation()

  // אם נכנסו ישר לעמוד (אין היסטוריה באתר), «חזרה» מובילה לדף הבית
  const goBack = () => (location.key === 'default' ? navigate('/') : navigate(-1))

  return (
    <div className="auth-layout">
      <a className="skip-link" href="#content">
        דילוג לתוכן
      </a>
      <ScrollManager />

      <div className="auth-layout__column">
        <header className="auth-layout__band surface-dark">
          <button type="button" className="auth-layout__back" onClick={goBack} aria-label="חזרה">
            <Icon name="arrow_back" flipInRtl />
          </button>
          <Logo inverse />
        </header>
        <main id="content" className="auth-layout__main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      <aside className="auth-layout__aside surface-dark" aria-label="על אחריות+">
        <Logo inverse />
        <div className="auth-layout__showcase">
          <WarrantyLabel
            brand={sampleAppliance.brand}
            purchaseDate={sampleAppliance.purchaseDate}
            stage="soon"
            value={sampleAppliance.daysLeft}
            unit="ימים"
            summary={`דוגמה: האחריות על ${sampleAppliance.name} מסתיימת בעוד ${sampleAppliance.daysLeft} ימים.`}
          />
          <p className="auth-layout__tagline">{hero.title}</p>
        </div>
      </aside>
    </div>
  )
}

export default AuthLayout
