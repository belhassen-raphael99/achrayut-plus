import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import AppPage from '../../components/layout/AppPage/AppPage.jsx'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import Dialog from '../../components/ui/Dialog/Dialog.jsx'
import FilePicker from '../../components/ui/FilePicker/FilePicker.jsx'
import Icon from '../../components/ui/Icon/Icon.jsx'
import IconButton from '../../components/ui/IconButton/IconButton.jsx'
import Notice from '../../components/ui/Notice/Notice.jsx'
import Toast from '../../components/ui/Toast/Toast.jsx'
import { useAppData } from '../../data/useAppData.js'
import { signedDocumentUrl } from '../../data/api.js'
import { DOCUMENT_TYPES, findById } from '../../data/lists.js'
import { parseISODate } from '../../utils/dates.js'
import { dataUrlToFile, renderDocumentImage } from '../../utils/documentImage.js'
import { formatFileSize, isAcceptedUpload } from '../../utils/files.js'
import { formatDate } from '../../utils/format.js'
import './AppPages.css'

/**
 * צפייה במסמך (F7 · FR-3.6): הגדלה, הורדה, שיתוף, החלפת קובץ, מחיקה עם אישור.
 * בצפייה בלבד: רק הורדה ושיתוף (FR-3.8).
 * הקובץ נפתח דרך קישור חתום ל־5 דקות מהדלי הפרטי (docs/07 §8). תמונה מוצגת; PDF נפתח בכרטיסייה.
 */
