import { useRef } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from '@phosphor-icons/react'
import Button from '../../ui/Button/Button.jsx'
import Photo from '../../ui/Photo/Photo.jsx'
import InvoiceArtifact from '../../ui/InvoiceArtifact/InvoiceArtifact.jsx'
import WarrantyLabel from '../../ui/WarrantyLabel/WarrantyLabel.jsx'
import { hero, sampleAppliance } from '../../../data/site.js'
import { photos } from '../../../data/photos.js'
import { formatDate } from '../../../utils/format.js'
import {
  EASE,
  MEDIA,
  PIN,
  SCRUB,
  gsap,
  markMotion,
  safely,
  useGSAP,
} from '../../../utils/siteMotion.js'
import './StoryOpening.css'

/**
 * פרק 1 · יום הקנייה (STORYBOARD.md, DESIGN.md §14.8.4).
 * ה־HTML הבסיסי = המצב הסופי: צילום מלא, וילון יום בצד הטקסט, הקבלה והתו זה לצד זה.
 * במחשב, בגלילה: הצילום נפתח מהמסגרת למסך מלא, והקבלה הופכת לתו האחריות.
 * הכותרת והכפתור בלי אנימציה (LCP).
 */
function StoryOpening() {
  const sectionRef = useRef(null)

  useGSAP(
    () => {
      const section = sectionRef.current
      const stage = section.querySelector('.story-opening__stage')
      const media = section.querySelector('.story-opening__media')
      const frame = section.querySelector('.story-opening__frame')
      const receipt = section.querySelector('.story-opening__receipt')
      const label = section.querySelector('.story-opening__label')
      const mm = gsap.matchMedia()

      mm.add(MEDIA.desktop, () => {
        const undo = markMotion(section)

        safely(section, () => {
          const styles = getComputedStyle(section)
          const radius = styles.getPropertyValue('--site-radius-object').trim()
          // המסגרת נמדדת מחדש בכל רענון (שינוי גודל חלון), ולכן ערך כפונקציה
          const frameInset = () => {
            const s = stage.getBoundingClientRect()
            const f = frame.getBoundingClientRect()
            return `inset(${f.top - s.top}px ${s.right - f.right}px ${s.bottom - f.bottom}px ${f.left - s.left}px round ${radius})`
          }

          gsap
            .timeline({
              defaults: { ease: 'none' },
              scrollTrigger: {
                trigger: stage,
                start: 'top top',
                end: PIN.short,
                pin: true,
                scrub: SCRUB.desktop,
                invalidateOnRefresh: true,
              },
            })
            // הצילום נפתח מתחת לווילון היום שבצד הטקסט: הטקסט לא מחליף צבע ונשאר קריא בכל רגע
            .fromTo(media, { clipPath: frameInset }, { clipPath: 'inset(0px 0px 0px 0px round 0rem)', duration: 0.6 }, 0)
            .to(receipt, { scale: 0.72, rotate: -8, yPercent: -12, opacity: 0, duration: 0.3, ease: EASE.inOut }, 0.45)
            .fromTo(
              label,
              { opacity: 0, scale: 0.82, rotate: 5 },
              { opacity: 1, scale: 1, rotate: 0, duration: 0.35, ease: EASE.settle },
              0.62,
            )
        })

        return undo
      })

      mm.add(MEDIA.compact, () => {
        safely(section, () => {
          // בטלפון: בלי הצמדה, התו מחליק מתחת לקבלה עם הגלילה
          gsap.fromTo(
            label,
            { yPercent: -18 },
            {
              yPercent: 0,
              ease: 'none',
              scrollTrigger: { trigger: label, start: 'top bottom', end: 'top 55%', scrub: SCRUB.touch },
            },
          )
        })
      })

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} className="story-opening" aria-labelledby="story-opening-title">
      <div className="story-opening__stage">
        <div className="story-opening__media" aria-hidden="true">
          <Photo photo={photos.heroKitchen} grade="day" priority sizes="100vw" className="story-opening__photo" />
          <span className="story-opening__veil" />
        </div>

        <div className="story-opening__text">
          <h1 id="story-opening-title" className="story-opening__title">
            {hero.title}
          </h1>
          <p className="story-opening__lead">{hero.text}</p>
          <div className="story-opening__actions">
            <Button variant="accent" to="/signup">
              {hero.cta}
            </Button>
            <Link className="story-link" to="/#how-it-works">
              {hero.secondaryLink}
              <ArrowRight weight="duotone" className="story-link__icon icon-flip-rtl" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="story-opening__visual">
          <span className="story-opening__frame" aria-hidden="true" />
          <p className="story-sample">דוגמה</p>
          <div className="story-opening__receipt" aria-hidden="true">
            <InvoiceArtifact
              seller={sampleAppliance.seller}
              item={sampleAppliance.name}
              model={sampleAppliance.model}
              price={sampleAppliance.price}
              date={sampleAppliance.purchaseDate}
              scan="once"
            />
          </div>
          <div className="story-opening__label">
            <WarrantyLabel
              brand={sampleAppliance.brand}
              purchaseDate={sampleAppliance.purchaseDate}
              stage="soon"
              value={sampleAppliance.daysLeft}
              unit="ימים"
              lines={[`אחריות רגילה עד ${formatDate(sampleAppliance.standardUntil)} · מהחשבונית`]}
              summary={`דוגמה: האחריות על ${sampleAppliance.name} מסתיימת בעוד ${sampleAppliance.daysLeft} ימים.`}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default StoryOpening
