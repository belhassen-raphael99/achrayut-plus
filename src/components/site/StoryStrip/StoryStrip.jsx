import { useRef } from 'react'
import { MEDIA, SCRUB, gsap, safely, useGSAP } from '../../../utils/siteMotion.js'
import './StoryStrip.css'

/**
 * פס התו: המעבר ברירת המחדל בין פרקים (DESIGN.md §14.8.3).
 * שלושת הצבעים של תו האחריות חוצים את המסך מתחילת השורה לסופה (מימין לשמאל) בזמן שהפס עובר בגלילה.
 * בלי תנועה: שלושה פסים גלויים, קישוט בלבד (aria-hidden).
 * tone: day · night — הרקע שמאחורי הפס, כדי שהקצוות יתמזגו בפרק שסביבו.
 */
function StoryStrip({ tone = 'day' }) {
  const stripRef = useRef(null)

  useGSAP(
    () => {
      const strip = stripRef.current
      const bars = strip.querySelectorAll('.story-strip__bar')
      const mm = gsap.matchMedia()

      const build = (scrub) => {
        safely(strip, () => {
          // clip-path פיזי: inset(0 0 0 100%) = חתוך לגמרי משמאל, ולכן הפס נכנס מימין (§14.11)
          gsap
            .timeline({
              defaults: { ease: 'none' },
              scrollTrigger: { trigger: strip, start: 'top bottom', end: 'bottom top', scrub },
            })
            .fromTo(
              bars,
              { clipPath: 'inset(0% 0% 0% 100%)' },
              { clipPath: 'inset(0% 0% 0% 0%)', stagger: 0.08, duration: 0.45 },
              0,
            )
            .to(bars, { clipPath: 'inset(0% 100% 0% 0%)', stagger: 0.08, duration: 0.45 }, 0.55)
        })
      }

      mm.add(MEDIA.desktop, () => build(SCRUB.desktop))
      mm.add(MEDIA.compact, () => build(SCRUB.touch))

      return () => mm.revert()
    },
    { scope: stripRef },
  )

  return (
    <div ref={stripRef} className={`story-strip story-strip--${tone}`} aria-hidden="true">
      <span className="story-strip__bar story-strip__bar--green" />
      <span className="story-strip__bar story-strip__bar--saffron" />
      <span className="story-strip__bar story-strip__bar--red" />
    </div>
  )
}

export default StoryStrip
