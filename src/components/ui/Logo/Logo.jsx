import { Link } from 'react-router'
import './Logo.css'

/** לוגו זמני (DESIGN.md §9): השם «אחריות+» וריבוע זעפרן. השם עטוף ב־<bdi> בגלל ה־«+» */
function Logo({ inverse = false }) {
  return (
    <Link to="/" className={['logo', inverse && 'logo--inverse'].filter(Boolean).join(' ')}>
      <span className="logo__mark" aria-hidden="true" />
      <bdi className="logo__name">אחריות+</bdi>
      <span className="visually-hidden">, לדף הבית</span>
    </Link>
  )
}

export default Logo
