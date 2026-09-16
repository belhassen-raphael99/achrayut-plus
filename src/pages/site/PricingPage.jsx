import { useState } from 'react'
import PageIntro from '../../components/site/PageIntro/PageIntro.jsx'
import PlanCard from '../../components/site/PlanCard/PlanCard.jsx'
import PlanComparison from '../../components/site/PlanComparison/PlanComparison.jsx'
import SegmentedChoice from '../../components/ui/SegmentedChoice/SegmentedChoice.jsx'
import Disclosure from '../../components/ui/Disclosure/Disclosure.jsx'
import Icon from '../../components/ui/Icon/Icon.jsx'
import Container from '../../components/layout/Container/Container.jsx'
import { billingOptions, plans, pricingFaq } from '../../data/site.js'
import { photos } from '../../data/photos.js'
import './SitePages.css'

/** עמוד התמחור (S4). ברירת מחדל: חיוב שנתי */
function PricingPage() {
  const [billing, setBilling] = useState('annual')

  return (
    <>
      <title>תמחור · אחריות+</title>
      <PageIntro
        title="מתחילים בחינם, משדרגים כשצריך"
        tone="dark"
        photo={photos.pricingRoom}
        align="center"
      >
        <SegmentedChoice
          legend="תקופת חיוב"
          name="billing"
          options={billingOptions}
          value={billing}
          onChange={setBilling}
          inverse
        />
      </PageIntro>

      <Container className="pricing-page">
        <div className="pricing-page__plans">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              billing={billing}
              data-reveal="lift"
              style={{ '--reveal-index': index }}
            />
          ))}
        </div>

        <section aria-labelledby="compare-title">
          <h2 id="compare-title" className="pricing-page__heading" data-reveal="soft">
            השוואת התוכניות
          </h2>
          <PlanComparison titleId="compare-title" />
          <p className="pricing-page__cancel">
            <Icon name="check_circle" size="sm" className="pricing-page__cancel-icon" />
            <span>אפשר לבטל בכל רגע, בלחיצה אחת.</span>
          </p>
        </section>

        <Container as="section" width="reading" className="pricing-page__faq" aria-labelledby="pricing-faq-title">
          <h2 id="pricing-faq-title" className="pricing-page__heading" data-reveal="soft">
            שאלות על התשלום
          </h2>
          {pricingFaq.map((item) => (
            <Disclosure key={item.id} title={item.question}>
              {item.answer}
            </Disclosure>
          ))}
        </Container>
      </Container>
    </>
  )
}

export default PricingPage
