import { useEffect } from 'react'
import { useLocation } from 'react-router'

/**
 * מעבר עמוד → חזרה לראש הדף. קישור עם עוגן (#) → גלילה אל האזור.
 * גלילה חלקה רק אם המשתמש לא ביקש להפחית אנימציות.
 */
function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }

    /*
     * דף הבית נטען בפיצול קוד, ולכן העוגן («איך זה עובד») עוד לא קיים ברגע המעבר.
     * מחפשים אותו במשך שנייה; אם הוא לא מגיע — חוזרים לראש העמוד (נמדד 18/09: קישור מת מעמוד פנימי).
     */
    const id = decodeURIComponent(hash.slice(1))
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const deadline = Date.now() + 1000
    let frame = 0

    const look = () => {
      const target = document.getElementById(id)
      if (target) {
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
        return
      }
      if (Date.now() < deadline) {
        frame = requestAnimationFrame(look)
        return
      }
      window.scrollTo({ top: 0, behavior: 'auto' })
    }

    look()
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])

  return null
}

export default ScrollManager
