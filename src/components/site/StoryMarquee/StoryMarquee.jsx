import { useRef, useState } from 'react'
import {
  Armchair,
  Bed,
  Bicycle,
  Camera,
  Car,
  Couch,
  DeviceMobile,
  Headphones,
  Laptop,
  Motorcycle,
  Oven,
  Pause,
  Play,
  Scooter,
  Television,
  Toolbox,
  WashingMachine,
  Watch,
} from '@phosphor-icons/react'
import { marquee } from '../../../data/site.js'
import { MEDIA, ScrollTrigger, gsap, useGSAP } from '../../../utils/siteMotion.js'
import './StoryMarquee.css'

const ICONS = {
  washer: WashingMachine,
  sofa: Couch,
  car: Car,
  tv: Television,
  laptop: Laptop,
  bed: Bed,
  bicycle: Bicycle,
  phone: DeviceMobile,
  oven: Oven,
  armchair: Armchair,
  watch: Watch,
  camera: Camera,
  scooter: Scooter,
  tools: Toolbox,
  headphones: Headphones,
  motorcycle: Motorcycle,
}

/** הגלילה מאיצה את הפס עד פי כמה, ואז הוא חוזר לקצב שלו */
const BOOST_MAX = 4
const BOOST_PER_PX = 1 / 600

/**
 * הפס שרץ בלי סוף אחרי פרק 1 (DESIGN.md §14.8.3, בקשת רפאל 19/09/2026):
 * כל מה שקונים עם אחריות, ממכונת הכביסה ועד הרכב.
 * התנועה עצמה ב־CSS (שני עותקים זהים, הזזה של חצי מסילה), ולכן היא רצה גם בלי GSAP.
 * GSAP רק מאיץ אותה בזמן גלילה. כפתור עצירה (WCAG 2.2.2), עצירה ברחיפה,
 * ובלי תנועה (prefers-reduced-motion) הרשימה נפרשת בשורות ולא זזה.
 */
function StoryMarquee() {
  const rootRef = useRef(null)
  const [paused, setPaused] = useState(false)

  useGSAP(
    () => {
      const root = rootRef.current
      const track = root.querySelector('.story-marquee__track')
      const mm = gsap.matchMedia()

      mm.add(`${MEDIA.desktop}, ${MEDIA.compact}`, () => {
        const speed = { rate: 1 }
        // playbackRate על אנימציית ה־CSS עצמה: שומר על המיקום, בלי קפיצה
        const apply = () => {
          track.getAnimations().forEach((animation) => {
            animation.playbackRate = speed.rate
          })
        }

        // מחוץ למסך הפס לא עובד בכלל. המחלקה נקבעת רק כאן: בלי JS הפס פשוט רץ
        const setOffscreen = (offscreen) => root.classList.toggle('is-offscreen', offscreen)

        const trigger = ScrollTrigger.create({
          trigger: root,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => setOffscreen(!self.isActive),
          onUpdate(self) {
            const boost = Math.min(BOOST_MAX, 1 + Math.abs(self.getVelocity()) * BOOST_PER_PX)
            gsap.killTweensOf(speed)
            gsap
              .timeline()
              .to(speed, { rate: boost, duration: 0.2, ease: 'power2.out', onUpdate: apply })
              .to(speed, { rate: 1, duration: 1.2, ease: 'power3.out', onUpdate: apply })
          },
        })
        setOffscreen(!trigger.isActive)

        return () => {
          trigger.kill()
          setOffscreen(false)
          gsap.killTweensOf(speed)
          speed.rate = 1
          apply()
        }
      })

      return () => mm.revert()
    },
    { scope: rootRef },
  )

  const copy = (hidden) => (
    <ul
      className="story-marquee__list"
      aria-label={hidden ? undefined : marquee.label}
      aria-hidden={hidden || undefined}
    >
      {marquee.items.map((item) => {
        const ItemIcon = ICONS[item.icon]
        return (
          <li key={item.id} className="story-marquee__item">
            <ItemIcon weight="duotone" className="story-marquee__icon" aria-hidden="true" />
            <span>{item.label}</span>
            {/* המפריד: תו אחריות זעיר, שלושת הפסים במדרגות */}
            <span className="story-marquee__mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div ref={rootRef} className={['story-marquee', paused && 'is-paused'].filter(Boolean).join(' ')}>
      <div className="story-marquee__viewport">
        <div className="story-marquee__track">
          {copy(false)}
          {copy(true)}
        </div>
      </div>
      <button
        type="button"
        className="story-marquee__toggle is-tactile"
        aria-label={paused ? marquee.play : marquee.pause}
        onClick={() => setPaused((value) => !value)}
      >
        {paused ? (
          <Play weight="duotone" className="story-marquee__toggle-icon" aria-hidden="true" />
        ) : (
          <Pause weight="duotone" className="story-marquee__toggle-icon" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}

export default StoryMarquee
