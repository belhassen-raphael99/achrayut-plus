import { BatteryFull, CellSignalFull, WifiHigh } from '@phosphor-icons/react'
import './StoryPhone.css'

/**
 * טלפון מלא לפרקים 3 ו־4 (DESIGN.md §14.5): מסגרת טיטניום, מסגרת שחורה, אי דינמי, שורת מצב,
 * כפתורי צד ופס בית. בתוכו רכיבים אמיתיים של האפליקציה, לא צילום מסך מזויף.
 * איור בלבד (aria-hidden): הפרק שסביבו נותן את המשמעות במילים.
 *
 * המבנה: .story-phone = הגוף והגודל · __bezel = הזכוכית השחורה · __display = המסך עצמו
 * · __screen = אזור התוכן (screenClassName מגיע אליו, כמו קודם).
 */
function StoryPhone({ className, screenClassName, children }) {
  return (
    <div className={['story-phone', className].filter(Boolean).join(' ')} aria-hidden="true">
      <span className="story-phone__button story-phone__button--action" />
      <span className="story-phone__button story-phone__button--up" />
      <span className="story-phone__button story-phone__button--down" />
      <span className="story-phone__button story-phone__button--power" />

      <div className="story-phone__bezel">
        <div className="story-phone__display">
          <div className="story-phone__status" dir="ltr">
            <span className="story-phone__time">9:41</span>
            <span className="story-phone__signals">
              <CellSignalFull weight="fill" />
              <WifiHigh weight="bold" />
              <BatteryFull weight="fill" />
            </span>
          </div>
          <div className={['story-phone__screen', screenClassName].filter(Boolean).join(' ')}>{children}</div>
          <span className="story-phone__glare" />
        </div>
        <span className="story-phone__island" />
        <span className="story-phone__home" />
      </div>
    </div>
  )
}

export default StoryPhone
