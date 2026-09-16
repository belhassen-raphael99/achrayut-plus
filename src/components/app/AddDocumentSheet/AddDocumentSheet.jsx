import { useState } from 'react'
import Sheet from '../../ui/Sheet/Sheet.jsx'
import RadioChips from '../../ui/RadioChips/RadioChips.jsx'
import ActionRow from '../../ui/ActionRow/ActionRow.jsx'
import Notice from '../../ui/Notice/Notice.jsx'
import { DOCUMENT_TYPES } from '../../../data/lists.js'
import { toISODate, today } from '../../../utils/dates.js'
import { isAcceptedUpload } from '../../../utils/files.js'
import { createId } from '../../../utils/ids.js'
import './AddDocumentSheet.css'

/**
 * הוספת מסמך (F12, FR-3.6): סוג המסמך, ואז צילום או העלאת קובץ. תמונה או PDF עד 10MB.
 * defaultType: הסוג שנבחר מראש (למשל «חשבונית» מהקישור «הוספת חשבונית»).
 */
function AddDocumentSheet({ open, onClose, onAdd, defaultType = 'invoice' }) {
  const [type, setType] = useState(defaultType)
  const [error, setError] = useState('')

  function handleFile(file) {
    if (!isAcceptedUpload(file)) {
      setError('אי אפשר להעלות את הקובץ הזה. אפשר להעלות תמונה או PDF עד 10MB.')
      return
    }
    onAdd({ id: createId('document'), type, uploadedAt: toISODate(today()), sizeBytes: file.size })
  }

  return (
    <Sheet open={open} onClose={onClose} title="הוספת מסמך">
      <div className="add-document-sheet">
        <RadioChips
          legend="סוג המסמך"
          name="documentType"
          options={DOCUMENT_TYPES}
          value={type}
          onChange={(event) => setType(event.target.value)}
        />
        <ul className="add-document-sheet__list">
          <li>
            <ActionRow
              icon="photo_camera"
              title="צילום"
              fileInput={{ accept: 'image/*', capture: 'environment', onFile: handleFile }}
            />
          </li>
          <li>
            <ActionRow icon="upload_file" title="העלאת קובץ" fileInput={{ accept: 'image/*,application/pdf', onFile: handleFile }} />
          </li>
        </ul>
        <p className="add-document-sheet__helper">תמונה או PDF עד 10MB</p>
        {error && <Notice tone="error">{error}</Notice>}
      </div>
    </Sheet>
  )
}

export default AddDocumentSheet
