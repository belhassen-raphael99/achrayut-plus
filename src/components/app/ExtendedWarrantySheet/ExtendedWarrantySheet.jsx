import { useState } from 'react'
import Sheet from '../../ui/Sheet/Sheet.jsx'
import TextField from '../../ui/TextField/TextField.jsx'
import FilePicker from '../../ui/FilePicker/FilePicker.jsx'
import Button from '../../ui/Button/Button.jsx'
import Notice from '../../ui/Notice/Notice.jsx'
import FormErrorSummary from '../../ui/FormErrorSummary/FormErrorSummary.jsx'
import { toISODate, today } from '../../../utils/dates.js'
import { formatFileSize, isAcceptedUpload } from '../../../utils/files.js'
import { createId } from '../../../utils/ids.js'
import { isEmpty } from '../../../utils/validation.js'
import { useValidatedForm } from '../../../utils/useValidatedForm.js'
import './ExtendedWarrantySheet.css'

// מי נותן, התחלה, סיום מאוחר מההתחלה; התעודה לא חובה (FR-3.3)
function validate(values) {
  const errors = {}
  if (isEmpty(values.provider)) errors.provider = 'צריך לכתוב מי נותן את האחריות המורחבת.'
  if (!values.start) errors.start = 'צריך להזין את תאריך ההתחלה.'
  if (!values.end) errors.end = 'צריך להזין את תאריך הסיום.'
  else if (values.start && values.end <= values.start) errors.end = 'תאריך הסיום צריך להיות אחרי תאריך ההתחלה.'
  return errors
}

/** הוספת אחריות מורחבת (F11, FR-3.3). התו סופר מעכשיו עד סוף האחריות המורחבת */
function ExtendedWarrantySheet({ open, onClose, onSave }) {
  const [certificate, setCertificate] = useState(null)
  const [fileError, setFileError] = useState('')
  const { values, errors, errorCount, formRef, handleChange, handleSubmit } = useValidatedForm(
    { provider: '', start: '', end: '' },
    validate,
  )

  function pickCertificate(file) {
    if (!isAcceptedUpload(file)) {
      setCertificate(null)
      setFileError('אי אפשר להעלות את הקובץ הזה. אפשר להעלות תמונה או PDF עד 10MB.')
      return
    }
    setFileError('')
    setCertificate(file)
  }

  function onValid(formValues) {
    onSave(
      { provider: formValues.provider.trim(), start: formValues.start, end: formValues.end, source: certificate ? 'certificate' : 'manual' },
      certificate
        ? { id: createId('document'), type: 'warranty', uploadedAt: toISODate(today()), sizeBytes: certificate.size }
        : null,
    )
  }

  return (
    <Sheet open={open} onClose={onClose} title="אחריות מורחבת">
      <form ref={formRef} className="extended-sheet" noValidate onSubmit={handleSubmit(onValid)}>
        <FormErrorSummary count={errorCount} />
        <TextField
          label="מי נותן את האחריות"
          name="provider"
          autoComplete="off"
          value={values.provider}
          onChange={handleChange}
          error={errors.provider}
        />
        <div className="extended-sheet__row">
          <TextField label="תאריך התחלה" name="start" type="date" value={values.start} onChange={handleChange} error={errors.start} />
          <TextField label="תאריך סיום" name="end" type="date" value={values.end} onChange={handleChange} error={errors.end} />
        </div>

        <FilePicker variant="secondary" icon="upload_file" accept="image/*,application/pdf" onFile={pickCertificate} fullWidth className="extended-sheet__upload">
          {certificate ? 'החלפת תעודת האחריות המורחבת' : 'הוספת תעודת האחריות המורחבת'}
        </FilePicker>
        {certificate && (
          <p className="extended-sheet__file">
            <bdi>{certificate.name}</bdi> · {formatFileSize(certificate.size)}
          </p>
        )}
        {fileError && <Notice tone="error">{fileError}</Notice>}

        <Button type="submit" variant="primary" fullWidth>
          שמירה
        </Button>
      </form>
    </Sheet>
  )
}

export default ExtendedWarrantySheet
