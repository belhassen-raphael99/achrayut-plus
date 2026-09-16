import { Navigate, useLocation, useNavigate } from 'react-router'
import AppPage from '../../components/layout/AppPage/AppPage.jsx'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import ApplianceForm from '../../components/app/ApplianceForm/ApplianceForm.jsx'
import InvoiceThumbnail from '../../components/app/InvoiceThumbnail/InvoiceThumbnail.jsx'
import { useAppData } from '../../data/useAppData.js'
import { EMPTY_APPLIANCE_FORM, applianceFromForm } from '../../utils/applianceForm.js'
import { toISODate, today } from '../../utils/dates.js'
import { isAcceptedUpload } from '../../utils/files.js'
import { createId } from '../../utils/ids.js'
import './AppPages.css'

/**
 * הזנה ידנית (N11, N12 · FR-2.8). רק «שם המכשיר» חובה; תאריך רכישה לא בעתיד.
 * כשמגיעים מסריקה שנכשלה, הקובץ נשמר עם המכשיר (FR-2.7). אחרי השמירה → כרטיס המכשיר.
 */
function ManualEntryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isViewer, activeSpace, scan, addAppliance, clearScan } = useAppData()

  // בצפייה בלבד אין הוספה, גם כשנכנסים ישר לכתובת (FR-1.6)
  if (isViewer) return <Navigate to="/dashboard" replace />

  const attached = location.state?.fromScan && scan && isAcceptedUpload(scan.file) ? scan : null

  function handleSubmit(values) {
    const documents = attached
      ? [
          {
            id: createId('document'),
            type: attached.source === 'label' ? 'other' : 'invoice',
            uploadedAt: toISODate(today()),
            sizeBytes: attached.file.size,
          },
        ]
      : []

    const id = addAppliance(applianceFromForm(values, { spaceId: activeSpace.id, documents }))
    clearScan()
    navigate(`/appliances/${id}`, { replace: true, state: { toast: 'המכשיר נשמר' } })
  }

  return (
    <AppPage width="reading">
      <title>הזנה ידנית · אחריות+</title>
      <PageHeader title="הזנה ידנית" back="/dashboard" />
      <ApplianceForm initialValues={EMPTY_APPLIANCE_FORM} submitLabel="שמירת המכשיר" onSubmit={handleSubmit}>
        {attached && (
          <div className="scan-summary">
            <InvoiceThumbnail file={attached.file} url={attached.url} size="sm" alt="הקובץ שהעליתם" />
            <p className="scan-summary__text">הקובץ שהעליתם יישמר עם המכשיר.</p>
          </div>
        )}
      </ApplianceForm>
    </AppPage>
  )
}

export default ManualEntryPage
