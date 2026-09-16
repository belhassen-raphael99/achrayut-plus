import Icon from '../../ui/Icon/Icon.jsx'
import './AnalysisSteps.css'

/**
 * שלבי קריאת החשבונית (N4, FR-2.4, DESIGN.md §7.15): פס מקטעים ורשימת שלבים — הושלם · עכשיו · ממתין.
 * בלי אחוזים ובלי ספינר. current = מספר השלב הנוכחי (מ־0).
 */
function AnalysisSteps({ steps, current }) {
  return (
    <div className="analysis-steps">
      <div className="analysis-steps__bar" aria-hidden="true">
        {steps.map((step, index) => (
          <span
            key={step}
            className={['analysis-steps__segment', index <= current && 'analysis-steps__segment--filled']
              .filter(Boolean)
              .join(' ')}
          />
        ))}
      </div>

      <ol className="analysis-steps__list">
        {steps.map((step, index) => {
          const state = index < current ? 'done' : index === current ? 'current' : 'pending'
          return (
            <li
              key={step}
              className={`analysis-steps__step analysis-steps__step--${state}`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              {state === 'done' ? (
                <Icon name="check_circle" className="analysis-steps__icon" />
              ) : (
                <span className="analysis-steps__marker" aria-hidden="true" />
              )}
              <span>{step}</span>
              {state === 'done' && <span className="visually-hidden"> (הושלם)</span>}
            </li>
          )
        })}
      </ol>

      <p className="visually-hidden" role="status">
        {steps[current]}
      </p>
    </div>
  )
}

export default AnalysisSteps
