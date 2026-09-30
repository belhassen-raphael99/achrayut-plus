import { Fragment, useRef } from 'react'
import { BellRinging } from '@phosphor-icons/react'
import Photo from '../../ui/Photo/Photo.jsx'
import WarrantyLabel from '../../ui/WarrantyLabel/WarrantyLabel.jsx'
import StoryPhone from '../StoryPhone/StoryPhone.jsx'
import StoryContacts from '../StoryContacts/StoryContacts.jsx'
import { sampleAppliance, story } from '../../../data/site.js'
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
import './StoryNight.css'

/**
 * פרק 3 · הלילה, רגע החתימה (STORYBOARD.md, DESIGN.md §14.8.4).
 * במחשב, מוצמד לשלושה מסכים, ארבעה שוטים:
 * ① פסי קולנוע נסגרים והמטבח עובר ללילה ② השאלות נחשפות מתוך פס אדום
 * ③ הטלפון עולה ומתיישר ושובר את המסגרת ④ החץ של התו נוסע ל«24 ימים» ואנשי הקשר נדלקים.
 * בלי תנועה: סצנת ערב סטטית עם השאלות והכרטיס המלא.
 * אחרי החלטת הזכוכית (17/09): ערב ולא לילה כבד; השאלות על זכוכית כחולה מעל הצילום.
 */
