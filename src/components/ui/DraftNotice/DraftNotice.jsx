import Icon from '../Icon/Icon.jsx'
import './DraftNotice.css'

/** סימון גלוי לטקסט שעוד לא נבדק (החלטת רפאל, 15/09/2026: טיוטות לבדיקה משפטית) */
function DraftNotice({ children = 'טיוטה: הטקסט עוד לא נבדק משפטית.' }) {
  return (
    <p className="draft-notice" role="note">
      <Icon name="info" size="sm" />
      <span>{children}</span>
    </p>
  )
}

export default DraftNotice
