import { useEffect, useState } from 'react'

/** משך האנימציה נקרא ממשתנה ה־CSS, כדי שלא יהיה ערך קשיח בקוד (DESIGN.md §10: 600ms) */
function animationDuration() {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--motion-duration-long')
  return Number.parseFloat(value) || 0
}

/** מספר שסופר מ־0 עד target, עם האטה בסוף. enabled=false → הערך הסופי מיד */
export function useCountUp(target, enabled) {
  const [value, setValue] = useState(enabled ? 0 : target)

  useEffect(() => {
    if (!enabled) return undefined

    const duration = animationDuration()
    const start = performance.now()
    let frame

    function tick(now) {
      const progress = duration > 0 ? Math.min(1, (now - start) / duration) : 1
      setValue(Math.round(target * (1 - (1 - progress) ** 3)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, enabled])

  return enabled ? value : target
}
