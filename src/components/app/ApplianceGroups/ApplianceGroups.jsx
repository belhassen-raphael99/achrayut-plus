import ApplianceList from '../ApplianceList/ApplianceList.jsx'
import ApplianceTable from '../ApplianceTable/ApplianceTable.jsx'
import { groupByRoom } from '../../../utils/applianceList.js'
import { applianceCountLabel } from '../../../utils/text.js'
import './ApplianceGroups.css'

/**
 * המכשירים לפי חדר (L1, FR-4.5): בטלפון שורות תחת כותרת החדר, ומ־1024px טבלה (W2) באותו סדר.
 * items: [{ appliance, status }]
 */
function ApplianceGroups({ items }) {
  const groups = groupByRoom(items)

  return (
    <>
      <div className="appliance-groups">
        {groups.map(({ room, items: roomItems }) => (
          <section key={room.id} className="appliance-groups__group" aria-labelledby={`room-${room.id}`}>
            <h2 id={`room-${room.id}`} className="appliance-groups__title">
              {room.label}
              <span className="appliance-groups__count">{applianceCountLabel(roomItems.length)}</span>
            </h2>
            <ApplianceList items={roomItems} />
          </section>
        ))}
      </div>
      <ApplianceTable items={groups.flatMap((group) => group.items)} />
    </>
  )
}

export default ApplianceGroups
