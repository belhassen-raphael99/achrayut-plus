import { useEffect } from 'react'
import { useLocation } from 'react-router'

/**
 * מעבר עמוד → חזרה לראש הדף. קישור עם עוגן (#) → גלילה אל האזור.
 * גלילה חלקה רק אם המשתמש לא ביקש להפחית אנימציות.
 */
function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (target) {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash])

  return null
}

export default ScrollManager
