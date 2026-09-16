import ApplianceList from '../ApplianceList/ApplianceList.jsx'
import ApplianceTable from '../ApplianceTable/ApplianceTable.jsx'
import { groupByPlace, groupByRoom } from '../../../utils/applianceList.js'
import { applianceCountLabel } from '../../../utils/text.js'
import './ApplianceGroups.css'

/**
 * המכשירים לפי חדר (L1, FR-4.5): בטלפון שורות תחת כותרת החדר, ומ־1024px טבלה (W2) באותו סדר.
 * properties: כשמוצגים «כל הנכסים» ויש כמה נכסים — קבוצות «נכס · חדר» ועמודת «נכס» בטבלה (FR-7.4).
 * items: [{ appliance, status }]
 */
function ApplianceGroups({ items, properties }) {
  const groups = properties
    ? groupByPlace(items, properties)
    : groupByRoom(items).map((group) => ({ ...group, id: group.room.id, title: group.room.label }))

  return (
    <>
      <div className="appliance-groups">
        {groups.map((group) => (
          <section key={group.id} className="appliance-groups__group" aria-labelledby={`group-${group.id}`}>
            <h2 id={`group-${group.id}`} className="appliance-groups__title">
              <bdi>{group.title}</bdi>
              <span className="appliance-groups__count">{applianceCountLabel(group.items.length)}</span>
            </h2>
            <ApplianceList items={group.items} />
          </section>
        ))}
      </div>
      <ApplianceTable
        items={groups.flatMap((group) => group.items.map((item) => ({ ...item, place: group.property?.name })))}
        showPlace={Boolean(properties)}
      />
    </>
  )
}

export default ApplianceGroups
