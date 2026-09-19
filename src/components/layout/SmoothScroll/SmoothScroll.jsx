import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap, ScrollTrigger } from '../../../utils/siteMotion.js'

/**
 * גלילה חלקה בגלגלת (DESIGN.md §14.8.1): Lenis מעדכן את ScrollTrigger, והשעון של GSAP מריץ את Lenis.
 * לא במגע (בטלפון הגלילה טבעית) ולא ב־prefers-reduced-motion.
 */
function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches
    if (reduce || touch) return

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    const tick = (time) => lenis.raf(time * 1000)

    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
    }
  }, [])

  return null
}

export default SmoothScroll
