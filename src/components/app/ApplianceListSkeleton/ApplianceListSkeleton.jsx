import Skeleton from '../../ui/Skeleton/Skeleton.jsx'
import '../ApplianceList/ApplianceList.css'
import '../ApplianceRow/ApplianceRow.css'

/** שורות מכשיר בזמן טעינה (D5, L1): אותה צורה כמו השורות האמיתיות */
function ApplianceListSkeleton({ rows = 3 }) {
  return (
    <ul className="appliance-list" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="appliance-row">
          <Skeleton size="icon" />
          <span className="appliance-row__text">
            <Skeleton width="md" />
            <Skeleton width="sm" />
          </span>
        </li>
      ))}
    </ul>
  )
}

export default ApplianceListSkeleton
