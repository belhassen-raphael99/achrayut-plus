import { Link } from 'react-router'
import Icon from '../Icon/Icon.jsx'
import './TextLink.css'

/** קישור טקסט עם חץ «קדימה» אופציונלי (מצביע שמאלה ב־RTL) */
function TextLink({ to, children, arrow = true, className }) {
  return (
    <Link to={to} className={['text-link', className].filter(Boolean).join(' ')}>
      <span>{children}</span>
      {arrow && <Icon name="arrow_forward" size="sm" flipInRtl />}
    </Link>
  )
}

export default TextLink
