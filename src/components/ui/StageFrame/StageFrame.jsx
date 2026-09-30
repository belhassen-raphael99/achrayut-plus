import './StageFrame.css'

/**
 * הבמה: מסגרת כהה, רשת מדידה, ושכבת HUD ב־mono.
 * code: תווית ה־HUD (אופציונלית; בלי תווית אין שכבת HUD בכלל) · counter: «01 / 04» (אופציונלי) · progress: 0–1 לפס בתחתית (אופציונלי)
 * artifactKey: כשהוא משתנה, האובייקט נכנס מחדש (transform בלבד).
 * איור בלבד — ההורה מסמן aria-hidden, והטקסט שלידו נושא את המשמעות.
 */
function StageFrame({ code, counter, progress, artifactKey, className, children, ...rest }) {
  return (
    <div className={['stage', className].filter(Boolean).join(' ')} {...rest}>
      {(code || counter) && (
        <div className="stage__hud stage__hud--top" dir="ltr">
          {code && (
            <span className="stage__code">
              <span className="stage__dot" />
              {code}
            </span>
          )}
          {counter && <span>{counter}</span>}
        </div>
      )}

      <div className="stage__scene">
        <div key={artifactKey} className="stage__artifact">
          {children}
        </div>
      </div>

      {progress !== undefined && (
        <div className="stage__hud stage__hud--bottom" dir="ltr">
          <span className="stage__track">
            <span className="stage__track-fill" style={{ '--stage-progress': progress }} />
          </span>
        </div>
      )}
    </div>
  )
}

export default StageFrame
