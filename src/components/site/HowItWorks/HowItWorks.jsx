import { useEffect, useRef, useState } from 'react'
import Container from '../../layout/Container/Container.jsx'
import StageFrame from '../../ui/StageFrame/StageFrame.jsx'
import StepStage from './StepStage.jsx'
import { howItWorks } from '../../../data/site.js'
import './HowItWorks.css'

const pad = (number) => String(number).padStart(2, '0')

/**
 * «איך זה עובד» (בהשראת «ראיית לילה» של rmnetsec-it.com, 16/09/2026).
 * במחשב: הטקסט של השלבים נגלל, והבמה נדבקת ומראה אותו אובייקט שעובר טרנספורמציה.
 * בטלפון: לכל שלב הבמה שלו, מתחת לטקסט.
 * הבמה היא איור: aria-hidden. הכותרת והטקסט של השלב נושאים את המשמעות.
 */
function HowItWorks() {
  const { title, steps } = howItWorks
  const [activeIndex, setActiveIndex] = useState(0)
  const stepRefs = useRef([])

  // השלב הפעיל: זה שנמצא ברצועת האמצע של המסך
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveIndex(Number(entry.target.dataset.index))
        })
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    stepRefs.current.filter(Boolean).forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  const active = steps[activeIndex]

  return (
    <section id="how-it-works" className="how-it-works" aria-labelledby="how-it-works-title">
      <Container>
        <h2 id="how-it-works-title" className="how-it-works__title" data-reveal="soft">
          {title}
        </h2>

        <div className="how-it-works__layout" style={{ '--active-index': activeIndex }}>
          <ol className="how-it-works__steps">
            {steps.map((step, index) => (
              <li
                key={step.id}
                ref={(element) => {
                  stepRefs.current[index] = element
                }}
                data-index={index}
                className={['how-step', activeIndex === index && 'is-active'].filter(Boolean).join(' ')}
              >
                <div className="how-step__copy" data-reveal>
                  <p className="how-step__eyebrow">
                    <span>שלב</span>
                    <span className="how-step__number" dir="ltr">
                      {pad(index + 1)}
                    </span>
                  </p>
                  <h3 className="how-step__title">{step.title}</h3>
                  <p className="how-step__text">{step.text}</p>
                  <span className="how-step__rule" aria-hidden="true" />
                </div>

                <div className="how-step__stage" aria-hidden="true" data-reveal="lift">
                  <Stage step={step} index={index} total={steps.length} />
                </div>
              </li>
            ))}
          </ol>

          <div className="how-it-works__sticky" aria-hidden="true">
            <div className="how-it-works__sticky-inner">
              <Stage step={active} index={activeIndex} total={steps.length} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

/** הבמה של שלב: קוד ה־HUD, מונה ופס התקדמות */
function Stage({ step, index, total }) {
  return (
    <StageFrame
      code={step.code}
      counter={`${pad(index + 1)} / ${pad(total)}`}
      progress={(index + 1) / total}
      artifactKey={step.id}
      data-step={step.id}
    >
      <StepStage id={step.id} />
    </StageFrame>
  )
}

export default HowItWorks
