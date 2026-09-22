import { Navigate, useLocation, useNavigate } from 'react-router'
import AppPage from '../../components/layout/AppPage/AppPage.jsx'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import ApplianceForm from '../../components/app/ApplianceForm/ApplianceForm.jsx'
import InvoiceThumbnail from '../../components/app/InvoiceThumbnail/InvoiceThumbnail.jsx'
import { useAppData } from '../../data/useAppData.js'
import { EMPTY_APPLIANCE_FORM, applianceFromForm } from '../../utils/applianceForm.js'
import { isAcceptedUpload } from '../../utils/files.js'
import './AppPages.css'

/**
 * הזנה ידנית (N11, N12 · FR-2.8). רק «שם המכשיר» חובה; תאריך רכישה לא בעתיד.
 * כשמגיעים מסריקה שנכשלה, הקובץ נשמר עם המכשיר (FR-2.7). אחרי השמירה → כרטיס המכשיר.
 */
function ManualEntryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isViewer, activeSpace, scan, addAppliance, clearScan, removeInboxItem } = useAppData()

  // בצפייה בלבד אין הוספה, גם כשנכנסים ישר לכתובת (FR-1.6)
  if (isViewer) return <Navigate to="/dashboard" replace />

  const attached = location.state?.fromScan && scan && isAcceptedUpload(scan.file) ? scan : null

  async function handleSubmit(values) {
    // הקובץ מהסריקה שנכשלה עולה ל־Storage עם המוצר (FR-2.7, docs/07 §8)
    const documents = attached ? [{ type: attached.source === 'label' ? 'other' : 'invoice', file: attached.file }] : []

    const id = await addAppliance(applianceFromForm(values, { spaceId: activeSpace.id, documents }))
    // חשבונית שהועברה במייל ולא נקראה יוצאת מהרשימה אחרי השמירה (FR-9.3)
    if (attached?.inboxId) await removeInboxItem(attached.inboxId)
    clearScan()
    navigate(`/appliances/${id}`, { replace: true, state: { toast: 'המוצר נשמר' } })
  }

  return (
    <AppPage width="reading">
      <title>הזנה ידנית · אחריות+</title>
      <PageHeader title="הזנה ידנית" back="/dashboard" />
      <ApplianceForm initialValues={EMPTY_APPLIANCE_FORM} submitLabel="שמירת המוצר" onSubmit={handleSubmit}>
        {attached && (
          <div className="scan-summary">
            <InvoiceThumbnail file={attached.file} url={attached.url} size="sm" alt="הקובץ שהעליתם" />
            <p className="scan-summary__text">הקובץ שהעליתם יישמר עם המוצר.</p>
          </div>
        )}
      </ApplianceForm>
    </AppPage>
  )
}

export default ManualEntryPage
