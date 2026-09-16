import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import AuthCard from '../../components/auth/AuthCard/AuthCard.jsx'
import GoogleButton from '../../components/ui/GoogleButton/GoogleButton.jsx'
import TextDivider from '../../components/ui/TextDivider/TextDivider.jsx'
import TextField from '../../components/ui/TextField/TextField.jsx'
import PasswordField from '../../components/ui/PasswordField/PasswordField.jsx'
import FormErrorSummary from '../../components/ui/FormErrorSummary/FormErrorSummary.jsx'
import Notice from '../../components/ui/Notice/Notice.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import TextLink from '../../components/ui/TextLink/TextLink.jsx'
import { fakeLogin, isLoginLocked, lockRemainingMs, safeNextPath } from '../../data/fakeAuth.js'
import { useAppData } from '../../data/useAppData.js'
import {
  EMPTY_EMAIL_MESSAGE,
  EMPTY_PASSWORD_MESSAGE,
  INVALID_EMAIL_MESSAGE,
  isEmpty,
  isValidEmail,
} from '../../utils/validation.js'
import { useValidatedForm } from '../../utils/useValidatedForm.js'
import './AuthPages.css'

const EMPTY_FORM = { email: '', password: '' }

function validate(values) {
  const errors = {}
  if (isEmpty(values.email)) errors.email = EMPTY_EMAIL_MESSAGE
  else if (!isValidEmail(values.email)) errors.email = INVALID_EMAIL_MESSAGE
  if (values.password === '') errors.password = EMPTY_PASSWORD_MESSAGE
  return errors
}

/**
 * התחברות (A1–A6, A20 במחשב, FR-1.2).
 * ?error=google → A6 · ?next=/נתיב → חזרה לאותו עמוד אחרי ההתחברות (FR-5.4)
 */
function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { signIn } = useAppData()
  // אחרי «מחיקת החשבון» בהגדרות (P6, FR-1.9)
  const accountDeleted = location.state?.accountDeleted === true
  const next = safeNextPath(searchParams.get('next'))
  const googleFailed = searchParams.get('error') === 'google'

  // null · wrong (A2) · locked (A4) · unverified (A5)
  const [status, setStatus] = useState(() => (isLoginLocked() ? 'locked' : null))
  const [linkResent, setLinkResent] = useState(false)
  const { values, errors, errorCount, formRef, handleChange, handleSubmit } = useValidatedForm(
    EMPTY_FORM,
    validate,
  )

  // כשהחסימה מסתיימת, כפתור «התחברות» חוזר בלי לרענן את הדף (FR-1.2: חסימה ל־5 דקות, לא לתמיד)
  useEffect(() => {
    if (status !== 'locked') return undefined
    const timer = setTimeout(() => setStatus(null), lockRemainingMs())
    return () => clearTimeout(timer)
  }, [status])

  function handleFieldChange(event) {
    handleChange(event)
    if (status === 'wrong') setStatus(null)
  }

  function onValid({ email, password }) {
    const result = fakeLogin(email, password)

    if (result.status === 'success') {
      // משתמש בלי מרחב מועבר מהדשבורד לכניסה הראשונה (AppShell)
      signIn(result.userId)
      navigate(next ?? '/dashboard', { replace: true })
    } else if (result.status === 'disabled') {
      navigate('/account-disabled', { replace: true })
    } else {
      setLinkResent(false)
      setStatus(result.status)
    }
  }

  // שלב 6: אין Google אמיתי. חשבון הדוגמה של נועה נכנס ישר.
  function handleGoogle() {
    signIn('noa')
    navigate(next ?? '/dashboard', { replace: true })
  }

  const email = values.email.trim()
  const signupLink = next ? `/signup?next=${encodeURIComponent(next)}` : '/signup'

  return (
    <>
      <title>התחברות · אחריות+</title>
      <AuthCard title="התחברות">
        {accountDeleted && (
          <Notice tone="info" icon="check_circle">
            החשבון נמחק. שלחנו אליכם אימייל אישור.
          </Notice>
        )}
        {googleFailed && (
          <Notice tone="info">ההתחברות עם Google לא הושלמה. אפשר לנסות שוב, או להתחבר עם אימייל.</Notice>
        )}
        <GoogleButton onClick={handleGoogle} />
        <TextDivider />

        <form ref={formRef} className="auth-form" noValidate onSubmit={handleSubmit(onValid)}>
          <FormErrorSummary count={errorCount} />

          {status === 'wrong' && (
            <Notice tone="error">האימייל או הסיסמה לא נכונים. נסו שוב או אפסו את הסיסמה.</Notice>
          )}

          {status === 'unverified' && (
            <Notice
              tone="info"
              icon="mail"
              action={
                <Button variant="secondary" onClick={() => setLinkResent(true)}>
                  שליחת הקישור שוב
                </Button>
              }
            >
              {linkResent ? (
                <>
                  שלחנו קישור חדש אל <bdi dir="ltr">{email}</bdi>.
                </>
              ) : (
                <>
                  צריך לאמת את האימייל לפני שמתחברים. שלחנו קישור אל <bdi dir="ltr">{email}</bdi>.
                </>
              )}
            </Notice>
          )}

          <TextField
            label="אימייל"
            name="email"
            type="email"
            dir="ltr"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={handleFieldChange}
            error={errors.email}
            invalid={status === 'wrong'}
          />
          <PasswordField
            label="סיסמה"
            name="password"
            autoComplete="current-password"
            value={values.password}
            onChange={handleFieldChange}
            error={errors.password}
            invalid={status === 'wrong'}
          />
          <TextLink to="/forgot-password" arrow={false} className="auth-form__forgot">
            שכחתי סיסמה
          </TextLink>

          {status === 'locked' ? (
            <>
              <Notice tone="warning" icon="schedule" title="יותר מדי ניסיונות התחברות">
                מטעמי אבטחה, אפשר לנסות שוב בעוד 5 דקות. אפשר גם לאפס את הסיסמה.
              </Notice>
              <Button variant="primary" to="/forgot-password" fullWidth>
                איפוס סיסמה
              </Button>
            </>
          ) : (
            <Button type="submit" variant="primary" fullWidth className="auth-form__submit">
              התחברות
            </Button>
          )}
        </form>
      </AuthCard>

      <p className="auth-links">
        אין לכם חשבון? <Link to={signupLink}>הרשמה</Link>
      </p>
    </>
  )
}

export default LoginPage
