import { useNavigate } from 'react-router'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import RadioCards from '../../components/ui/RadioCards/RadioCards.jsx'
import TextField from '../../components/ui/TextField/TextField.jsx'
import FormErrorSummary from '../../components/ui/FormErrorSummary/FormErrorSummary.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import { useAppData } from '../../data/useAppData.js'
import { SPACE_TYPES } from '../../data/lists.js'
import { isEmpty } from '../../utils/validation.js'
import { useValidatedForm } from '../../utils/useValidatedForm.js'
import '../app/AppPages.css'
import './OnboardingPages.css'

const EMPTY_FORM = { type: '', name: '' }

// סוג המרחב ושם — שניהם חובה (FR-1.4)
function validate(values) {
  const errors = {}
  if (!values.type) errors.type = 'צריך לבחור את סוג המרחב.'
  if (isEmpty(values.name)) errors.name = 'צריך לתת שם למרחב.'
  return errors
}

/** יצירת מרחב (O2). בסיום → הדשבורד של המרחב החדש, שעוד אין בו מכשירים (D2) */
function CreateSpacePage() {
  const navigate = useNavigate()
  const { spaces, createSpace } = useAppData()
  const { values, errors, errorCount, formRef, handleChange, handleSubmit } = useValidatedForm(
    EMPTY_FORM,
    validate,
  )

  function onValid(formValues) {
    createSpace(formValues)
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="onboarding-page">
      <title>מרחב חדש · אחריות+</title>
      <PageHeader title="מרחב חדש" back={spaces.length > 0 ? '/dashboard' : '/onboarding'} />

      <form ref={formRef} className="app-form app-form--plate" noValidate onSubmit={handleSubmit(onValid)}>
        <FormErrorSummary count={errorCount} />
        <RadioCards
          legend="סוג המרחב"
          name="type"
          options={SPACE_TYPES}
          value={values.type}
          onChange={handleChange}
          error={errors.type}
        />
        <TextField
          label="שם המרחב"
          name="name"
          autoComplete="off"
          helper="למשל: משפחת כהן, הדירות בתל אביב"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />
        <Button type="submit" variant="primary" fullWidth>
          יצירת המרחב
        </Button>
      </form>
    </div>
  )
}

export default CreateSpacePage
