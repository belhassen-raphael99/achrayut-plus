import Icon from '../../ui/Icon/Icon.jsx'
import IconButton from '../../ui/IconButton/IconButton.jsx'
import { DOCUMENT_TYPES, findById } from '../../../data/lists.js'
import { parseISODate } from '../../../utils/dates.js'
import { formatDate } from '../../../utils/format.js'
import './DocumentRow.css'

/** מסמך בכרטיס המכשיר (F1, DESIGN.md §7.13): סוג ותאריך, וכפתור צפייה (F7) */
function DocumentRow({ applianceId, document }) {
  const type = findById(DOCUMENT_TYPES, document.type)

  return (
    <div className="document-row">
      <span className="document-row__icon" aria-hidden="true">
        <Icon name="description" />
      </span>
      <p className="document-row__title">
        {type?.label} · {formatDate(parseISODate(document.uploadedAt))}
      </p>
      <IconButton
        icon="visibility"
        to={`/appliances/${applianceId}/documents/${document.id}`}
        label={`צפייה ב${type?.label ?? 'מסמך'}`}
      />
    </div>
  )
}

export default DocumentRow
