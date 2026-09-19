import { useState } from 'react'
import PageIntro from '../../components/site/PageIntro/PageIntro.jsx'
import TextField from '../../components/ui/TextField/TextField.jsx'
import FormErrorSummary from '../../components/ui/FormErrorSummary/FormErrorSummary.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import SuccessState from '../../components/ui/SuccessState/SuccessState.jsx'
import TextLink from '../../components/ui/TextLink/TextLink.jsx'
import Container from '../../components/layout/Container/Container.jsx'
import { INVALID_EMAIL_MESSAGE, isEmpty, isValidEmail } from '../../utils/validation.js'
import { useValidatedForm } from '../../utils/useValidatedForm.js'
import './SitePages.css'

const EMPTY_FORM = { fullName: '', email: '', phone: '' }

function validate(values) {
  const errors = {}
  if (isEmpty(values.fullName)) errors.fullName = 'צריך למלא שם מלא.'
  if (isEmpty(values.email)) errors.email = 'צריך למלא את האימייל של החשבון.'
  else if (!isValidEmail(values.email)) errors.email = INVALID_EMAIL_MESSAGE
  return errors
}

/**
 * ביטול מנוי, עמוד ציבורי (S10). חובה לפי סעיף 14ט לחוק הגנת הצרכן:
 * אפשר לבטל גם בלי להתחבר. ההסכם מסתיים תוך 3 ימי עסקים (סעיף 13ד).
 */
function CancelSubscriptionPage() {
  const [sentTo, setSentTo] = useState(null)
  const { values, errors, errorCount, formRef, handleChange, handleSubmit } = useValidatedForm(
    EMPTY_FORM,
    validate,
  )

  // שלב 6: אין שרת, הבקשה לא נשלחת באמת. תחובר בשלב 8.
  const onValid = (validValues) => setSentTo(validValues.email.trim())

  if (sentTo) {
    return (
      <>
        <title>בקשת הביטול התקבלה · אחריות+</title>
        <Container width="reading" className="site-page">
          <SuccessState
            titleAs="h1"
            title="בקשת הביטול התקבלה"
            action={
              <TextLink to="/" arrow={false}>
                חזרה לדף הבית
              </TextLink>
            }
          >
            <p>
              נשלח אישור אל <bdi dir="ltr">{sentTo}</bdi>. הביטול נכנס לתוקף תוך 3 ימי עסקים, ולא
              תחויבו יותר.
            </p>
          </SuccessState>
        </Container>
      </>
    )
  }

  return (
    <>
      <title>ביטול מנוי · אחריות+</title>
      <PageIntro title="ביטול מנוי" width="reading">
        <p className="page-intro__text">
          אפשר לבטל את המנוי בכל רגע. הביטול נכנס לתוקף תוך 3 ימי עסקים, ולא תחויבו יותר.
        </p>
      </PageIntro>

      <Container width="reading" className="site-page cancel-page">
        <section className="cancel-page__option" aria-labelledby="cancel-signed-in-title">
          <h2 id="cancel-signed-in-title" className="cancel-page__option-title site-display">
            מחוברים לחשבון?
          </h2>
          <Button variant="primary" to="/login">
            לביטול בחשבון
          </Button>
        </section>

        <section className="cancel-page__option" aria-labelledby="cancel-without-login-title">
          <h2 id="cancel-without-login-title" className="cancel-page__option-title site-display">
            ביטול בלי להתחבר
          </h2>
          <form ref={formRef} className="site-form" noValidate onSubmit={handleSubmit(onValid)}>
            <FormErrorSummary count={errorCount} />
            <TextField
              label="שם מלא"
              name="fullName"
              autoComplete="name"
              value={values.fullName}
              onChange={handleChange}
              error={errors.fullName}
            />
            <TextField
              label="אימייל של החשבון"
              name="email"
              type="email"
              dir="ltr"
              inputMode="email"
              autoComplete="email"
              value={values.email}
              onChange={handleChange}
              error={errors.email}
            />
            <TextField
              label="טלפון"
              name="phone"
              type="tel"
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
              helper="לא חובה"
              value={values.phone}
              onChange={handleChange}
            />
            <Button type="submit" variant="secondary" fullWidth>
              שליחת בקשת ביטול
            </Button>
          </form>
        </section>
      </Container>
    </>
  )
}

export default CancelSubscriptionPage
