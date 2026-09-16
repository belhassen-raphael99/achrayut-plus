import { errorSummary } from '../../../utils/validation.js'
import './FormErrorSummary.css'

/** שורה בראש הטופס: «יש X שדות לתיקון» (DESIGN.md §7.3). מוכרזת לקוראי מסך */
function FormErrorSummary({ count }) {
  if (count === 0) return null

  return (
    <p className="form-error-summary" role="alert">
      {errorSummary(count)}
    </p>
  )
}

export default FormErrorSummary
