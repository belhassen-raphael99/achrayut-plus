import Sheet from '../../ui/Sheet/Sheet.jsx'
import RadioChips from '../../ui/RadioChips/RadioChips.jsx'
import TextField from '../../ui/TextField/TextField.jsx'
import Switch from '../../ui/Switch/Switch.jsx'
import Button from '../../ui/Button/Button.jsx'
import TextButton from '../../ui/TextButton/TextButton.jsx'
import FormErrorSummary from '../../ui/FormErrorSummary/FormErrorSummary.jsx'
import { CONTACT_TYPES } from '../../../data/lists.js'
import { INVALID_EMAIL_MESSAGE, isEmpty, isValidEmail } from '../../../utils/validation.js'
import { useValidatedForm } from '../../../utils/useValidatedForm.js'
import './ContactSheet.css'

// שם חובה, ולפחות טלפון או אימייל (FR-3.5)
function validate(values) {
  const errors = {}
  if (isEmpty(values.name)) errors.name = 'צריך להזין שם.'
  if (isEmpty(values.phone) && isEmpty(values.email)) errors.phone = 'צריך להזין טלפון או אימייל.'
  if (!isEmpty(values.email) && !isValidEmail(values.email)) errors.email = INVALID_EMAIL_MESSAGE
  return errors
}

/**
 * הוספה או עריכה של איש קשר (F10, FR-3.5). איש קשר אחד לכל סוג: סוג שכבר קיים במכשיר לא זמין.
 * contact ריק → איש קשר חדש. הרכיב נבנה מחדש בכל פתיחה (key בעמוד), כדי שהטופס יתחיל נקי.
 */
function ContactSheet({ open, onClose, appliance, contact, onSave, onDelete }) {
  const takenTypes = appliance.contacts.filter((item) => item.id !== contact?.id).map((item) => item.type)
  const typeOptions = CONTACT_TYPES.map((type) => ({ ...type, disabled: takenTypes.includes(type.id) }))
  const firstFreeType = typeOptions.find((type) => !type.disabled)?.id ?? ''

  const { values, errors, errorCount, formRef, handleChange, handleSubmit } = useValidatedForm(
    {
      type: contact?.type ?? firstFreeType,
      name: contact?.name ?? '',
      phone: contact?.phone ?? '',
      email: contact?.email ?? '',
      website: contact?.website ?? '',
      note: contact?.note ?? '',
      primary: contact?.primary ?? appliance.contacts.length === 0,
    },
    validate,
  )

  function onValid(formValues) {
    onSave({
      id: contact?.id,
      type: formValues.type,
      name: formValues.name.trim(),
      phone: formValues.phone.trim(),
      email: formValues.email.trim(),
      website: formValues.website.trim(),
      note: formValues.note.trim(),
      primary: formValues.primary,
    })
  }

  return (
    <Sheet open={open} onClose={onClose} title="איש קשר">
      <form ref={formRef} className="contact-sheet" noValidate onSubmit={handleSubmit(onValid)}>
        <FormErrorSummary count={errorCount} />
        <RadioChips legend="סוג" name="type" options={typeOptions} value={values.type} onChange={handleChange} />
        <TextField label="שם" name="name" autoComplete="off" value={values.name} onChange={handleChange} error={errors.name} />
        <TextField
          label="טלפון"
          name="phone"
          type="tel"
          dir="ltr"
          inputMode="tel"
          autoComplete="off"
          value={values.phone}
          onChange={handleChange}
          error={errors.phone}
        />
        <TextField
          label="אימייל"
          name="email"
          type="email"
          dir="ltr"
          inputMode="email"
          autoComplete="off"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <TextField
          label="אתר"
          name="website"
          type="url"
          dir="ltr"
          inputMode="url"
          autoComplete="off"
          helper="לא חובה"
          value={values.website}
          onChange={handleChange}
        />
        <TextField label="הערה" name="note" autoComplete="off" helper="לא חובה" value={values.note} onChange={handleChange} />
        <Switch label="איש הקשר הראשי" name="primary" checked={values.primary} onChange={handleChange} />

        <div className="contact-sheet__actions">
          <Button type="submit" variant="primary" fullWidth>
            שמירה
          </Button>
          {contact && (
            <TextButton className="text-button--danger" onClick={() => onDelete(contact.id)}>
              מחיקת איש הקשר
            </TextButton>
          )}
        </div>
      </form>
    </Sheet>
  )
}

export default ContactSheet
