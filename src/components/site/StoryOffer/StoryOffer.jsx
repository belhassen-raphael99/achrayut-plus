import { useRef } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from '@phosphor-icons/react'
import Photo from '../../ui/Photo/Photo.jsx'
import Button from '../../ui/Button/Button.jsx'
import WarrantyLabel from '../../ui/WarrantyLabel/WarrantyLabel.jsx'
import SiteFaq from '../SiteFaq/SiteFaq.jsx'
import { photos } from '../../../data/photos.js'
// הלוגואים האמיתיים של Apple ו־Google Play (Simple Icons, CC0). לא תגי החנויות הרשמיים:
// אלה מותרים רק כקישור לאפליקציה שכבר נמצאת בחנות (בקשת רפאל 19/09: «vrais icônes»)
import appleLogo from '../../../assets/stores/apple.svg'
import googlePlayLogo from '../../../assets/stores/googleplay.svg'
import {
  closing,
  faqItems,
  hero,
  homeFaqIds,
  pricingTeaser,
  stores,
  story,
} from '../../../data/site.js'
import { EASE, cssSeconds, gsap, safely, useGSAP } from '../../../utils/siteMotion.js'
import './StoryOffer.css'

const STORE_LOGOS = { ios: appleLogo, android: googlePlayLogo }

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

        <div className="story-offer__stores">
          <h3 className="story-offer__heading">{stores.title}</h3>
          <ul className="story-offer__store-list">
            {stores.items.map((item) => (
              <li key={item.id} className="story-offer__store">
                <span
                  className="story-offer__store-logo"
                  style={{ '--store-logo': `url("${STORE_LOGOS[item.id]}")` }}
                  aria-hidden="true"
                />
                <span className="story-offer__store-text">
                  <span className="story-offer__store-soon">בקרוב ב־</span>
                  <bdi dir="ltr" className="story-offer__store-name">
                    {item.label}
                  </bdi>
                </span>
              </li>
            ))}
          </ul>
          <p className="story-offer__text">{stores.note}</p>
        </div>
      </div>
    </section>
  )
}

export default StoryOffer
