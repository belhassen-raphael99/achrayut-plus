import Sheet from '../../ui/Sheet/Sheet.jsx'
import ActionRow from '../../ui/ActionRow/ActionRow.jsx'
import { useAppData } from '../../../data/useAppData.js'
import { SPACE_TYPES, findById } from '../../../data/lists.js'
import { applianceCountLabel } from '../../../utils/text.js'
import './SpaceSwitcherSheet.css'

/** «המרחבים שלי» (O6, FR-1.8): החלפת המרחב הפעיל, יצירת מרחב נוסף או הצטרפות עם קוד */
function SpaceSwitcherSheet({ open, onClose }) {
  const { spaces, activeSpace, switchSpace } = useAppData()

  function choose(spaceId) {
    switchSpace(spaceId)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="המרחבים שלי">
      <ul className="space-switcher__list">
        {spaces.map((space) => {
          const type = findById(SPACE_TYPES, space.type)
          const details = [
            type?.label,
            applianceCountLabel(space.applianceCount),
            space.role === 'viewer' && 'צפייה בלבד',
          ]
            .filter(Boolean)
            .join(' · ')

          return (
            <li key={space.id}>
              <ActionRow
                icon={type?.icon}
                title={space.name}
                description={details}
                trailing="check"
                selected={space.id === activeSpace?.id}
                onClick={() => choose(space.id)}
              />
            </li>
          )
        })}
      </ul>

      <ul className="space-switcher__list space-switcher__list--actions">
        <li>
          <ActionRow to="/onboarding/create" icon="add" iconTone="accent" title="יצירת מרחב נוסף" onClick={onClose} />
        </li>
        <li>
          <ActionRow to="/onboarding/join" icon="key" title="הצטרפות עם קוד" onClick={onClose} />
        </li>
      </ul>
    </Sheet>
  )
}

export default SpaceSwitcherSheet
