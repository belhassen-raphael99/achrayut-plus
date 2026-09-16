import { useState } from 'react'
import { Link } from 'react-router'
import AuthCard from '../../components/auth/AuthCard/AuthCard.jsx'
import TextField from '../../components/ui/TextField/TextField.jsx'
import StateMessage from '../../components/ui/StateMessage/StateMessage.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import {
  EMPTY_EMAIL_MESSAGE,
  INVALID_EMAIL_MESSAGE,
  isEmpty,
  isValidEmail,
} from '../../utils/validation.js'
import { useValidatedForm } from '../../utils/useValidatedForm.js'
import './AuthPages.css'

const EMPTY_FORM = { email: '' }

function validate(values) {
  const errors = {}
  if (isEmpty(values.email)) errors.email = EMPTY_EMAIL_MESSAGE
  else if (!isValidEmail(values.email)) errors.email = INVALID_EMAIL_MESSAGE
  return errors
}

/**
 * שכחתי סיסמה (A12) ו«הקישור נשלח» (A13, FR-1.3).
 * אותה הודעה בדיוק גם כשאין חשבון עם האימייל: לא מגלים מי רשום.
 */
function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [resent, setResent] = useState(false)
  const { values, errors, formRef, handleChange, handleSubmit } = useValidatedForm(EMPTY_FORM, validate)

  // שלב 6: אין שליחה אמיתית
  const onValid = () => setSent(true)

  return (
    <>
      <title>שכחתי סיסמה · אחריות+</title>
      <AuthCard title="שכחתי סיסמה">
        {sent ? (
          <StateMessage
            icon="mail"
            tone="info"
            focusOnMount={false}
            actions={
              <Button variant="secondary" fullWidth onClick={() => setResent(true)}>
                שליחה שוב
              </Button>
            }
          >
            <p role="status">
              אם יש חשבון עם האימייל הזה, שלחנו אליו קישור לאיפוס. הקישור תקף לזמן מוגבל.
            </p>
            {resent && (
              <p className="auth-status" role="status">
                שלחנו שוב.
              </p>
            )}
          </StateMessage>
        ) : (
          <>
            <p>הזינו את האימייל שלכם ונשלח אליכם קישור לאיפוס הסיסמה.</p>
            <form ref={formRef} className="auth-form" noValidate onSubmit={handleSubmit(onValid)}>
              <TextField
                label="אימייל"
                name="email"
                type="email"
                dir="ltr"
                inputMode="email"
                autoComplete="email"
                value={values.email}
                onChange={handleChange}
                error={errors.email}
              />
              <Button type="submit" variant="primary" fullWidth className="auth-form__submit">
                שליחת קישור
              </Button>
            </form>
          </>
        )}
      </AuthCard>

      <p className="auth-links">
        <Link to="/login">חזרה להתחברות</Link>
      </p>
    </>
  )
}

export default ForgotPasswordPage
