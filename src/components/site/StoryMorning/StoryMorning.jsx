import { useRef } from 'react'
import Photo from '../../ui/Photo/Photo.jsx'
import { audience } from '../../../data/site.js'
import { photos } from '../../../data/photos.js'
import { MEDIA, SCRUB, gsap, markMotion, safely, useGSAP } from '../../../utils/siteMotion.js'
import './StoryMorning.css'

/**
 * פרק 6 · הבוקר (STORYBOARD.md, DESIGN.md §14.8.4). פרק נשימה.
 * במחשב: אירוס עגול פותח את האור אחרי הלילה, וכל צוהר נפתח כשהוא נכנס למסך.
 * הפס הרחב של הסלון הועבר לרקע של פרק 7 (18/09): שני צילומים רצופים השאירו מסך בלי מילה.
 * הצוהר = החלון של מכונת הכביסה, החוט של הסרט. בטלפון ובלי תנועה: הצוהרים פתוחים.
 */
function StoryMorning() {
  const sectionRef = useRef(null)

  useGSAP(
    () => {
      const section = sectionRef.current
      const light = section.querySelector('.story-morning__light')
      const portholes = section.querySelectorAll('.story-morning__porthole')
      const mm = gsap.matchMedia()

      mm.add(MEDIA.desktop, () => {
        const undo = markMotion(section)

        safely(section, () => {
          // האירוס: עיגול אור שגדל מעל הלילה עד שהוא ממלא את הפרק
          gsap.fromTo(
            light,
            { clipPath: 'circle(0% at 50% 0%)' },
            {
              clipPath: 'circle(150% at 50% 0%)',
              ease: 'none',
              scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 15%', scrub: SCRUB.desktop },
            },
          )

          portholes.forEach((porthole) => {
            gsap.fromTo(
              porthole,
              { clipPath: 'circle(0% at 50% 50%)' },
              {
                clipPath: 'circle(50% at 50% 50%)',
                ease: 'none',
                scrollTrigger: { trigger: porthole, start: 'top 95%', end: 'top 55%', scrub: SCRUB.desktop },
              },
            )
          })
        })

        return undo
      })

      mm.add(MEDIA.compact, () => {
        safely(section, () => {
          portholes.forEach((porthole) => {
            gsap.fromTo(
              porthole,
              { scale: 0.86 },
              {
                scale: 1,
                ease: 'none',
                scrollTrigger: { trigger: porthole, start: 'top bottom', end: 'top 60%', scrub: SCRUB.touch },
              },
            )
          })
        })
      })

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} className="story-morning" aria-labelledby="story-morning-title">
      <div className="story-morning__light">
        <div className="story-morning__inner">
          <h2 id="story-morning-title" className="story-morning__title">
            {audience.title}
          </h2>
          <ul className="story-morning__people">
            {audience.items.map((item) => (
              <li key={item.title} className="story-morning__person">
                <div className="story-morning__porthole" aria-hidden="true">
                  <Photo
                    photo={photos[item.photo]}
                    grade="day"
                    maxWidth={1080}
                    sizes="(min-width: 1024px) 20rem, 60vw"
                  />
                </div>
                <h3 className="story-morning__person-title">{item.title}</h3>
                <p className="story-morning__person-text">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </section>
  )
}

export default StoryMorning
