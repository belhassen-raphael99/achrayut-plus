import Sheet from '../../ui/Sheet/Sheet.jsx'
import Chip from '../../ui/Chip/Chip.jsx'
import ActionRow from '../../ui/ActionRow/ActionRow.jsx'
import { ROLES, findById } from '../../../data/lists.js'
import './ManageMemberSheet.css'

/**
 * ניהול חבר (M3, FR-1.7): שינוי הרשאה והסרה. כל פעולה פותחת חלון אישור בעמוד.
 * viewerOnly (תוכנית חינם): אין מעבר לגישה מלאה.
 */
function ManageMemberSheet({ open, onClose, name, role, viewerOnly, onChangeRole, onRemove }) {
  const nextRole = role === 'full' ? 'viewer' : 'full'
  const canChangeRole = !(viewerOnly && nextRole === 'full')

  return (
    <Sheet open={open} onClose={onClose} title={name}>
      <div className="manage-member-sheet">
        <Chip tone="role">{findById(ROLES, role)?.label}</Chip>
        <ul className="manage-member-sheet__list">
          {canChangeRole && (
            <li>
              <ActionRow
                icon={nextRole === 'full' ? 'edit' : 'visibility'}
                title={nextRole === 'full' ? 'מעבר לגישה מלאה' : 'מעבר לצפייה בלבד'}
                trailing={null}
                onClick={() => onChangeRole(nextRole)}
              />
            </li>
          )}
          <li>
            <ActionRow
              icon="delete"
              title="הסרה מהמרחב"
              trailing={null}
              className="action-row--danger"
              onClick={onRemove}
            />
          </li>
        </ul>
        {!canChangeRole && <p className="manage-member-sheet__hint">בתוכנית חינם, חברים מוזמנים הם בצפייה בלבד.</p>}
      </div>
    </Sheet>
  )
}

export default ManageMemberSheet
