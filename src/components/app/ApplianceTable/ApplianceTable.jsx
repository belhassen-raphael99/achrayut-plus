import { Link } from 'react-router'
import Chip from '../../ui/Chip/Chip.jsx'
import CategoryIcon from '../CategoryIcon/CategoryIcon.jsx'
import WarrantyStatus from '../WarrantyStatus/WarrantyStatus.jsx'
import { DATE_SOURCES, ROOMS, findById } from '../../../data/lists.js'
import { dateSource } from '../../../utils/applianceList.js'
import { formatDate } from '../../../utils/format.js'
import './ApplianceTable.css'

/**
 * טבלת המכשירים מ־1024px (W2, FR-4.8, DESIGN.md §7.6):
 * מכשיר · חדר · מותג · סטטוס · סיום האחריות · מקור. קווי הפרדה בלבד.
 */
function ApplianceTable({ items }) {
  return (
    // כשהטבלה רחבה מהמסגרת היא נגללת בתוכה; האזור מקבל פוקוס כדי שאפשר יהיה לגלול במקלדת (WCAG 2.1.1)
    <div className="appliance-table" role="region" aria-label="טבלת המכשירים" tabIndex={0}>
      <table className="appliance-table__table">
        <caption className="visually-hidden">המכשירים במרחב</caption>
        <thead>
          <tr>
            <th scope="col">מכשיר</th>
            <th scope="col">חדר</th>
            <th scope="col">מותג</th>
            <th scope="col">סטטוס</th>
            <th scope="col">סיום האחריות</th>
            <th scope="col">מקור</th>
          </tr>
        </thead>
        <tbody>
          {items.map(({ appliance, status }) => {
            const source = dateSource(appliance)
            return (
              <tr key={appliance.id}>
                <td>
                  <Link to={`/appliances/${appliance.id}`} className="appliance-table__name">
                    <CategoryIcon category={appliance.category} />
                    <bdi>{appliance.name}</bdi>
                  </Link>
                </td>
                <td>{findById(ROOMS, appliance.room)?.label}</td>
                <td>
                  <bdi>{appliance.brand || '—'}</bdi>
                </td>
                <td>
                  <WarrantyStatus status={status} />
                </td>
                <td>{status.end ? formatDate(status.end) : '—'}</td>
                <td>
                  {status.stage === 'unknown' ? (
                    '—'
                  ) : source === 'estimated' ? (
                    <Chip tone="verify">{findById(DATE_SOURCES, source).label}</Chip>
                  ) : (
                    findById(DATE_SOURCES, source)?.label
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ApplianceTable