function DocumentViewerPage() {
  const { applianceId, documentId } = useParams()
  const navigate = useNavigate()
  const { appliances, isViewer, replaceDocument, deleteDocument } = useAppData()
  const [zoomed, setZoomed] = useState(false)
  const [toast, setToast] = useState(null)
  const [fileError, setFileError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  // אחרי מחיקה המסמך כבר לא קיים: לא מפנים שוב, כדי לא לדרוס את המעבר לכרטיס עם ההודעה «המסמך נמחק»
  const [deleted, setDeleted] = useState(false)

  const appliance = appliances.find((item) => item.id === applianceId)
  const document = appliance?.documents.find((item) => item.id === documentId)
  const type = findById(DOCUMENT_TYPES, document?.type)
  const uploadedAt = document ? formatDate(parseISODate(document.uploadedAt)) : ''
  const seller = appliance?.contacts.find((item) => item.type === 'seller')?.name

  const [links, setLinks] = useState({ path: null, view: null, download: null })
  const storagePath = document?.storagePath ?? null
  const isImage = document?.mimeType?.startsWith('image/') ?? false

  // קישור חדש לכל קובץ (גם אחרי «החלפת קובץ», כי הקישור הישן מצביע על אותו נתיב עם גרסה קודמת)
  useEffect(() => {
    if (!storagePath) return undefined
    let active = true
    const name = document.fileName || 'document'
    Promise.all([signedDocumentUrl(storagePath), signedDocumentUrl(storagePath, name)]).then(([view, download]) => {
      if (active) setLinks({ path: `${storagePath}@${document.uploadedAt}@${document.sizeBytes}`, view, download })
    })
    return () => {
      active = false
    }
  }, [storagePath, document?.fileName, document?.uploadedAt, document?.sizeBytes])

  const current = links.path === `${storagePath}@${document?.uploadedAt}@${document?.sizeBytes}` ? links : null

  // בלי קובץ ב־Storage (או PDF): דף שמצויר מנתוני המוצר, כדי שהמסך לא יהיה ריק
  const placeholderUrl = useMemo(() => {
    if (!document) return null
    return renderDocumentImage({
      title: type?.label ?? 'מסמך',
      lines: [appliance.name, [appliance.brand, appliance.model].filter(Boolean).join(' '), seller, `תאריך: ${uploadedAt}`].filter(Boolean),
    })
  }, [document, type, appliance, seller, uploadedAt])

  const imageUrl = isImage && current?.view ? current.view : placeholderUrl

  if (!appliance) return <Navigate to="/appliances" replace />
  if (!document) return deleted ? null : <Navigate to={`/appliances/${appliance.id}`} replace />

  const title = `${type?.label} · ${appliance.name}`
  const fileName = document.fileName || `${type?.label} - ${appliance.name}.png`

  async function share() {
    const file = current?.view
      ? new File([await (await fetch(current.view)).blob()], fileName, { type: document.mimeType })
      : await dataUrlToFile(placeholderUrl, fileName)
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title })
      } catch {
        // המשתמש סגר את חלון השיתוף
      }
      return
    }
    try {
      await navigator.clipboard.writeText(window.location.href)
      setToast('הקישור הועתק')
    } catch {
      setToast('אי אפשר לשתף מהדפדפן הזה')
    }
  }

  async function replaceFile(file) {
    if (!isAcceptedUpload(file)) {
      setFileError('אי אפשר להעלות את הקובץ הזה. אפשר להעלות תמונה או PDF עד 10MB.')
      return
    }
    setFileError('')
    try {
      await replaceDocument(appliance.id, document.id, { file })
      setToast('הקובץ הוחלף')
    } catch (error) {
      console.error('החלפת הקובץ נכשלה', error)
      setFileError('לא הצלחנו להחליף את הקובץ כרגע. אפשר לנסות שוב.')
    }
  }

  async function handleDelete() {
    setConfirmOpen(false)
    try {
      setDeleted(true)
      await deleteDocument(appliance.id, document.id)
      navigate(`/appliances/${appliance.id}`, { replace: true, state: { toast: 'המסמך נמחק' } })
    } catch (error) {
      console.error('המחיקה נכשלה', error)
      setDeleted(false)
      setToast('לא הצלחנו למחוק את המסמך כרגע.')
    }
  }

  return (
    <AppPage width="reading">
      <title>{`${title} · אחריות+`}</title>
      <PageHeader title={<bdi>{title}</bdi>} back={`/appliances/${appliance.id}`} />

      <div className="document-viewer">
        {/* אזור שנגלל: מקבל פוקוס, כדי שאפשר יהיה לגלול במקלדת כשהמסמך מוגדל (WCAG 2.1.1) */}
        <div
          className={['document-viewer__frame', zoomed && 'document-viewer__frame--zoomed'].filter(Boolean).join(' ')}
          role="region"
          aria-label={zoomed ? 'המסמך מוגדל. אפשר לגלול בחצים' : 'המסמך'}
          tabIndex={0}
        >
          <img src={imageUrl} alt={title} className="document-viewer__image" />
          {!isImage && current?.view && (
            <a href={current.view} target="_blank" rel="noreferrer" className="text-link document-viewer__open">
              פתיחת הקובץ המקורי
              <span className="visually-hidden"> (נפתח בכרטיסייה חדשה)</span>
            </a>
          )}
          <IconButton
            icon="zoom_in"
            label={zoomed ? 'הקטנת המסמך' : 'הגדלת המסמך'}
            aria-pressed={zoomed}
            onClick={() => setZoomed((value) => !value)}
            className="document-viewer__zoom"
          />
        </div>

        <p className="document-viewer__meta">
          הועלה ב־{uploadedAt} · {formatFileSize(document.sizeBytes)}
        </p>

        <div className="document-viewer__actions">
          <a href={current?.download ?? placeholderUrl} download={fileName} className="document-viewer__action">
            <Icon name="download" />
            <span>הורדה</span>
          </a>
          <button type="button" className="document-viewer__action" onClick={share}>
            <Icon name="share" />
            <span>שיתוף</span>
          </button>
          {!isViewer && (
            <>
              <FilePicker
                variant="plain"
                accept="image/*,application/pdf"
                onFile={replaceFile}
                icon="upload_file"
                className="document-viewer__action"
              >
                החלפת קובץ
              </FilePicker>
              <button
                type="button"
                className="document-viewer__action document-viewer__action--danger"
                aria-haspopup="dialog"
                onClick={() => setConfirmOpen(true)}
              >
                <Icon name="delete" />
                <span>מחיקה</span>
              </button>
            </>
          )}
        </div>

        {fileError && <Notice tone="error">{fileError}</Notice>}
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="למחוק את המסמך?"
        actions={
          <>
            <Button variant="danger" fullWidth onClick={handleDelete}>
              מחיקה
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setConfirmOpen(false)}>
              ביטול
            </Button>
          </>
        }
      >
        <p>הקובץ יימחק מכרטיס המוצר. אי אפשר לבטל את הפעולה.</p>
      </Dialog>

      <Toast message={toast} onDone={() => setToast(null)} />
    </AppPage>
  )
}

export default DocumentViewerPage
