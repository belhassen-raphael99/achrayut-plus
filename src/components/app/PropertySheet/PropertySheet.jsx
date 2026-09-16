import Sheet from '../../ui/Sheet/Sheet.jsx'
import TextField from '../../ui/TextField/TextField.jsx'
import Button from '../../ui/Button/Button.jsx'
import { isEmpty } from '../../../utils/validation.js'
import { useValidatedForm } from '../../../utils/useValidatedForm.js'

// שם נכס: חובה, עד 40 תווים, בלי כפילות במרחב (FR-7.2)
const MAX_NAME_LENGTH = 40

/**
 * הוספת נכס או שינוי השם שלו (X1). property = הנכס שמשנים לו שם; בלי property — נכס חדש.
 * otherNames: שמות שאר הנכסים במרחב, לבדיקת כפילות. key חדש בכל פתיחה מאפס את הטופס.
 */
function PropertySheet({ open, onClose, property, otherNames, onSave }) {
  const { values, errors, formRef, handleChange, handleSubmit } = useValidatedForm(
    { name: property?.name ?? '' },
    (formValues) => {
      const name = formValues.name.trim()
      if (isEmpty(name)) return { name: 'צריך לתת שם לנכס.' }
      if (name.length > MAX_NAME_LENGTH) return { name: `שם הנכס יכול להיות עד ${MAX_NAME_LENGTH} תווים.` }
      if (otherNames.some((other) => other.trim() === name)) return { name: 'כבר יש נכס בשם הזה' }
      return {}
    },
  )

  return (
    <Sheet open={open} onClose={onClose} title={property ? 'שינוי שם' : 'הוספת נכס'}>
      <form ref={formRef} className="app-form" noValidate onSubmit={handleSubmit((formValues) => onSave(formValues.name))}>
        <TextField
          label="שם הנכס"
          name="name"
          autoComplete="off"
          helper="למשל: הרצל 12, הדירה באילת"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />
        <Button type="submit" variant="primary" fullWidth>
          {property ? 'שמירה' : 'הוספה'}
        </Button>
      </form>
    </Sheet>
  )
}

export default PropertySheet
