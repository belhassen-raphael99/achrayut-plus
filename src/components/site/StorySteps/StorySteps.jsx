import { useRef } from 'react'
import { BellRinging } from '@phosphor-icons/react'
import Photo from '../../ui/Photo/Photo.jsx'
import StepStage from '../HowItWorks/StepStage.jsx'
import StoryPhone from '../StoryPhone/StoryPhone.jsx'
import { howItWorks } from '../../../data/site.js'
import { photos } from '../../../data/photos.js'
import {
  EASE,
  MEDIA,
  SCRUB,
  ScrollTrigger,
  cssSeconds,
  gsap,
  markMotion,
  safely,
  useGSAP,
} from '../../../utils/siteMotion.js'
import './StorySteps.css'

// ארבעה קליקים של החוגה, עם כיוון השעון (§14.11: תנועה פיזית של כפתור, לא כיוון קריאה)
const DIAL_ANGLES = [-135, -45, 45, 135]

/**
 * פרק 4 · איך זה עובד (STORYBOARD.md, DESIGN.md §14.8.4). רצף אמיתי, ולכן יש מספרים 1–4.
 * במחשב: הטלפון קבוע בצד הסוף, הצעדים גוללים בצד ההתחלה, המסך מתחלף והחוגה מסתובבת קליק בכל צעד.
 * בטלפון ובלי תנועה: כל צעד עם המסך שלו מתחתיו.
 * מעל צילום סלון, הצעדים על זכוכית כחולה (החלטת רפאל, 17/09).
 */
function StorySteps() {
  const sectionRef = useRef(null)

  useGSAP(
    () => {
      const section = sectionRef.current
      const steps = section.querySelectorAll('.story-steps__step')
      const layers = section.querySelectorAll('.story-steps__layer')
      const needle = section.querySelector('.story-steps__needle')
      const ticks = section.querySelectorAll('.story-steps__tick')
      const track = section.querySelector('.story-steps__track')
      const dot = section.querySelector('.story-steps__rail-dot')
      const mm = gsap.matchMedia()

      // גם בלי תנועה החוגה מצביעה על הצעד הראשון והמסך הראשון גלוי (18/09)
      const activate = (index, click) => {
        layers.forEach((layer, i) => layer.classList.toggle('is-active', i === index))
        ticks.forEach((tick, i) => tick.classList.toggle('is-active', i === index))
        if (click) gsap.to(needle, { rotation: DIAL_ANGLES[index], duration: click, ease: EASE.settle, overwrite: true })
        else gsap.set(needle, { rotation: DIAL_ANGLES[index] })
      }

      activate(0)

      const build = (scrub) => {
        const undo = markMotion(section)

        safely(section, () => {
          const click = cssSeconds(section, '--site-duration-dial')

          steps.forEach((step, index) => {
            ScrollTrigger.create({
              trigger: step,
              start: 'top center',
              end: 'bottom center',
              onToggle: (self) => self.isActive && activate(index, click),
            })
          })

          // הסמן על המסילה מראה איפה אנחנו ברצף
          // transform בלבד: המרחק נמדד מחדש בכל רענון
          gsap.fromTo(
            dot,
            { y: 0 },
            {
              y: () => track.offsetHeight - dot.offsetHeight,
              ease: 'none',
              scrollTrigger: {
                trigger: track,
                start: 'top center',
                end: 'bottom center',
                scrub,
                invalidateOnRefresh: true,
              },
            },
          )
        })

        return undo
      }

      mm.add(MEDIA.desktop, () => build(SCRUB.desktop))
      mm.add(MEDIA.compact, () => build(SCRUB.touch))

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  const alertIcon = <BellRinging weight="duotone" />

  return (
    <section ref={sectionRef} id="how-it-works" className="story-steps" aria-labelledby="story-steps-title">
      <div className="story-backdrop" aria-hidden="true">
        <Photo photo={photos.livingRoom} grade="day" sizes="100vw" />
      </div>
      <div className="story-steps__inner">
        <div className="story-steps__head site-glass">
          <h2 id="story-steps-title" className="story-steps__title">
            {howItWorks.title}
          </h2>
          <div className="story-steps__dial" aria-hidden="true">
            {howItWorks.steps.map((step, index) => (
              <span
                key={step.id}
                className="story-steps__tick"
                style={{ '--tick-angle': `${DIAL_ANGLES[index]}deg` }}
              >
                {index + 1}
              </span>
            ))}
            <span className="story-steps__needle" />
          </div>
        </div>

        <div className="story-steps__body">
          <div className="story-steps__track">
            <span className="story-steps__rail" aria-hidden="true">
              <span className="story-steps__rail-dot" />
            </span>
            <ol className="story-steps__list">
              {howItWorks.steps.map((step, index) => (
                <li key={step.id} className="story-steps__step">
                  <div className="story-steps__card site-glass">
                    <span className="story-steps__number" aria-hidden="true">
                      {index + 1}
                    </span>
                    <div className="story-steps__copy">
                      <h3 className="story-steps__step-title">{step.title}</h3>
                      <p className="story-steps__step-text">{step.text}</p>
                    </div>
                  </div>
                  <div className="story-steps__inline" aria-hidden="true">
                    <StepStage id={step.id} alertIcon={alertIcon} />
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="story-steps__sticky">
            <StoryPhone screenClassName="story-steps__screen">
              {howItWorks.steps.map((step) => (
                <div key={step.id} className="story-steps__layer">
                  <StepStage id={step.id} alertIcon={alertIcon} />
                </div>
              ))}
            </StoryPhone>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StorySteps
