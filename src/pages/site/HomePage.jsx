import { useEffect } from 'react'
import SmoothScroll from '../../components/layout/SmoothScroll/SmoothScroll.jsx'
import StoryOpening from '../../components/site/StoryOpening/StoryOpening.jsx'
import StoryStrip from '../../components/site/StoryStrip/StoryStrip.jsx'
import StoryMarquee from '../../components/site/StoryMarquee/StoryMarquee.jsx'
import StoryFading from '../../components/site/StoryFading/StoryFading.jsx'
import StoryNight from '../../components/site/StoryNight/StoryNight.jsx'
import StorySteps from '../../components/site/StorySteps/StorySteps.jsx'
import StoryProof from '../../components/site/StoryProof/StoryProof.jsx'
import StoryMorning from '../../components/site/StoryMorning/StoryMorning.jsx'
import StoryOffer from '../../components/site/StoryOffer/StoryOffer.jsx'
import { ScrollTrigger } from '../../utils/siteMotion.js'

/**
 * דף הבית הקולנועי (S1, S2): שבעה פרקים לפי STORYBOARD.md, בכיוון של DESIGN.md §14.
 * יום (1–2) ← ערב (3) ← צילומים וזכוכית כחולה (4–5) ← בוקר (6–7). בלי משטחים כהים מלאים (החלטת רפאל, 17/09). אחרי פרק 1: הפס שרץ בלי סוף (כל קנייה עם אחריות); פס התו מפריד אחרי פרקים 3, 4 ו־6 (§14.8.3).
 * נטען בפיצול קוד (App.jsx), ולכן GSAP ו־Lenis לא מגיעים לאפליקציה.
 */
function HomePage() {
  // ההצמדות נמדדות מחדש כשהגופן והצילומים מגיעים, כי הגבהים משתנים (§14.8.1)
  useEffect(() => {
    let active = true
    const refresh = () => active && ScrollTrigger.refresh()

    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)

    return () => {
      active = false
      window.removeEventListener('load', refresh)
    }
  }, [])

  return (
    <>
      <title>אחריות+ · כל האחריות שלכם, במקום אחד</title>
      <SmoothScroll />
      <span className="story-grain" aria-hidden="true" />

      <StoryOpening />
      <StoryMarquee />
      <StoryFading />
      <StoryNight />
      <StoryStrip tone="day" />
      <StorySteps />
      <StoryStrip tone="day" />
      <StoryProof />
      <StoryMorning />
      <StoryStrip tone="day" />
      <StoryOffer />
    </>
  )
}

export default HomePage
