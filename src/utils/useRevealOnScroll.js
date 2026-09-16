import { useEffect } from 'react'

/**
 * חושף אזורים בזמן שהם נכנסים למסך (DESIGN.md §10).
 * IntersectionObserver בלבד; אין מאזין scroll, כי הוא רץ בכל פריים ותוקע את הטלפון.
 *
 * שני שלבים בכוונה:
 * 1. «חימוש» מיד, באופן סינכרוני — כדי שהמצב המוסתר ייכנס כבר לציור הראשון ולא יהיה הבהוב.
 * 2. «צפייה» פריים אחד אחר כך — כדי שהדפדפן יספיק לצייר את המצב המוסתר, ואז יהיה מעבר.
 *    השלב השני לא נשען רק על requestAnimationFrame: בלשונית מוסתרת הוא מושהה, ולכן יש גם טיימר.
 *
 * רשתות ביטחון, כי תוכן נסתר הוא התקלה היחידה שאסור שתקרה:
 * - **מצב הבסיס גלוי.** ההסתרה חיה רק בתוך keyframe; בלי JS או בלי אטריביוט הכול נראה.
 * - **רשת ב־CSS**: reveal-failsafe מחזיר אלמנט מוסתר אחרי 5 שניות מעצמו. זו אנימציה,
 *   לא טיימר, ולכן שום ניקוי של effect לא יכול לבטל אותה.
 * - MutationObserver תופס תוכן שמגיע מאוחר (אחרי טעינה, גיליון, מעבר עמוד).
 * - לשונית מוסתרת: לא מסתירים בכלל. הדפדפן מקפיא שם טיימרים ו־observers, ואין למי להנפיש.
 * - אלמנט שהוסתר ולא נחשף תוך REVEAL_TIMEOUT נחשף גם מה־JS.
 *
 * אזהרה שנלמדה ב־16/09/2026: ב־StrictMode הפיתוח מריץ את ה־effect פעמיים
 * (mount → cleanup → mount). arm() **חייב** להיות אידמפוטנטי ולחדש צפייה על אלמנט
 * שכבר מסומן armed; אחרת הריצה השנייה יוצאת מוקדם, אף אחד לא צופה, והתוכן נשאר מוסתר.
 *
 * המצב נשמר ב־data-reveal-state ולא ב־className: React מנהל את ה־className של האלמנטים האלה,
 * וכל render היה מוחק מחלקה שהוספנו מהקוד. ב־data-* הוא לא נוגע.
 *
 * שימוש: קוראים לזה פעם אחת בפריסה, ומסמנים אזורים ב־data-reveal.
 * רצף: style={{ '--reveal-index': 1 }} על כל פריט.
 */

const REVEAL_TIMEOUT = 3000
const OBSERVE_FALLBACK = 60

function useRevealOnScroll() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /** מנפישים רק כשיש למי, ורק כשהדפדפן באמת מריץ טיימרים ו־observers */
    const shouldAnimate = () => !reduceMotion && document.visibilityState === 'visible'
    const timers = new Map()
    const pending = new Set()
    let watching = false

    function reveal(element) {
      element.dataset.revealState = 'revealed'
      pending.delete(element)
      clearTimeout(timers.get(element))
      timers.delete(element)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          reveal(entry.target)
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
    )

    function watch(element) {
      timers.set(
        element,
        setTimeout(() => {
          reveal(element)
          observer.unobserve(element)
        }, REVEAL_TIMEOUT),
      )
      observer.observe(element)
    }

    /** שלב 1: מסתיר. סינכרוני, לפני הציור הראשון. אידמפוטנטי — ראו האזהרה למעלה */
    function arm(element) {
      if (element.dataset.revealState === 'revealed') return

      // לשונית ברקע: לא מסתירים בכלל, ולכן גם לא מסמנים
      if (!shouldAnimate()) {
        delete element.dataset.revealState
        return
      }

      element.dataset.revealState = 'armed'

      // אלמנט שכבר מסומן armed אבל אין לו צופה (למשל אחרי cleanup של StrictMode) מקבל צופה חדש
      if (!watching) pending.add(element)
      else if (!timers.has(element)) watch(element)
    }

    function scan(root) {
      if (root.nodeType !== 1) return
      if (root.hasAttribute('data-reveal')) arm(root)
      root.querySelectorAll('[data-reveal]').forEach(arm)
    }

    scan(document.body)

    /** שלב 2: מתחיל לצפות. פריים אחד, או טיימר אם הלשונית מוסתרת */
    function startWatching() {
      if (watching) return
      watching = true
      pending.forEach(watch)
      pending.clear()
    }

    const frame = requestAnimationFrame(startWatching)
    const fallback = setTimeout(startWatching, OBSERVE_FALLBACK)

    // תוכן שמגיע מאוחר: אחרי טעינה, בגיליון, או במעבר בין עמודים
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach(scan))
    })
    mutations.observe(document.body, { childList: true, subtree: true })

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(fallback)
      mutations.disconnect()
      observer.disconnect()
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [])
}

export default useRevealOnScroll
