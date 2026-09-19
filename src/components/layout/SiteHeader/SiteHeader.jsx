import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router'
import Logo from '../../ui/Logo/Logo.jsx'
import Button from '../../ui/Button/Button.jsx'
import { CaretRight, Headset, List, PlayCircle, Question, Tag } from '@phosphor-icons/react'
import Sheet from '../../ui/Sheet/Sheet.jsx'
import Container from '../Container/Container.jsx'
import { menuLinks, navLinks } from '../../../data/site.js'
import './SiteHeader.css'

/**
 * כותרת האתר הציבורי (S1, S2): פס מרחף שמתכווץ בגלילה.
 * מד הגלילה למעלה, קישורים במחשב, תפריט בגיליון תחתון במובייל (S3).
 * בלי אווטר ובלי ניווט האפליקציה (PRD §12).
 * אייקונים: Phosphor duotone בכל האתר הציבורי (DESIGN.md §14.7).
 */
// שמות האייקונים ב־site.js נשארו בשמות של Material; כאן הם ממופים ל־Phosphor
const MENU_ICONS = { play_circle: PlayCircle, sell: Tag, help: Question, support_agent: Headset }

// הפס נסוג רק אחרי שעברנו את הפתיחה, וזז רק מתנועה אמיתית של המשתמש
const TUCK_AFTER = 400
const TUCK_DELTA = 4

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [stuck, setStuck] = useState(false)
  const [tucked, setTucked] = useState(false)
  const sentinelRef = useRef(null)
  const headerRef = useRef(null)
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

  /*
   * הפס נסוג בגלילה למטה וחוזר בגלילה למעלה (כמו ב־rmnetsec-it.com, בקשת רפאל 18/09).
   * מאזין אחד, passive, מווסת ב־requestAnimationFrame: לא מחשבים כלום בתוך הגלילה עצמה.
   * בהפחתת תנועה הפס פשוט נשאר.
   */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let last = window.scrollY
    let frame = 0

    const measure = () => {
      frame = 0
      const y = window.scrollY
      if (y > TUCK_AFTER && y > last + TUCK_DELTA) setTucked(true)
      else if (y < last - TUCK_DELTA || y <= TUCK_AFTER) setTucked(false)
      last = y
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])



  return (
    <>
      <span className="scroll-progress" aria-hidden="true" />
      <span ref={sentinelRef} className="site-header__sentinel" aria-hidden="true" />

      <header
        ref={headerRef}
        className={['site-header', stuck && 'is-stuck', tucked && !menuOpen && 'is-tucked'].filter(Boolean).join(' ')}
        onFocus={() => setTucked(false)}
      >
        <Container>
          <div className="site-header__bar surface-dark site-glass">
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
                <List weight="duotone" className="site-icon" aria-hidden="true" />
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
                  <MenuIcon name={link.icon} />
                  <span className="site-menu__label">{link.label}</span>
                  <CaretRight
                    weight="duotone"
                    className="site-icon site-icon--sm icon-flip-rtl site-menu__chevron"
                    aria-hidden="true"
                  />
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

function MenuIcon({ name }) {
  const Component = MENU_ICONS[name]
  return Component ? <Component weight="duotone" className="site-icon" aria-hidden="true" /> : null
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
