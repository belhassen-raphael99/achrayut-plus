import { useState } from 'react'
import { useSearchParams } from 'react-router'
import AuthCard from '../../components/auth/AuthCard/AuthCard.jsx'
import PasswordField from '../../components/ui/PasswordField/PasswordField.jsx'
import StrengthMeter from '../../components/ui/StrengthMeter/StrengthMeter.jsx'
import FormErrorSummary from '../../components/ui/FormErrorSummary/FormErrorSummary.jsx'
import StateMessage from '../../components/ui/StateMessage/StateMessage.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import { MIN_PASSWORD_LENGTH, SHORT_PASSWORD_MESSAGE } from '../../utils/validation.js'
import { useValidatedForm } from '../../utils/useValidatedForm.js'
import './AuthPages.css'

const EMPTY_FORM = { password: '', confirm: '' }

function validate(values) {
  const errors = {}
  if (values.password === '') errors.password = 'צריך להזין סיסמה חדשה.'
  else if (values.password.length < MIN_PASSWORD_LENGTH) errors.password = SHORT_PASSWORD_MESSAGE
  if (values.confirm === '') errors.confirm = 'צריך להקליד את הסיסמה פעם נוספת.'
  else if (values.confirm !== values.password) {
    errors.confirm = 'הסיסמאות לא זהות. הקלידו את אותה סיסמה בשני השדות.'
  }
  return errors
}

/**
 * סיסמה חדשה (A14, A15), «הסיסמה עודכנה» (A17), קישור שפג (A16). FR-1.3.
 * ?status=expired → A16
 */
function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const [done, setDone] = useState(false)
  const { values, errors, errorCount, formRef, handleChange, handleSubmit } = useValidatedForm(
    EMPTY_FORM,
    validate,
  )

  if (searchParams.get('status') === 'expired') {
    return (
      <>
        <title>קישור האיפוס כבר לא בתוקף · אחריות+</title>
        <AuthCard>
          <StateMessage
            icon="link_off"
            tone="neutral"
            title="קישור האיפוס כבר לא בתוקף"
            actions={
              <Button variant="primary" to="/forgot-password" fullWidth>
                בקשת קישור חדש
              </Button>
            }
          >
            <p>מטעמי אבטחה הקישור תקף לזמן מוגבל. בקשו קישור חדש.</p>
          </StateMessage>
        </AuthCard>
      </>
    )
  }

  if (done) {
    return (
      <>
        <title>הסיסמה עודכנה · אחריות+</title>
        <AuthCard>
          <StateMessage
            icon="check_circle"
            tone="success"
            title="הסיסמה עודכנה"
            focusOnMount
            actions={
              <Button variant="primary" to="/login" fullWidth>
                להתחברות
              </Button>
            }
          >
            <p>מטעמי אבטחה התנתקנו מכל שאר המכשירים. אפשר להתחבר עם הסיסמה החדשה.</p>
          </StateMessage>
        </AuthCard>
      </>
    )
  }

  // שלב 6: אין שרת, הסיסמה לא נשמרת באמת
  const onValid = () => setDone(true)

  return (
    <>
      <title>סיסמה חדשה · אחריות+</title>
      <AuthCard title="סיסמה חדשה">
        <form ref={formRef} className="auth-form" noValidate onSubmit={handleSubmit(onValid)}>
          <FormErrorSummary count={errorCount} />
          <PasswordField
            label="סיסמה חדשה"
            name="password"
            autoComplete="new-password"
            helper={`לפחות ${MIN_PASSWORD_LENGTH} תווים`}
            value={values.password}
            onChange={handleChange}
            error={errors.password}
          >
            <StrengthMeter password={values.password} />
          </PasswordField>
          <PasswordField
            label="אימות הסיסמה"
            name="confirm"
            autoComplete="new-password"
            value={values.confirm}
            onChange={handleChange}
            error={errors.confirm}
          />
          <Button type="submit" variant="primary" fullWidth className="auth-form__submit">
            שמירת הסיסמה
          </Button>
        </form>
      </AuthCard>
    </>
  )
}

export default ResetPasswordPage
