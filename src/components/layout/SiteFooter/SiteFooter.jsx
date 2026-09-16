import { Link } from 'react-router'
import Logo from '../../ui/Logo/Logo.jsx'
import Container from '../Container/Container.jsx'
import { footerLinks } from '../../../data/site.js'
import './SiteFooter.css'

/** הכותרת התחתונה. «ביטול מנוי» חייב להיות גלוי בדף הבית (סעיף 14ט לחוק הגנת הצרכן) */
function SiteFooter() {
  return (
    <footer className="site-footer">
      <Container className="site-footer__inner">
        <Logo inverse />
        <nav aria-label="קישורים באתר">
          <ul className="site-footer__links">
            {footerLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="site-footer__link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="site-footer__copy">
          © 2026 <bdi>אחריות+</bdi>
        </p>
      </Container>
    </footer>
  )
}

export default SiteFooter
