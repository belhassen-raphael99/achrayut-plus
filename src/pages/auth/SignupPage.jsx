import { Link, useNavigate } from 'react-router'
import AuthCard from '../../components/auth/AuthCard/AuthCard.jsx'
import GoogleButton from '../../components/ui/GoogleButton/GoogleButton.jsx'
import TextDivider from '../../components/ui/TextDivider/TextDivider.jsx'
import TextField from '../../components/ui/TextField/TextField.jsx'
import PasswordField from '../../components/ui/PasswordField/PasswordField.jsx'
import StrengthMeter from '../../components/ui/StrengthMeter/StrengthMeter.jsx'
import Checkbox from '../../components/ui/Checkbox/Checkbox.jsx'
import FormErrorSummary from '../../components/ui/FormErrorSummary/FormErrorSummary.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import {
  EMPTY_EMAIL_MESSAGE,
  EMPTY_PASSWORD_MESSAGE,
  INVALID_EMAIL_MESSAGE,
  MIN_PASSWORD_LENGTH,
  SHORT_PASSWORD_MESSAGE,
  isEmpty,
  isValidEmail,
} from '../../utils/validation.js'
import { useValidatedForm } from '../../utils/useValidatedForm.js'
import { NEW_DEMO_USER_ID } from '../../data/fakeAuth.js'
import { useAppData } from '../../data/useAppData.js'
import './AuthPages.css'

const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '', terms: false }

// סדר הבדיקות = סדר השדות בטופס, כדי שהפוקוס יעבור לשדה השגוי הראשון
function validate(values) {
  const errors = {}
  if (isEmpty(values.firstName)) errors.firstName = 'צריך להזין שם פרטי.'
  if (isEmpty(values.lastName)) errors.lastName = 'צריך להזין שם משפחה.'
  if (isEmpty(values.email)) errors.email = EMPTY_EMAIL_MESSAGE
  else if (!isValidEmail(values.email)) errors.email = INVALID_EMAIL_MESSAGE
  if (values.password === '') errors.password = EMPTY_PASSWORD_MESSAGE
  else if (values.password.length < MIN_PASSWORD_LENGTH) errors.password = SHORT_PASSWORD_MESSAGE
  if (!values.terms) errors.terms = 'כדי ליצור חשבון צריך לאשר את תנאי השימוש ומדיניות הפרטיות.'
  return errors
}

/** הרשמה (A7, A8, FR-1.1) */
function SignupPage() {
  const navigate = useNavigate()
  const { signIn } = useAppData()
  const { values, errors, errorCount, formRef, handleChange, handleSubmit } = useValidatedForm(
    EMPTY_FORM,
    validate,
  )

  // שלב 6: אין שרת. אחרי הרשמה באימייל → «בדקו את תיבת המייל» (A9)
  function onValid({ email }) {
    navigate(`/check-email?email=${encodeURIComponent(email.trim())}`)
  }

  // שלב 6: Google מדומה. משתמש חדש → כניסה ראשונה
  function handleGoogle() {
    signIn(NEW_DEMO_USER_ID)
    navigate('/onboarding')
  }

  return (
    <>
      <title>הרשמה · אחריות+</title>
      <AuthCard title="הרשמה">
        <GoogleButton onClick={handleGoogle} />
        <TextDivider />

        <form ref={formRef} className="auth-form" noValidate onSubmit={handleSubmit(onValid)}>
          <FormErrorSummary count={errorCount} />

          <div className="auth-form__row">
            <TextField
              label="שם פרטי"
              name="firstName"
              autoComplete="given-name"
              value={values.firstName}
              onChange={handleChange}
              error={errors.firstName}
            />
            <TextField
              label="שם משפחה"
              name="lastName"
              autoComplete="family-name"
              value={values.lastName}
              onChange={handleChange}
              error={errors.lastName}
            />
          </div>
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
          <PasswordField
            label="סיסמה"
            name="password"
            autoComplete="new-password"
            helper={`לפחות ${MIN_PASSWORD_LENGTH} תווים`}
            value={values.password}
            onChange={handleChange}
            error={errors.password}
          >
            <StrengthMeter password={values.password} />
          </PasswordField>
          <Checkbox
            name="terms"
            checked={values.terms}
            onChange={handleChange}
            error={errors.terms}
            label={
              <>
                מסכימ/ה ל
                <a href="/terms" target="_blank" rel="noreferrer">
                  תנאי השימוש
                  <span className="visually-hidden"> (נפתח בכרטיסייה חדשה)</span>
                </a>{' '}
                ול
                <a href="/privacy" target="_blank" rel="noreferrer">
                  מדיניות הפרטיות
                  <span className="visually-hidden"> (נפתח בכרטיסייה חדשה)</span>
                </a>
              </>
            }
          />
          <Button type="submit" variant="primary" fullWidth className="auth-form__submit">
            יצירת חשבון
          </Button>
        </form>
      </AuthCard>

      <p className="auth-links">
        כבר יש לכם חשבון? <Link to="/login">התחברות</Link>
      </p>
    </>
  )
}

export default SignupPage
