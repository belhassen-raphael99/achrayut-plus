import Chip from '../../ui/Chip/Chip.jsx'
import Icon from '../../ui/Icon/Icon.jsx'
import { formatPrice } from '../../../utils/format.js'
import './PlanOption.css'

/**
 * תוכנית במסך «שינוי תוכנית» (P10, FR-6.2). offer = התוכנית מ־site.js (שם, מחירים, יתרונות).
 * current: «התוכנית שלכם», בלי כפתור. action: הכפתור של התוכנית (בחירה או ביטול המנוי).
 */
function PlanOption({ offer, billing, current = false, action }) {
  const isFree = offer.monthly === 0
  const isAnnual = billing === 'annual'
  const titleId = `plan-option-${offer.id}`

  return (
    <article
      className={['plan-option', current && 'plan-option--current'].filter(Boolean).join(' ')}
      aria-labelledby={titleId}
    >
      <div className="plan-option__head">
        <h2 id={titleId} className="plan-option__name">
          {offer.name}
        </h2>
        {current && <Chip tone="role">התוכנית שלכם</Chip>}
      </div>

      <p className="plan-option__price">
        <span className="plan-option__amount">{formatPrice(isAnnual ? offer.annual : offer.monthly)}</span>
        {!isFree && <span className="plan-option__period">{isAnnual ? 'לשנה' : 'לחודש'}</span>}
      </p>

      <ul className="plan-option__features">
        {offer.features.map((feature) => (
          <li key={feature} className="plan-option__feature">
            <Icon name="check" size="sm" className="plan-option__check" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {!current && action}
    </article>
  )
}

export default PlanOption
