import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router'
import Logo from '../../ui/Logo/Logo.jsx'
import Button from '../../ui/Button/Button.jsx'
import Icon from '../../ui/Icon/Icon.jsx'
import Sheet from '../../ui/Sheet/Sheet.jsx'
import Container from '../Container/Container.jsx'
import { menuLinks, navLinks } from '../../../data/site.js'
import './SiteHeader.css'

/**
 * כותרת האתר הציבורי (S1, S2): פס מרחף שמתכווץ בגלילה.
 * מד הגלילה למעלה, קישורים במחשב, תפריט בגיליון תחתון במובייל (S3).
 * בלי אווטר ובלי ניווט האפליקציה (PRD §12).
 */
function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [stuck, setStuck] = useState(false)
  const sentinelRef = useRef(null)
  const closeMenu = () => setMenuOpen(false)

  // חיישן בראש העמוד במקום מאזין scroll, שרץ בכל פריים
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), {
      threshold: 1,
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <span className="scroll-progress" aria-hidden="true" />
      <span ref={sentinelRef} className="site-header__sentinel" aria-hidden="true" />

      <header className={['site-header', stuck && 'is-stuck'].filter(Boolean).join(' ')}>
        <Container>
          <div className="site-header__bar surface-dark">
            <Logo inverse />

            <nav className="site-header__nav" aria-label="ניווט ראשי">
              <ul className="site-header__links">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <SiteLink link={link} className="site-header__link" />
                  </li>
                ))}
              </ul>
            </nav>

            <div className="site-header__actions">
              <Button variant="secondary-inverse" to="/login" className="site-header__button">
                התחברות
              </Button>
              <Button
                variant="accent"
                to="/signup"
                className="site-header__button site-header__signup"
              >
                הרשמה חינם
              </Button>
              <button
                type="button"
                className="site-header__menu-button is-tactile"
                aria-label="תפריט"
                aria-haspopup="dialog"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
              >
                <Icon name="menu" />
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* מחוץ ל־header, כדי שהגיליון הלבן לא יירש את הצבעים של המשטח הכהה */}
      <Sheet open={menuOpen} onClose={closeMenu} title="תפריט">
        <nav aria-label="תפריט האתר">
          <ul className="site-menu">
            {menuLinks.map((link, index) => (
              <li key={link.to} style={{ '--reveal-index': index }}>
                <SiteLink link={link} className="site-menu__link" onClick={closeMenu}>
                  <Icon name={link.icon} />
                  <span className="site-menu__label">{link.label}</span>
                  <Icon name="chevron_right" size="sm" flipInRtl className="site-menu__chevron" />
                </SiteLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site-menu__actions">
          <Button variant="accent" to="/signup" fullWidth onClick={closeMenu}>
            הרשמה חינם
          </Button>
          <Button variant="secondary" to="/login" fullWidth onClick={closeMenu}>
            התחברות
          </Button>
        </div>
      </Sheet>
    </>
  )
}

/** קישור לעמוד מסמן את העמוד הנוכחי (aria-current); קישור לעוגן (#) לא */
function SiteLink({ link, className, onClick, children }) {
  const Component = link.to.includes('#') ? Link : NavLink

  return (
    <Component to={link.to} className={className} onClick={onClick} viewTransition>
      {children ?? link.label}
    </Component>
  )
}

export default SiteHeader
