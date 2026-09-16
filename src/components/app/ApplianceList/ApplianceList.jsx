import ApplianceRow from '../ApplianceRow/ApplianceRow.jsx'
import './ApplianceList.css'

/**
 * רשימת שורות מכשיר על משטח לבן, עם קווי הפרדה (DESIGN.md §7.5).
 * items: [{ appliance, status, place? }]. mobileLimit: כמה שורות מוצגות בטלפון; השאר מופיעות מ־1024px (FR-4.3).
 */
function ApplianceList({ items, mobileLimit, label }) {
  return (
    <ul className="appliance-list" aria-label={label}>
      {items.map(({ appliance, status, place }, index) => (
        <li
          key={appliance.id}
          className={mobileLimit !== undefined && index >= mobileLimit ? 'appliance-list__item--wide' : undefined}
        >
          <ApplianceRow appliance={appliance} status={status} place={place} />
        </li>
      ))}
    </ul>
  )
}

export default ApplianceList
