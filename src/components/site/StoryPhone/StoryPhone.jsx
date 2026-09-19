import './StoryPhone.css'

/**
 * מסגרת טלפון לפרקים 3 ו־4 (DESIGN.md §14.5): בתוכה רכיבים אמיתיים של האפליקציה, לא צילום מסך מזויף.
 * איור בלבד (aria-hidden): הפרק שסביבו נותן את המשמעות במילים.
 */
function StoryPhone({ className, screenClassName, children }) {
  return (
    <div className={['story-phone', 'site-glass', className].filter(Boolean).join(' ')} aria-hidden="true">
      <div className={['story-phone__screen', screenClassName].filter(Boolean).join(' ')}>{children}</div>
    </div>
  )
}

export default StoryPhone
