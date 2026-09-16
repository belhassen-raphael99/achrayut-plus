import { useState } from 'react'
import PageIntro from '../../components/site/PageIntro/PageIntro.jsx'
import TextField from '../../components/ui/TextField/TextField.jsx'
import SelectField from '../../components/ui/SelectField/SelectField.jsx'
import FormErrorSummary from '../../components/ui/FormErrorSummary/FormErrorSummary.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import SuccessState from '../../components/ui/SuccessState/SuccessState.jsx'
import TextLink from '../../components/ui/TextLink/TextLink.jsx'
import Container from '../../components/layout/Container/Container.jsx'
import { contactSubjects } from '../../data/site.js'
import { photos } from '../../data/photos.js'
import { INVALID_EMAIL_MESSAGE, isEmpty, isValidEmail } from '../../utils/validation.js'
import { useValidatedForm } from '../../utils/useValidatedForm.js'
import './SitePages.css'

const EMPTY_FORM = { name: '', email: '', subject: contactSubjects[0], message: '' }

function validate(values) {
  const errors = {}
  if (isEmpty(values.name)) errors.name = 'צריך למלא שם.'
  if (isEmpty(values.email)) errors.email = 'צריך למלא כתובת אימייל.'
  else if (!isValidEmail(values.email)) errors.email = INVALID_EMAIL_MESSAGE
  if (isEmpty(values.message)) errors.message = 'צריך לכתוב הודעה.'
  return errors
}

/** יצירת קשר (S6) ומצב «ההודעה נשלחה» (S7) */
function ContactPage() {
  const [sentTo, setSentTo] = useState(null)
  const { values, errors, errorCount, formRef, handleChange, handleSubmit } = useValidatedForm(
    EMPTY_FORM,
    validate,
  )

  // שלב 6: אין שרת, ההודעה לא נשלחת באמת. השליחה תחובר בשלב 8.
  const onValid = (validValues) => setSentTo(validValues.email.trim())

  if (sentTo) {
    return (
      <>
        <title>ההודעה נשלחה · אחריות+</title>
        <Container width="reading" className="site-page">
          <SuccessState
            titleAs="h1"
            title="ההודעה נשלחה"
            action={
              <TextLink to="/" arrow={false}>
                חזרה לדף הבית
              </TextLink>
            }
          >
            <p>
              קיבלנו את ההודעה ונחזור אליכם אל <bdi dir="ltr">{sentTo}</bdi> תוך 2 ימי עסקים.
            </p>
          </SuccessState>
        </Container>
      </>
    )
  }

  return (
    <>
      <title>יצירת קשר · אחריות+</title>
      <PageIntro title="יצירת קשר" tone="dark" photo={photos.kitchenCouple} overlap width="reading">
        <p className="page-intro__text">נשמח לעזור. נחזור אליכם תוך 2 ימי עסקים.</p>
      </PageIntro>

      <Container width="reading" className="contact-page">
        <form
          ref={formRef}
          className="site-form contact-page__card"
          noValidate
          onSubmit={handleSubmit(onValid)}
          data-reveal="lift"
        >
          <FormErrorSummary count={errorCount} />
          <TextField
            label="שם"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
          />
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
          <SelectField
            label="נושא"
            name="subject"
            options={contactSubjects}
            value={values.subject}
            onChange={handleChange}
          />
          <TextField
            label="הודעה"
            name="message"
            multiline
            rows={5}
            value={values.message}
            onChange={handleChange}
            error={errors.message}
          />
          <Button type="submit" variant="primary" fullWidth>
            שליחה
          </Button>
        </form>
      </Container>
    </>
  )
}

export default ContactPage
