import IconButton from '../../ui/IconButton/IconButton.jsx'
import { useBackNavigation } from '../../../utils/useBackNavigation.js'
import './PageHeader.css'

/**
 * כותרת מסך באפליקציה (APP LAYOUT / SUB-PAGE LAYOUT): כותרת מימין ופעולות משמאל.
 * back = הנתיב שאליו «חזרה» מובילה כשנכנסו ישר לעמוד; בלי back אין חץ חזרה.
 * בלי title: רק החץ והפעולות, והעמוד מציג את ה־h1 בעצמו (כרטיס מכשיר).
 */
function PageHeader({ title, subtitle, back, actions }) {
  const goBack = useBackNavigation(back ?? '/dashboard')

  return (
    <header className="page-header">
      {back && <IconButton icon="arrow_back" flipInRtl label="חזרה" onClick={goBack} className="page-header__back" />}
      <div className="page-header__titles">
        {title && <h1 className="page-header__title">{title}</h1>}
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  )
}

export default PageHeader
