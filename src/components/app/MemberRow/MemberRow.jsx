import Avatar from '../../ui/Avatar/Avatar.jsx'
import Chip from '../../ui/Chip/Chip.jsx'
import IconButton from '../../ui/IconButton/IconButton.jsx'
import './MemberRow.css'

/**
 * חבר במרחב או הזמנה ממתינה (M1, DESIGN.md §7.13): אווטר, שם, תגית הרשאה ופרט משני.
 * onManage (גישה מלאה, לא על עצמכם ולא על יוצר המרחב) → כפתור «עוד».
 */
function MemberRow({ name, detail, roleLabel, avatarName, onManage }) {
  return (
    <div className="member-row">
      <Avatar name={avatarName ?? name} />
      <div className="member-row__text">
        <p className="member-row__name">
          <bdi>{name}</bdi>
          {roleLabel && <Chip tone="role">{roleLabel}</Chip>}
        </p>
        {detail && <p className="member-row__detail">{detail}</p>}
      </div>
      {onManage && (
        <IconButton icon="more_vert" label={`אפשרויות עבור ${name}`} aria-haspopup="dialog" onClick={onManage} />
      )}
    </div>
  )
}

export default MemberRow
