import { useRef } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from '@phosphor-icons/react'
import Photo from '../../ui/Photo/Photo.jsx'
import Button from '../../ui/Button/Button.jsx'
import WarrantyLabel from '../../ui/WarrantyLabel/WarrantyLabel.jsx'
import SiteFaq from '../SiteFaq/SiteFaq.jsx'
import { photos } from '../../../data/photos.js'
import {
  closing,
  faqItems,
  hero,
  homeFaqIds,
  pricingTeaser,
  story,
} from '../../../data/site.js'
import { EASE, cssSeconds, gsap, safely, useGSAP } from '../../../utils/siteMotion.js'
import './StoryOffer.css'

/**
 * פרק 7 · הקריאה לפעולה (STORYBOARD.md, DESIGN.md §14.8.4). שקט: ברגע ההחלטה אין תנועה.
 * הדבר היחיד שזז: החץ של התו מתייצב על «מוגנת» פעם אחת, כשהתו נכנס למסך.
 * ההצעה מונחת בסלון של הבוקר (18/09): הצילום שהיה פס ריק בין הפרקים הפך לרקע שלה.
 */
function StoryOffer() {
  const sectionRef = useRef(null)
  const questions = homeFaqIds.map((id) => faqItems.find((item) => item.id === id)).filter(Boolean)

  useGSAP(
    () => {
      const section = sectionRef.current
      const rows = section.querySelectorAll('.warranty-label__row')
      const arrow = section.querySelector('.warranty-label__arrow')
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        safely(section, () => {
          gsap.from(arrow, {
            y: () => rows[1].offsetTop - rows[0].offsetTop,
            duration: cssSeconds(section, '--site-duration-arrow'),
            ease: EASE.settle,
            scrollTrigger: { trigger: arrow, start: 'top 80%', once: true },
          })
        })
      })

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} className="story-offer" aria-labelledby="story-offer-title">
      <div className="story-backdrop" aria-hidden="true">
        <Photo photo={photos.welcomeHome} grade="day" sizes="100vw" />
      </div>
      <div className="story-offer__inner">
        <div className="story-offer__close">
          <h2 id="story-offer-title" className="story-offer__title">
            {closing.title}
          </h2>
          <Button variant="accent" to="/signup">
            {closing.cta}
          </Button>
          <p className="story-offer__note">{hero.note}</p>
        </div>

        <div className="story-offer__label">
          <WarrantyLabel
            stage="protected"
            value={story.offerLabel.value}
            unit={story.offerLabel.unit}
            summary={story.offerLabel.summary}
          />
        </div>

        <div className="story-offer__price">
          <h3 className="story-offer__heading">{pricingTeaser.title}</h3>
          <p className="story-offer__text">{pricingTeaser.text}</p>
          <Link className="story-link" to="/pricing">
            {pricingTeaser.link}
            <ArrowRight weight="duotone" className="story-link__icon icon-flip-rtl" aria-hidden="true" />
          </Link>
        </div>

        <div className="story-offer__faq">
          <h3 className="story-offer__heading">שאלות נפוצות</h3>
          <SiteFaq items={questions} defaultOpenId={questions[0]?.id} />
          <Link className="story-link" to="/faq">
            לכל השאלות
            <ArrowRight weight="duotone" className="story-link__icon icon-flip-rtl" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default StoryOffer
