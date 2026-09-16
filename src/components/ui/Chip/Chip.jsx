import './Chip.css'

/**
 * תגית (DESIGN.md §7.2).
 * tone: protected · soon · expired · unknown · verify (לבדוק / משוער) · role (הרשאה)
 */
function Chip({ tone = 'verify', children }) {
  return <span className={`chip chip--${tone}`}>{children}</span>
}

export default Chip