function StoryNight() {
  const sectionRef = useRef(null)

  useGSAP(
    () => {
      const section = sectionRef.current
      const q = (selector) => section.querySelector(selector)
      const stage = q('.story-night__stage')
      const night = q('.story-night__photo--night')
      const veil = q('.story-night__veil')
      const bars = section.querySelectorAll('.story-night__letterbox')
      const questions = section.querySelectorAll('.story-night__question')
      const wipes = section.querySelectorAll('.story-night__wipe')
      const copy = q('.story-night__copy')
      const answer = q('.story-night__answer')
      const device = q('.story-night__device')
      const rows = section.querySelectorAll('.warranty-label__row')
      const arrow = q('.warranty-label__arrow')
      const contacts = section.querySelectorAll('.story-contacts__row')
      const notice = q('.story-night__notice')
      const mm = gsap.matchMedia()

      // החץ מתחיל בשורה «מוגנת» ונוסע לשורה שלו («מסתיימת בקרוב»)
      const arrowStart = () => rows[0].offsetTop - rows[1].offsetTop
      const reveal = { clipPath: 'inset(0% 0% 0% 0%)' }
      const hidden = { clipPath: 'inset(0% 0% 0% 100%)' }

      mm.add(MEDIA.desktop, () => {
        const undo = markMotion(section)

        safely(section, () => {
          gsap
            .timeline({
              defaults: { ease: 'none' },
              scrollTrigger: {
                trigger: stage,
                start: 'top top',
                end: PIN.signature,
                pin: true,
                scrub: SCRUB.desktop,
                invalidateOnRefresh: true,
              },
            })
            // ① הערב יורד: פסי הקולנוע נסגרים והצילום עובר ללילה
            .fromTo(bars, { scaleY: 0 }, { scaleY: 1, duration: 0.18, ease: EASE.inOut }, 0)
            .fromTo(night, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0)
            .fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.04)
            // ② השאלות: פאנל הזכוכית נכנס איתן, כדי שלא תעמוד קופסה ריקה על המסך
            .fromTo(copy, { opacity: 0, yPercent: 8 }, { opacity: 1, yPercent: 0, duration: 0.06, ease: EASE.settle }, 0.16)
            .fromTo(questions, hidden, { ...reveal, duration: 0.1, stagger: 0.1, ease: EASE.inOut }, 0.2)
            // הפס האדום נסוג ומשאיר את השאלה: אדום הוא המסכה, לא הרקע (§14.8.4)
            .to(wipes, { scaleX: 0, duration: 0.12, stagger: 0.1, ease: EASE.inOut }, 0.28)
            // ③ הטלפון עולה, מתיישר ושובר את המסגרת
            .fromTo(
              device,
              { yPercent: 70, rotateX: 28 },
              { yPercent: 0, rotateX: 0, duration: 0.2, ease: EASE.settle },
              0.42,
            )
            // ④ התו ואנשי הקשר
            .fromTo(arrow, { y: arrowStart }, { y: 0, duration: 0.1, ease: EASE.settle }, 0.62)
            .fromTo(contacts, { opacity: 0.3 }, { opacity: 1, duration: 0.06, stagger: 0.04 }, 0.7)
            .fromTo(answer, hidden, { ...reveal, duration: 0.08, ease: EASE.inOut }, 0.8)
            // המסגרת נפתחת, והתזכורת נופלת על הטלפון
            .to(bars, { scaleY: 0, duration: 0.08, ease: EASE.inOut }, 0.86)
            .fromTo(notice, { yPercent: -160 }, { yPercent: 0, duration: 0.08, ease: EASE.settle }, 0.92)
        })

        return undo
      })

      mm.add(MEDIA.compact, () => {
        const undo = markMotion(section)

        safely(section, () => {
          // בטלפון: בלי הצמדה ובלי הטיה; כל חלק נחשף כשהוא נכנס למסך
          const scrub = SCRUB.touch
          gsap.fromTo(night, { opacity: 0 }, {
            opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: stage, start: 'top bottom', end: 'top 30%', scrub },
          })
          gsap.fromTo(veil, { opacity: 0 }, {
            opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: stage, start: 'top bottom', end: 'top 30%', scrub },
          })
          gsap.fromTo(questions, hidden, {
            ...reveal,
            stagger: 0.3,
            ease: 'none',
            scrollTrigger: { trigger: questions[0], start: 'top 85%', end: 'top 40%', scrub },
          })
          gsap
            .timeline({
              defaults: { ease: 'none' },
              scrollTrigger: { trigger: device, start: 'top 90%', end: 'center 50%', scrub },
            })
            .fromTo(device, { yPercent: 20 }, { yPercent: 0 }, 0)
            .fromTo(arrow, { y: arrowStart }, { y: 0 }, 0.3)
            .fromTo(contacts, { opacity: 0.3 }, { opacity: 1, stagger: 0.1 }, 0.4)
            .fromTo(notice, { yPercent: -160 }, { yPercent: 0 }, 0.7)
        })

        return undo
      })

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} className="story-night" aria-labelledby="story-night-title">
      <div className="story-night__stage">
        <div className="story-night__media" aria-hidden="true">
          <Photo photo={photos.heroKitchen} grade="day" sizes="100vw" className="story-night__photo story-night__photo--day" />
          <Photo photo={photos.heroKitchen} grade="dusk" sizes="100vw" className="story-night__photo story-night__photo--night" />
          <span className="story-night__veil" />
        </div>
        <span className="story-night__letterbox story-night__letterbox--top site-glass" aria-hidden="true" />
        <span className="story-night__letterbox story-night__letterbox--bottom site-glass" aria-hidden="true" />

        <div className="story-night__copy site-glass">
          <h2 id="story-night-title" className="story-night__questions">
            {story.night.questions.map((question) => (
              <Fragment key={question}>
                <span className="story-night__question">
                  {question}
                  <span className="story-night__wipe" aria-hidden="true" />
                </span>{' '}
              </Fragment>
            ))}
          </h2>
          <p className="story-night__answer">{story.night.answer}</p>
        </div>

        <div className="story-night__device">
          <p className="story-sample">דוגמה</p>
          <StoryPhone>
            {/* המשבצת חותכת: ההתראה נוחתת מתחת לשורת המצב ולא חוצה את האי הדינמי ואת השעה */}
            <div className="story-night__notice-slot">
              <div className="story-night__notice">
                <BellRinging weight="duotone" className="story-night__notice-icon" />
                <span>
                  {story.night.notification}
                  <bdi dir="ltr">{formatDate(sampleAppliance.standardUntil)}</bdi>
                </span>
              </div>
            </div>
            <p className="story-night__appliance">{sampleAppliance.name}</p>
            <WarrantyLabel
              brand={sampleAppliance.brand}
              purchaseDate={sampleAppliance.purchaseDate}
              stage="soon"
              value={sampleAppliance.daysLeft}
              unit="ימים"
              lines={[`אחריות רגילה עד ${formatDate(sampleAppliance.standardUntil)} · מהחשבונית`]}
            />
            <StoryContacts />
          </StoryPhone>
          <p className="visually-hidden">{story.night.summary}</p>
        </div>
      </div>
    </section>
  )
}

export default StoryNight
