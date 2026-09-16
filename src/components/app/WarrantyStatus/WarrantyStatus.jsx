import './WarrantyStatus.css'

/**
 * נקודת צבע וטקסט הסטטוס («עוד 24 ימים», DESIGN.md §7.5).
 * הנקודה דקורטיבית; הטקסט נושא את המשמעות (סטטוס לעולם לא בצבע בלבד).
 */
function WarrantyStatus({ status }) {
  return (
    <span className={`warranty-status warranty-status--${status.stage}`}>
      <span className="warranty-status__dot" aria-hidden="true" />
      {status.text}
    </span>
  )
}

export default WarrantyStatus
