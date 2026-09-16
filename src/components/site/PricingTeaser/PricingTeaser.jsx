import TextLink from '../../ui/TextLink/TextLink.jsx'
import { pricingTeaser } from '../../../data/site.js'
import './PricingTeaser.css'

/** «מתחילים בחינם»: הפניה לעמוד התמחור. במחשב יושב ליד השאלות הנפוצות (HomePage) */
function PricingTeaser() {
  return (
    <section className="pricing-teaser" aria-labelledby="pricing-teaser-title" data-reveal="lift">
      <h2 id="pricing-teaser-title" className="pricing-teaser__title">
        {pricingTeaser.title}
      </h2>
      <p className="pricing-teaser__text">{pricingTeaser.text}</p>
      <TextLink to="/pricing" className="pricing-teaser__link">
        {pricingTeaser.link}
      </TextLink>
    </section>
  )
}

export default PricingTeaser
