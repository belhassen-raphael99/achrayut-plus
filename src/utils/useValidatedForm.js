import { useRef, useState } from 'react'

/**
 * מצב משותף לטפסים עם בדיקות: ערכים, שגיאות, ניקוי השגיאה של שדה בזמן ההקלדה,
 * ופוקוס לשדה השגוי הראשון בשליחה (DESIGN.md §7.3).
 * validate(values) מחזיר אובייקט { שם השדה: הודעת שגיאה }, בסדר השדות בטופס.
 */
export function useValidatedForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const formRef = useRef(null)

  function handleChange(event) {
    const { name, type, value, checked } = event.target
    setValues((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }))
    setErrors((previous) => {
      if (!previous[name]) return previous
      const next = { ...previous }
      delete next[name]
      return next
    })
  }

  /** מחזיר את ה־onSubmit של הטופס; onValid נקרא רק כשאין שגיאות */
  function handleSubmit(onValid) {
    return (event) => {
      event.preventDefault()
      const nextErrors = validate(values)
      setErrors(nextErrors)

      const firstInvalid = Object.keys(nextErrors)[0]
      if (firstInvalid) {
        // קבוצת רדיו מחזירה RadioNodeList: הפוקוס עובר לכפתור הראשון בקבוצה
        const field = formRef.current?.elements.namedItem(firstInvalid)
        const target = field instanceof RadioNodeList ? field[0] : field
        target?.focus()
        return
      }

      onValid(values)
    }
  }

  return {
    values,
    errors,
    errorCount: Object.keys(errors).length,
    formRef,
    handleChange,
    handleSubmit,
  }
}
