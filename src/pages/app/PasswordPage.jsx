import { useNavigate } from 'react-router'
import AppPage from '../../components/layout/AppPage/AppPage.jsx'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import FormErrorSummary from '../../components/ui/FormErrorSummary/FormErrorSummary.jsx'
import PasswordField from '../../components/ui/PasswordField/PasswordField.jsx'
import StrengthMeter from '../../components/ui/StrengthMeter/StrengthMeter.jsx'
import { DEMO_PASSWORD } from '../../data/fakeAuth.js'
import { MIN_PASSWORD_LENGTH, SHORT_PASSWORD_MESSAGE } from '../../utils/validation.js'
import { useValidatedForm } from '../../utils/useValidatedForm.js'
import './AppPages.css'

const EMPTY_FORM = { current: '', password: '', confirm: '' }

// שלב 6: הסיסמה הנוכחית נבדקת מול סיסמת חשבונות הדוגמה. בשלב 8 הבדיקה בשרת (Supabase Auth)
function validate(values) {
  const errors = {}
  if (values.current === '') errors.current = 'צריך להזין את הסיסמה הנוכחית.'
  else if (values.current !== DEMO_PASSWORD) errors.current = 'הסיסמה הנוכחית לא נכונה.'
  if (values.password === '') errors.password = 'צריך להזין סיסמה חדשה.'
  else if (values.password.length < MIN_PASSWORD_LENGTH) errors.password = SHORT_PASSWORD_MESSAGE
  if (values.confirm === '') errors.confirm = 'צריך להקליד את הסיסמה פעם נוספת.'
  else if (values.confirm !== values.password) {
    errors.confirm = 'הסיסמאות לא זהות. הקלידו את אותה סיסמה בשני השדות.'
  }
  return errors
}

/** שינוי סיסמה (P3, FR-1.9): הסיסמה הנוכחית, חדשה עם מד חוזק, ואימות. השינוי מנתק את שאר המכשירים */
function PasswordPage() {
  const navigate = useNavigate()
  const { values, errors, errorCount, formRef, handleChange, handleSubmit } = useValidatedForm(EMPTY_FORM, validate)

  function onValid() {
    navigate('/settings', { replace: true, state: { toast: 'הסיסמה עודכנה. התנתקתם מכל שאר המכשירים.' } })
  }

  return (
    <AppPage width="reading">
      <title>סיסמה · אחריות+</title>
      <PageHeader title="סיסמה" back="/settings" />

      <form ref={formRef} className="app-form app-form--plate" noValidate onSubmit={handleSubmit(onValid)}>
        <FormErrorSummary count={errorCount} />
        <PasswordField
          label="הסיסמה הנוכחית"
          name="current"
          autoComplete="current-password"
          value={values.current}
          onChange={handleChange}
          error={errors.current}
        />
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
        <p className="app-page__lead">אחרי השינוי נתנתק מכל שאר המכשירים.</p>
        <Button type="submit" variant="primary" fullWidth>
          עדכון הסיסמה
        </Button>
      </form>
    </AppPage>
  )
}

export default PasswordPage
