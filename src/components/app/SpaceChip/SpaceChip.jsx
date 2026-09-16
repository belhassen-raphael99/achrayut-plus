import Icon from '../../ui/Icon/Icon.jsx'
import './SpaceChip.css'

/**
 * בורר המרחב: שם המרחב הפעיל ו־chevron; פותח את «המרחבים שלי» (O6, DESIGN.md §7.7).
 * inverse: על בלוק הראש הכחול.
 */
function SpaceChip({ name, onClick, expanded = false, inverse = false, className }) {
  return (
    <button
      type="button"
      className={['space-chip', inverse && 'space-chip--inverse', className].filter(Boolean).join(' ')}
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={expanded}
    >
      <span className="visually-hidden">המרחב הפעיל: </span>
      <bdi className="space-chip__name">{name}</bdi>
      <span className="visually-hidden">, החלפת מרחב</span>
      <Icon name="keyboard_arrow_down" size="sm" />
    </button>
  )
}

export default SpaceChip
