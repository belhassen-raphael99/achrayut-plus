import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import AppPage from '../../components/layout/AppPage/AppPage.jsx'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import ApplianceForm from '../../components/app/ApplianceForm/ApplianceForm.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import Dialog from '../../components/ui/Dialog/Dialog.jsx'
import TextButton from '../../components/ui/TextButton/TextButton.jsx'
import { useAppData } from '../../data/useAppData.js'
import { DATE_SOURCES, findById } from '../../data/lists.js'
import { applianceChangesFromForm, formFromAppliance } from '../../utils/applianceForm.js'
import './AppPages.css'

/**
 * עריכת מכשיר (F8) ומחיקה (F9 · FR-3.7). אותו טופס כמו ההזנה הידנית, עם מקור התאריך ליד תאריך הרכישה.
 * בצפייה בלבד → חזרה לכרטיס (FR-1.6).
 */
function EditAppliancePage() {
  const { applianceId } = useParams()
  const navigate = useNavigate()
  const { appliances, isViewer, updateAppliance, deleteAppliance } = useAppData()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const appliance = appliances.find((item) => item.id === applianceId)

  if (!appliance) return <Navigate to="/appliances" replace />
  if (isViewer) return <Navigate to={`/appliances/${appliance.id}`} replace />

  const cardPath = `/appliances/${appliance.id}`
  const source = appliance.purchaseDate ? findById(DATE_SOURCES, appliance.warrantySource)?.label : undefined

  function handleSubmit(values) {
    updateAppliance(appliance.id, applianceChangesFromForm(appliance, values))
    navigate(cardPath, { replace: true, state: { toast: 'השינויים נשמרו' } })
  }

  // המחיקה מוחקת גם את המסמכים ואת התזכורות, ואי אפשר לבטל אותה (FR-3.7)
  function handleDelete() {
    setConfirmOpen(false)
    deleteAppliance(appliance.id)
    navigate('/appliances', { replace: true })
  }

  return (
    <AppPage width="reading">
      <title>עריכת מכשיר · אחריות+</title>
      <PageHeader title="עריכת מכשיר" back={cardPath} />
      <ApplianceForm
        initialValues={formFromAppliance(appliance)}
        verify={{ purchaseDate: source }}
        showSeller={false}
        submitLabel="שמירת השינויים"
        onSubmit={handleSubmit}
      />

      <div className="edit-appliance__delete">
        <TextButton className="text-button--danger" aria-haspopup="dialog" onClick={() => setConfirmOpen(true)}>
          מחיקת המכשיר
        </TextButton>
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={
          <>
            למחוק את <bdi>{appliance.name}</bdi>?
          </>
        }
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
        <p>המכשיר, המסמכים והתזכורות שלו יימחקו מהמרחב. אי אפשר לבטל את הפעולה.</p>
      </Dialog>
    </AppPage>
  )
}

export default EditAppliancePage
