import { useState } from 'react'
import { useNavigate } from 'react-router'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import RadioCards from '../../components/ui/RadioCards/RadioCards.jsx'
import TextField from '../../components/ui/TextField/TextField.jsx'
import FormErrorSummary from '../../components/ui/FormErrorSummary/FormErrorSummary.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import Notice from '../../components/ui/Notice/Notice.jsx'
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

  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)

  async function onValid(formValues) {
    setFailed(false)
    setPending(true)
    try {
      await createSpace(formValues)
      navigate('/dashboard', { replace: true })
    } catch {
      setFailed(true)
      setPending(false)
    }
  }

  return (
    <div className="onboarding-page">
      <title>מרחב חדש · אחריות+</title>
      <PageHeader title="מרחב חדש" back={spaces.length > 0 ? '/dashboard' : '/onboarding'} />

      <form ref={formRef} className="app-form app-form--plate" noValidate onSubmit={handleSubmit(onValid)}>
        <FormErrorSummary count={errorCount} />
        {failed && <Notice tone="error">לא הצלחנו ליצור את המרחב כרגע. אפשר לנסות שוב בעוד רגע.</Notice>}
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
        <Button type="submit" variant="primary" fullWidth disabled={pending}>
          {pending ? 'יוצרים…' : 'יצירת המרחב'}
        </Button>
      </form>
    </div>
  )
}

export default CreateSpacePage
