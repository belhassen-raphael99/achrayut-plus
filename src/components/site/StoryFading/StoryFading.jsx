import { useRef } from 'react'
import Photo from '../../ui/Photo/Photo.jsx'
import InvoiceArtifact from '../../ui/InvoiceArtifact/InvoiceArtifact.jsx'
import { sampleAppliance, story } from '../../../data/site.js'
import { photos } from '../../../data/photos.js'
import {
  MEDIA,
  PIN,
  SCRUB,
  SplitText,
  cssNumber,
  gsap,
  markMotion,
  safely,
  useGSAP,
} from '../../../utils/siteMotion.js'
import './StoryFading.css'

/**
 * פרק 2 · החשבונית נעלמת (STORYBOARD.md, DESIGN.md §14.8.4). פרק נשימה.
 * בגלילה המילים נחשפות אחת אחרי השנייה, ובאותו קצב הדיו של הקבלה דוהה: הגלילה היא הזמן שעובר.
 * בלי תנועה: המשפט מלא, והקבלה דהויה למחצה.
 */
function StoryFading() {
  const sectionRef = useRef(null)

  useGSAP(
    () => {
      const section = sectionRef.current
      const stage = section.querySelector('.story-fading__stage')
      const sentence = section.querySelector('.story-fading__sentence')
      const ink = section.querySelectorAll(
        '.stage-invoice__head, .stage-invoice__line, .stage-invoice__foot, .stage-invoice__barcode',
      )
      const mm = gsap.matchMedia()

      const build = (pinned) => {
        const undo = markMotion(section)

        safely(section, () => {
          const dim = cssNumber(section, '--site-word-dim')
          const faded = cssNumber(section, '--site-ink-gone')
          const trigger = pinned
            ? { trigger: stage, start: 'top top', end: PIN.short, pin: true, scrub: SCRUB.desktop }
            : { trigger: stage, start: 'top 75%', end: 'bottom 60%', scrub: SCRUB.touch }

          // SplitText לפי מילים בלבד: פיצול לאותיות שובר עברית (§14.8.4). autoSplit בונה מחדש כשהרוחב משתנה
          SplitText.create(sentence, {
            type: 'words',
            wordsClass: 'story-fading__word',
            aria: 'auto',
            autoSplit: true,
            onSplit: (split) =>
              gsap
                .timeline({ defaults: { ease: 'none' }, scrollTrigger: trigger })
                .fromTo(split.words, { opacity: dim }, { opacity: 1, stagger: 0.12 }, 0)
                .fromTo(ink, { opacity: 1 }, { opacity: faded, duration: split.words.length * 0.12 }, 0),
          })
        })

        return undo
      }

      mm.add(MEDIA.desktop, () => build(true))
      mm.add(MEDIA.compact, () => build(false))

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} className="story-fading" aria-labelledby="story-fading-title">
      <div className="story-fading__stage">
        <div className="story-fading__backdrop" aria-hidden="true">
          <Photo photo={photos.paperwork} grade="blur" maxWidth={1080} sizes="100vw" />
        </div>

        <div className="story-fading__copy">
          <h2 id="story-fading-title" className="story-fading__sentence">
            {story.fading.sentence}
          </h2>
          <p className="story-fading__fact site-glass">{story.fading.fact}</p>
        </div>

        <div className="story-fading__receipt" aria-hidden="true">
          <InvoiceArtifact
            seller={sampleAppliance.seller}
            item={sampleAppliance.name}
            model={sampleAppliance.model}
            price={sampleAppliance.price}
            date={sampleAppliance.purchaseDate}
            scan="none"
          />
        </div>
      </div>
    </section>
  )
}

export default StoryFading
