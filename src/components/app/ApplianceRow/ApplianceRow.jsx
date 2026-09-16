import { Link } from 'react-router'
import Icon from '../../ui/Icon/Icon.jsx'
import CategoryIcon from '../CategoryIcon/CategoryIcon.jsx'
import WarrantyStatus from '../WarrantyStatus/WarrantyStatus.jsx'
import './ApplianceRow.css'

/**
 * שורת מכשיר (DESIGN.md §7.5): אייקון קטגוריה, שם, סטטוס ו־chevron. כל השורה לחיצה.
 * place: שם הנכס, כשיש כמה נכסים ומוצגים «כל הנכסים» (FR-7.3)
 */
function ApplianceRow({ appliance, status, place }) {
  return (
    <Link to={`/appliances/${appliance.id}`} className="appliance-row">
      <CategoryIcon category={appliance.category} />
      <span className="appliance-row__text">
        <bdi className="appliance-row__name">{appliance.name}</bdi>
        {place && <bdi className="appliance-row__place">{place}</bdi>}
        <WarrantyStatus status={status} />
      </span>
      <Icon name="chevron_right" size="sm" flipInRtl className="appliance-row__chevron" />
    </Link>
  )
}

export default ApplianceRow
