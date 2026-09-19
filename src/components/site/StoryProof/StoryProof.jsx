import { useRef } from 'react'
import { CheckCircle, LockKey, Scales } from '@phosphor-icons/react'
import Photo from '../../ui/Photo/Photo.jsx'
import StoryContacts from '../StoryContacts/StoryContacts.jsx'
import { sampleAppliance, story, trust, whyUs } from '../../../data/site.js'
import { photos } from '../../../data/photos.js'
import { formatDate } from '../../../utils/format.js'
import { MEDIA, SCRUB, gsap, markMotion, safely, useGSAP } from '../../../utils/siteMotion.js'
import './StoryProof.css'

/** הפרט האמיתי של האפליקציה שמוכיח כל יתרון (STORYBOARD.md פרק 5) */
function ProofDetail({ id }) {
  if (id === 'contacts') return <StoryContacts />

  if (id === 'dates') {
    const sources = story.proof.find((item) => item.id === 'dates').sources
    return (
      <div className="story-proof__dates">
        <p className="story-proof__date">
          <span>אחריות רגילה עד {formatDate(sampleAppliance.standardUntil)}</span>
          <span className="story-proof__source">מהחשבונית</span>
        </p>
        <p className="story-proof__date">
          <span>אחריות מורחבת</span>
          <span className="story-proof__add">להוסיף</span>
        </p>
        <ul className="story-proof__sources">
          {sources.map((source) => (
            <li key={source}>{source}</li>
          ))}
        </ul>
      </div>
    )
  }

  if (id === 'law') {
    return (
      <div className="story-proof__law">
        <Scales weight="duotone" className="story-proof__law-icon" />
        <p className="story-proof__law-figure">שנה</p>
        <p className="story-proof__law-caption">לפחות, לפי החוק</p>
      </div>
    )
  }

  return (
    <ul className="story-proof__trust">
      {trust.items.map((item) => (
        <li key={item}>
          <CheckCircle weight="duotone" className="story-proof__trust-icon" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * פרק 5 · ההוכחה (STORYBOARD.md, DESIGN.md §14.8.4): ארבעה פאנלים שנעצרים ונערמים זה על זה במחשב.
 * כל יתרון מוצג עם החלק האמיתי של האפליקציה שמוכיח אותו, לא אייקון וכותרת גנריים.
 * אין המלצות או מספרי משתמשים: אין עדיין, והבלוק לא מוצג עד שיהיה תוכן אמיתי.
 * מעל צילום סלון, הפאנלים מזכוכית כחולה (החלטת רפאל, 17/09).
 */
function StoryProof() {
  const sectionRef = useRef(null)

  useGSAP(
    () => {
      const section = sectionRef.current
      const panels = section.querySelectorAll('.story-proof__panel')
      const mm = gsap.matchMedia()

      mm.add(MEDIA.desktop, () => {
        const undo = markMotion(section)

        safely(section, () => {
          // הפאנל הקודם מתכווץ ונחלש כשהבא מגיע: הוכחה מונחת על הוכחה
          panels.forEach((panel, index) => {
            const next = panels[index + 1]
            if (!next) return
            gsap.to(panel, {
              scale: 0.94,
              opacity: 0.6,
              ease: 'none',
              scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 30%', scrub: SCRUB.desktop },
            })
          })
        })

        return undo
      })

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} className="story-proof" aria-labelledby="story-proof-title">
      <div className="story-backdrop" aria-hidden="true">
        <Photo photo={photos.pricingRoom} grade="day" sizes="100vw" />
      </div>
      <div className="story-proof__inner">
        <h2 id="story-proof-title" className="story-proof__title site-glass">
          {whyUs.title}
        </h2>
        <ul className="story-proof__list">
          {story.proof.map((item, index) => (
            <li
              key={item.id}
              className={`story-proof__panel story-proof__panel--${item.id} site-glass`}
              style={{ '--panel-index': index }}
            >
              <div className="story-proof__copy">
                {item.id === 'privacy' && <LockKey weight="duotone" className="story-proof__lock" />}
                <h3 className="story-proof__panel-title">{item.title}</h3>
                <p className="story-proof__panel-text">{item.text}</p>
              </div>
              <div className="story-proof__detail" aria-hidden={item.id !== 'privacy' ? 'true' : undefined}>
                <ProofDetail id={item.id} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default StoryProof
