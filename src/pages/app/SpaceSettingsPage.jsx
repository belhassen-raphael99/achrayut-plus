import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import AppPage from '../../components/layout/AppPage/AppPage.jsx'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import ActionRow from '../../components/ui/ActionRow/ActionRow.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import FormErrorSummary from '../../components/ui/FormErrorSummary/FormErrorSummary.jsx'
import TextButton from '../../components/ui/TextButton/TextButton.jsx'
import TextField from '../../components/ui/TextField/TextField.jsx'
import TypedConfirmDialog from '../../components/app/TypedConfirmDialog/TypedConfirmDialog.jsx'
import { useAppData } from '../../data/useAppData.js'
import { SPACE_TYPES, findById } from '../../data/lists.js'
import { applianceCountLabel } from '../../utils/text.js'
import { isEmpty } from '../../utils/validation.js'
import { useValidatedForm } from '../../utils/useValidatedForm.js'
import './AppPages.css'

function validate(values) {
  return isEmpty(values.name) ? { name: 'צריך לתת שם למרחב.' } : {}
}

/**
 * הגדרות המרחב (P4) ומחיקתו (P5 · FR-1.7): רק יוצר המרחב, והמחיקה בהקלדת שם המרחב.
 * מי שאינו יוצר המרחב → חזרה להגדרות.
 */
function SpaceSettingsPage() {
  const navigate = useNavigate()
  const { user, activeSpace, appliances, renameSpace, deleteSpace } = useAppData()
  const [deleteDialog, setDeleteDialog] = useState({ open: false, key: 0 })
  // אחרי המחיקה המרחב הפעיל מתחלף: לא מפנים שוב, כדי לא לדרוס את המעבר לדשבורד
  const [deleted, setDeleted] = useState(false)
  const { values, errors, errorCount, formRef, handleChange, handleSubmit } = useValidatedForm(
    { name: activeSpace.name },
    validate,
  )

  if (deleted) return null
  if (activeSpace.ownerId !== user.id) return <Navigate to="/settings" replace />

  function onValid(formValues) {
    renameSpace(formValues.name)
    navigate('/settings', { replace: true, state: { toast: 'הגדרות המרחב נשמרו' } })
  }

  function handleDelete() {
    setDeleted(true)
    deleteSpace()
    navigate('/dashboard', { replace: true })
  }

  const count = appliances.length

  return (
    <AppPage width="reading">
      <title>הגדרות המרחב · אחריות+</title>
      <PageHeader title="הגדרות המרחב" back="/settings" />

      <form ref={formRef} className="app-form app-form--plate" noValidate onSubmit={handleSubmit(onValid)}>
        <FormErrorSummary count={errorCount} />
        <TextField label="שם המרחב" name="name" autoComplete="off" value={values.name} onChange={handleChange} error={errors.name} />
        <p className="settings__readonly">סוג המרחב · {findById(SPACE_TYPES, activeSpace.type)?.label}</p>
        <Button type="submit" variant="primary" fullWidth>
          שמירה
        </Button>
      </form>

      <ActionRow
        to="/members"
        icon="group"
        title="חברי המרחב"
        description={`${activeSpace.members.length} חברים`}
        variant="card"
        className="space-settings__members"
      />

      <div className="edit-appliance__delete">
        <TextButton
          className="text-button--danger"
          aria-haspopup="dialog"
          onClick={() => setDeleteDialog((previous) => ({ open: true, key: previous.key + 1 }))}
        >
          מחיקת המרחב
        </TextButton>
      </div>

      <TypedConfirmDialog
        key={deleteDialog.key}
        open={deleteDialog.open}
        onClose={() => setDeleteDialog((previous) => ({ ...previous, open: false }))}
        title={
          <>
            למחוק את המרחב <bdi>{activeSpace.name}</bdi>?
          </>
        }
        confirmWord={activeSpace.name}
        actionLabel="מחיקת המרחב"
        onConfirm={handleDelete}
      >
        <p>
          {count > 0 ? `${applianceCountLabel(count)}, המסמכים והתזכורות` : 'המסמכים והתזכורות'} יימחקו לכל חברי
          המרחב. אי אפשר לבטל את הפעולה.
        </p>
      </TypedConfirmDialog>
    </AppPage>
  )
}

export default SpaceSettingsPage
