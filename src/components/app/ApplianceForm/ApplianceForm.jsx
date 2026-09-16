import { useId } from 'react'
import TextField from '../../ui/TextField/TextField.jsx'
import SelectField from '../../ui/SelectField/SelectField.jsx'
import RadioChips from '../../ui/RadioChips/RadioChips.jsx'
import Switch from '../../ui/Switch/Switch.jsx'
import Chip from '../../ui/Chip/Chip.jsx'
import Button from '../../ui/Button/Button.jsx'
import FormErrorSummary from '../../ui/FormErrorSummary/FormErrorSummary.jsx'
import { CATEGORIES, ROOMS } from '../../../data/lists.js'
import { DURATION_OPTIONS, validateApplianceForm } from '../../../utils/applianceForm.js'
import { toISODate, today } from '../../../utils/dates.js'
import { useValidatedForm } from '../../../utils/useValidatedForm.js'
import './ApplianceForm.css'

/** תווית שדה עם תג «לבדוק» / «משוער לפי קטגוריה» לידה (FR-2.5) */
function labelWithChip(text, chip) {
  if (!chip) return text
  return (
    <span className="appliance-form__label">
      {text}
      <Chip tone="verify">{chip}</Chip>
    </span>
  )
}

/**
 * טופס המכשיר (N11, N12, N5, N13, ובהמשך F8). מקטעים עם כותרות: המכשיר · רכישה · אחריות.
 * verify: { שם שדה: טקסט התג } · purchaseDateHelper: הסבר מתחת לתאריך (N13) · children: מעל הטופס (החשבונית המוקטנת)
 * אנשי קשר ומסמכים נוספים מוסיפים בכרטיס המכשיר אחרי השמירה; המוכר נשמר כאיש קשר.
 * showSeller=false בעריכה (F8): המוכר כבר איש קשר, ונערך בכרטיס.
 */
function ApplianceForm({
  initialValues,
  verify = {},
  purchaseDateHelper,
  showSeller = true,
  submitLabel,
  onSubmit,
  children,
}) {
  const titleId = useId()
  const { values, errors, errorCount, formRef, handleChange, handleSubmit } = useValidatedForm(
    initialValues,
    validateApplianceForm,
  )
  const maxDate = toISODate(today())

  return (
    <form ref={formRef} className="appliance-form" noValidate onSubmit={handleSubmit(onSubmit)}>
      <FormErrorSummary count={errorCount} />
      {children}

      <section className="appliance-form__section" aria-labelledby={`${titleId}-device`}>
        <h2 id={`${titleId}-device`} className="appliance-form__title">
          המכשיר
        </h2>
        <TextField
          label={labelWithChip('שם המכשיר', verify.name)}
          name="name"
          autoComplete="off"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />
        <SelectField
          label={labelWithChip('קטגוריה', verify.category)}
          name="category"
          value={values.category}
          onChange={handleChange}
          options={[{ value: '', label: 'בחרו קטגוריה' }, ...CATEGORIES.map((item) => ({ value: item.id, label: item.label }))]}
        />
        <div className="appliance-form__row">
          <TextField
            label={labelWithChip('מותג', verify.brand)}
            name="brand"
            autoComplete="off"
            value={values.brand}
            onChange={handleChange}
          />
          <TextField
            label={labelWithChip('דגם', verify.model)}
            name="model"
            dir="ltr"
            autoComplete="off"
            spellCheck={false}
            value={values.model}
            onChange={handleChange}
          />
        </div>
        <TextField
          label={labelWithChip('מספר סידורי', verify.serial)}
          name="serial"
          dir="ltr"
          autoComplete="off"
          spellCheck={false}
          helper="לא חובה"
          value={values.serial}
          onChange={handleChange}
        />
        <SelectField
          label="חדר"
          name="room"
          value={values.room}
          onChange={handleChange}
          options={[{ value: '', label: 'בחרו חדר' }, ...ROOMS.map((item) => ({ value: item.id, label: item.label }))]}
        />
      </section>

      <section className="appliance-form__section" aria-labelledby={`${titleId}-purchase`}>
        <h2 id={`${titleId}-purchase`} className="appliance-form__title">
          רכישה
        </h2>
        <TextField
          label={labelWithChip('תאריך רכישה', verify.purchaseDate)}
          name="purchaseDate"
          type="date"
          max={maxDate}
          helper={purchaseDateHelper}
          value={values.purchaseDate}
          onChange={handleChange}
          error={errors.purchaseDate}
        />
        {showSeller && (
          <TextField
            label={labelWithChip('מוכר', verify.seller)}
            name="seller"
            autoComplete="off"
            value={values.seller}
            onChange={handleChange}
          />
        )}
      </section>

      <section className="appliance-form__section" aria-labelledby={`${titleId}-warranty`}>
        <h2 id={`${titleId}-warranty`} className="appliance-form__title">
          אחריות
        </h2>
        <RadioChips
          legend={labelWithChip('משך האחריות', verify.duration)}
          name="duration"
          options={DURATION_OPTIONS}
          value={values.duration}
          onChange={handleChange}
          helper="לא בטוחים? נציג משך משוער לפי הקטגוריה ונסמן אותו כמשוער."
        />
        {values.duration === 'other' && (
          <TextField
            label="משך האחריות בחודשים"
            name="customMonths"
            dir="ltr"
            inputMode="numeric"
            autoComplete="off"
            value={values.customMonths}
            onChange={handleChange}
            error={errors.customMonths}
          />
        )}
        <Switch
          label="יש אחריות מורחבת"
          name="hasExtended"
          checked={values.hasExtended}
          onChange={handleChange}
        />
        {values.hasExtended && (
          <div className="appliance-form__group">
            <TextField
              label="מי נותן את האחריות"
              name="extendedProvider"
              autoComplete="off"
              value={values.extendedProvider}
              onChange={handleChange}
              error={errors.extendedProvider}
            />
            <div className="appliance-form__row">
              <TextField
                label="תאריך התחלה"
                name="extendedStart"
                type="date"
                value={values.extendedStart}
                onChange={handleChange}
                error={errors.extendedStart}
              />
              <TextField
                label="תאריך סיום"
                name="extendedEnd"
                type="date"
                value={values.extendedEnd}
                onChange={handleChange}
                error={errors.extendedEnd}
              />
            </div>
          </div>
        )}
      </section>

      <div className="appliance-form__submit">
        <Button type="submit" variant="primary" fullWidth>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default ApplianceForm
