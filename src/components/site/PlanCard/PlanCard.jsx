import Button from '../../ui/Button/Button.jsx'
import Chip from '../../ui/Chip/Chip.jsx'
import { Check } from '@phosphor-icons/react'
import { formatPrice } from '../../../utils/format.js'
import './PlanCard.css'

/** כרטיס תוכנית בעמוד התמחור (S4, PRD §6). billing: monthly · annual */
function PlanCard({ plan, billing, ...rest }) {
  const isFree = plan.monthly === 0
  const isAnnual = billing === 'annual'
  const price = isAnnual ? plan.annual : plan.monthly
  const otherPrice = isAnnual ? plan.monthly : plan.annual
  const titleId = `plan-${plan.id}-title`

  return (
    <article
      className={['plan-card', plan.featured && 'plan-card--featured'].filter(Boolean).join(' ')}
      aria-labelledby={titleId}
      {...rest}
    >
      <div className="plan-card__head">
        <h2 id={titleId} className="plan-card__name site-display">
          {plan.name}
        </h2>
        {plan.chip && <Chip tone="soon">{plan.chip}</Chip>}
      </div>

      <p className="plan-card__price">
        <span className="plan-card__amount">{formatPrice(price)}</span>
        {!isFree && <span className="plan-card__period">{isAnnual ? 'לשנה' : 'לחודש'}</span>}
      </p>
      {!isFree && (
        <p className="plan-card__alt">
          או {formatPrice(otherPrice)} {isAnnual ? 'לחודש' : 'לשנה'}
        </p>
      )}

      <ul className="plan-card__features">
        {plan.features.map((feature) => (
          <li key={feature} className="plan-card__feature">
            <Check weight="duotone" className="plan-card__check" aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={plan.featured ? 'accent' : 'secondary'}
        to="/signup"
        fullWidth
        aria-label={plan.ctaLabel}
      >
        {plan.cta}
      </Button>
    </article>
  )
}

export default PlanCard
