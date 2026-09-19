/*
 * התנועה של האתר הציבורי (DESIGN.md §14.8): GSAP + ScrollTrigger + SplitText.
 * נטען רק עם דף הבית (פיצול קוד ב־App.jsx), אף פעם לא באפליקציה.
 * כלל: GSAP ו־Motion לא נפגשים באותו רכיב.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

// בטלפון שינוי גובה של שורת הכתובת לא מחשב מחדש את כל ההצמדות (§14.8.5)
ScrollTrigger.config({ ignoreMobileResize: true })

/** שלושת המצבים של gsap.matchMedia (§14.8.1). reduce: שום timeline לא נוצר */
export const MEDIA = {
  desktop: '(prefers-reduced-motion: no-preference) and (min-width: 1024px)',
  compact: '(prefers-reduced-motion: no-preference) and (max-width: 1023px)',
}

/** העקומות של §14.8.2, בשמות של GSAP */
export const EASE = {
  out: 'expo.out',
  inOut: 'power4.inOut',
  settle: 'power3.out',
}

/** השהיה בין הגלילה לתנועה: במחשב חלקה, במגע צמודה */
export const SCRUB = {
  desktop: 0.6,
  touch: true,
}

/** אורכי ההצמדה (§14.4 site-scroll), ביחידות של ScrollTrigger */
export const PIN = {
  short: '+=150%',
  signature: '+=300%',
}

/** ממשתנה CSS במילישניות לשניות של GSAP */
export function cssSeconds(element, name) {
  const value = getComputedStyle(element).getPropertyValue(name).trim()
  return value.endsWith('ms') ? parseFloat(value) / 1000 : parseFloat(value) || 0
}

/** מספר ממשתנה CSS (למשל --site-word-dim) */
export function cssNumber(element, name) {
  return parseFloat(getComputedStyle(element).getPropertyValue(name)) || 0
}

/** כיוון התנועה «קדימה» בשורה: ב־RTL תזוזה לסוף השורה היא x שלילי (§14.11) */
export function inlineSign() {
  return document.documentElement.dir === 'rtl' ? -1 : 1
}

/**
 * מסמן את הפרק כמכוריאוגרף בזמן שהמצב פעיל, ומחזיר את הניקוי.
 * ה־CSS של המצב המונפש חי תחת .is-motion; בלעדיו הפרק מוצג במצב הסופי והקריא (§14.8.7).
 */
export function markMotion(element) {
  element.classList.add('is-motion')
  return () => element.classList.remove('is-motion')
}

/**
 * רשת הביטחון של §14.8.7: אם בניית ה־timeline נכשלת, מחזירים הכול לגלוי ולא משאירים חצי־הסתרה.
 */
export function safely(element, build) {
  try {
    return build()
  } catch (error) {
    element.classList.remove('is-motion')
    // רק מה ש־GSAP נוגע בו: לא למחוק סגנונות ש־React שם (למשל object-position של צילום)
    gsap.set(element.querySelectorAll('*'), {
      clearProps: 'transform,opacity,clipPath,visibility,scale,rotate,translate',
    })
    console.error('story motion failed', error)
    return undefined
  }
}

export { gsap, ScrollTrigger, SplitText, useGSAP }
