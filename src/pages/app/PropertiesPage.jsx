import { useState } from 'react'
import { Navigate } from 'react-router'
import AppPage from '../../components/layout/AppPage/AppPage.jsx'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import Dialog from '../../components/ui/Dialog/Dialog.jsx'
import Icon from '../../components/ui/Icon/Icon.jsx'
import IconButton from '../../components/ui/IconButton/IconButton.jsx'
import Notice from '../../components/ui/Notice/Notice.jsx'
import Toast from '../../components/ui/Toast/Toast.jsx'
import PropertySheet from '../../components/app/PropertySheet/PropertySheet.jsx'
import { useAppData } from '../../data/useAppData.js'
import { applianceCountLabel } from '../../utils/text.js'
import './AppPages.css'

/** «בתוכנית שלכם אפשר נכס אחד» / «עד 3 נכסים» */
function limitText(limit) {
  return limit === 1 ? 'בתוכנית שלכם אפשר נכס אחד' : `בתוכנית שלכם אפשר עד ${limit} נכסים`
}

/**
 * נכסים (X1 · PRD FR-7.2): רשימה עם מספר המכשירים, הוספה, שינוי שם ומחיקה של נכס ריק.
 * בגישה מלאה בלבד; בצפייה בלבד → חזרה להגדרות.
 */
function PropertiesPage() {
  const {
    user,
    activeSpace,
    isViewer,
    properties,
    propertyRules,
    applianceCountIn,
    addProperty,
    renameProperty,
    deleteProperty,
  } = useAppData()
  const [sheet, setSheet] = useState({ open: false, key: 0, property: null })
  const [removing, setRemoving] = useState(null)
  const [toast, setToast] = useState(null)

  if (isViewer) return <Navigate to="/settings" replace />

  const isOwner = activeSpace.ownerId === user.id
  const canDelete = properties.length > 1
  const removingCount = removing ? applianceCountIn(removing.id) : 0

  function openSheet(property = null) {
    setSheet((previous) => ({ open: true, key: previous.key + 1, property }))
  }

  function closeSheet() {
    setSheet((previous) => ({ ...previous, open: false }))
  }

  function save(name) {
    if (sheet.property) {
      renameProperty(sheet.property.id, name)
      setToast('השם נשמר')
    } else {
      addProperty(name)
      setToast('הנכס נוסף')
    }
    closeSheet()
  }

  function confirmDelete() {
    deleteProperty(removing.id)
    setRemoving(null)
    setToast('הנכס נמחק')
  }

  return (
    <AppPage width="reading">
      <title>נכסים · אחריות+</title>
      <PageHeader title="נכסים" subtitle={activeSpace.name} back="/settings" />

      <div className="properties">
        <ul className="properties__list">
          {properties.map((property) => (
            <li key={property.id} className="property-row">
              <span className="property-row__icon" aria-hidden="true">
                <Icon name="domain" />
              </span>
              <span className="property-row__text">
                <bdi className="property-row__name">{property.name}</bdi>
                <span className="property-row__count">{applianceCountLabel(applianceCountIn(property.id))}</span>
              </span>
              <IconButton
                icon="edit"
                label={`שינוי השם של ${property.name}`}
                aria-haspopup="dialog"
                onClick={() => openSheet(property)}
              />
              {canDelete && (
                <IconButton
                  icon="delete"
                  label={`מחיקת ${property.name}`}
                  aria-haspopup="dialog"
                  onClick={() => setRemoving(property)}
                />
              )}
            </li>
          ))}
        </ul>

        {propertyRules.limitReached ? (
          <Notice
            tone="info"
            title={limitText(propertyRules.limit)}
            action={
              isOwner && (
                <Button variant="secondary" to="/settings/plan">
                  לתוכניות
                </Button>
              )
            }
          >
            {!isOwner && 'רק מי שיצר את המרחב יכול לשנות את התוכנית'}
          </Notice>
        ) : (
          <Button variant="secondary" icon="add" fullWidth aria-haspopup="dialog" onClick={() => openSheet()}>
            הוספת נכס
          </Button>
        )}
      </div>

      <PropertySheet
        key={sheet.key}
        open={sheet.open}
        onClose={closeSheet}
        property={sheet.property}
        otherNames={properties.filter((item) => item.id !== sheet.property?.id).map((item) => item.name)}
        onSave={save}
      />

      <Dialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title={
          <>
            למחוק את הנכס <bdi>{removing?.name}</bdi>?
          </>
        }
        actions={
          removingCount === 0 ? (
            <>
              <Button variant="danger" fullWidth onClick={confirmDelete}>
                מחיקה
              </Button>
              <Button variant="secondary" fullWidth onClick={() => setRemoving(null)}>
                ביטול
              </Button>
            </>
          ) : (
            <Button variant="secondary" fullWidth onClick={() => setRemoving(null)}>
              חזרה
            </Button>
          )
        }
      >
        <p>
          {removingCount === 0
            ? 'אי אפשר לבטל את הפעולה.'
            : 'כדי למחוק את הנכס, העבירו קודם את המוצרים שבו לנכס אחר או מחקו אותם.'}
        </p>
      </Dialog>

      <Toast message={toast} onDone={() => setToast(null)} />
    </AppPage>
  )
}

export default PropertiesPage
