import { useEffect, useState } from 'react'

const INTRO_KEY = 'achrayut-dashboard-intro'

function shouldAnimate() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    return sessionStorage.getItem(INTRO_KEY) !== 'done'
  } catch {
    return false
  }
}

/**
 * האנימציה של הדשבורד רצה רק בכניסה הראשונה בסשן, ולא כשהמשתמש ביקש להפחית תנועה (DESIGN.md §10).
 * הקריאה נעשית פעם אחת, והסימון נכתב אחרי שהרכיב הוצג.
 */
export function useDashboardIntro() {
  const [animate] = useState(shouldAnimate)

  useEffect(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, 'done')
    } catch {
      // בלי sessionStorage האנימציה פשוט תחזור בביקור הבא
    }
  }, [])

  return animate
}
