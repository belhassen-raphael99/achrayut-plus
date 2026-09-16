import { useNavigate } from 'react-router'
import AppPage from '../../components/layout/AppPage/AppPage.jsx'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import Avatar from '../../components/ui/Avatar/Avatar.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import Chip from '../../components/ui/Chip/Chip.jsx'
import FormErrorSummary from '../../components/ui/FormErrorSummary/FormErrorSummary.jsx'
import TextField from '../../components/ui/TextField/TextField.jsx'
import { useAppData } from '../../data/useAppData.js'
import { isEmpty } from '../../utils/validation.js'
import { useValidatedForm } from '../../utils/useValidatedForm.js'
import './AppPages.css'

function validate(values) {
  const errors = {}
  if (isEmpty(values.firstName)) errors.firstName = 'צריך להזין שם פרטי.'
  if (isEmpty(values.lastName)) errors.lastName = 'צריך להזין שם משפחה.'
  return errors
}

/** עריכת פרופיל (P2, FR-1.9): שם וטלפון. האימייל משמש להתחברות, ולכן לקריאה בלבד */
function ProfilePage() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAppData()
  const { values, errors, errorCount, formRef, handleChange, handleSubmit } = useValidatedForm(
    { firstName: user.firstName, lastName: user.lastName, phone: user.phone },
    validate,
  )

  function onValid(formValues) {
    updateProfile({
      firstName: formValues.firstName.trim(),
      lastName: formValues.lastName.trim(),
      phone: formValues.phone.trim(),
    })
    navigate('/settings', { replace: true, state: { toast: 'הפרופיל נשמר' } })
  }

  return (
    <AppPage width="reading">
      <title>פרופיל · אחריות+</title>
      <PageHeader title="פרופיל" back="/settings" />

      <form ref={formRef} className="app-form app-form--plate" noValidate onSubmit={handleSubmit(onValid)}>
        <FormErrorSummary count={errorCount} />
        <div className="profile__avatar">
          <Avatar name={values.firstName || user.firstName} size="lg" />
        </div>
        <div className="app-form__row">
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
          label={
            <span className="app-form__label">
              אימייל
              {user.googleConnected && <Chip tone="role">מחובר עם Google</Chip>}
            </span>
          }
          name="email"
          type="email"
          dir="ltr"
          value={user.email}
          readOnly
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
        <Button type="submit" variant="primary" fullWidth>
          שמירה
        </Button>
      </form>
    </AppPage>
  )
}

export default ProfilePage
