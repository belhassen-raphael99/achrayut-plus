import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router'
import AppPage from '../../components/layout/AppPage/AppPage.jsx'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import IconButton from '../../components/ui/IconButton/IconButton.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import Chip from '../../components/ui/Chip/Chip.jsx'
import StateMessage from '../../components/ui/StateMessage/StateMessage.jsx'
import TextButton from '../../components/ui/TextButton/TextButton.jsx'
import TextLink from '../../components/ui/TextLink/TextLink.jsx'
import Toast from '../../components/ui/Toast/Toast.jsx'
import WarrantyLabel from '../../components/ui/WarrantyLabel/WarrantyLabel.jsx'
import CategoryIcon from '../../components/app/CategoryIcon/CategoryIcon.jsx'
import ContactRow from '../../components/app/ContactRow/ContactRow.jsx'
import DocumentRow from '../../components/app/DocumentRow/DocumentRow.jsx'
import ContactSheet from '../../components/app/ContactSheet/ContactSheet.jsx'
import ExtendedWarrantySheet from '../../components/app/ExtendedWarrantySheet/ExtendedWarrantySheet.jsx'
import AddDocumentSheet from '../../components/app/AddDocumentSheet/AddDocumentSheet.jsx'
import ServiceMessageSheet from '../../components/app/ServiceMessageSheet/ServiceMessageSheet.jsx'
import { useAppData } from '../../data/useAppData.js'
import { CATEGORIES, CONTACT_TYPES, DATE_SOURCES, ROOMS, findById } from '../../data/lists.js'
import { parseISODate, today } from '../../utils/dates.js'
import { formatDate } from '../../utils/format.js'
import { STAGE_LABELS, formatDuration, standardWarrantyEnd, unitLabel, warrantyStatus } from '../../utils/warranty.js'
import './AppPages.css'

/** המשפט שקורא המסך שומע במקום הפסים והחץ */
function labelSummary(status) {
  if (status.stage === 'unknown') return 'תאריך סיום האחריות לא ידוע.'
  if (status.stage === 'expired') {
    // הערכה לעולם לא מוצגת כוודאות, גם לקורא המסך (DESIGN.md §11)
    const estimated = status.estimated ? ' · משוער' : ''
    return `האחריות הסתיימה לפני ${formatDuration(status.amount, status.unit)}, ב־${formatDate(status.end)}${estimated}.`
  }
  return `האחריות ${STAGE_LABELS[status.stage]}: ${status.text}, עד ${formatDate(status.end)}.`
}

/**
 * כרטיס מכשיר (F1–F6, W3 · FR-3.1–3.8): הפרטים, תו האחריות, למי להתקשר ומסמכים.
 * בצפייה בלבד: בלי עיפרון, «להוסיף», «הוספת איש קשר» ו«הוספת מסמך», ועם התג «צפייה בלבד» (F6).
 * אחרי שמירה מגיעים עם state.toast («המכשיר נשמר»).
 */
function ApplianceDetailPage() {
  const { applianceId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const {
    appliances,
    propertyName,
    isViewer,
    scan,
    applianceAccess,
    switchSpace,
    saveContact,
    deleteContact,
    setExtendedWarranty,
    addDocument,
  } = useAppData()
  const [toast, setToast] = useState(() => location.state?.toast ?? null)
  const [sheet, setSheet] = useState({ kind: null, open: false, key: 0 })
  // בלי חיבור: «הודעה לשירות הלקוחות» מושבתת (FR-8.1). ?demo=message-failed: הכתיבה הראשונה נכשלת (FR-8.4)
  const { offline } = useOutletContext()
  const [searchParams] = useSearchParams()

  // ההודעה מוצגת פעם אחת: המצב נמחק מההיסטוריה, כדי שרענון לא יציג אותה שוב
  useEffect(() => {
    if (location.state?.toast) navigate(location.pathname, { replace: true, state: null })
    // רק בכניסה לעמוד
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const appliance = appliances.find((item) => item.id === applianceId)
  const access = applianceAccess(applianceId)

  // קישור (למשל ממייל) למכשיר במרחב אחר של המשתמש: עוברים לאותו מרחב (FR-1.8)
  useEffect(() => {
    if (access.kind === 'other') switchSpace(access.spaceId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access.kind, access.spaceId])

  if (access.kind === 'other') return null

  // מרחב שהמשתמש לא חבר בו (E5)
  if (access.kind === 'forbidden') {
    return (
      <AppPage width="reading">
        <title>אין גישה · אחריות+</title>
        <PageHeader back="/dashboard" />
        <StateMessage
          icon="lock"
          title="אין לכם גישה לדף הזה"
          size="sm"
          actions={
            <>
              <Button variant="primary" to="/dashboard" fullWidth>
                לדף הבית
              </Button>
              <TextLink to="/onboarding/join" arrow={false}>
                הצטרפות עם קוד
              </TextLink>
            </>
          }
          className="appliances__state"
        >
          <p>הדף שייך למרחב שאינכם חברים בו. בקשו קוד הזמנה ממי שמנהל אותו.</p>
        </StateMessage>
      </AppPage>
    )
  }

  // מכשיר שנמחק בינתיים (FR-5.4)
  if (!appliance) {
    return (
      <AppPage width="reading">
        <title>המכשיר לא נמצא · אחריות+</title>
        <PageHeader back="/appliances" />
        <StateMessage
          icon="inventory_2"
          title="המכשיר לא נמצא"
          size="sm"
          actions={
            <Button variant="primary" to="/appliances" fullWidth>
              למכשירים
            </Button>
          }
          className="appliances__state"
        >
          <p>ייתכן שהמכשיר נמחק, או שהוא שייך למרחב אחר.</p>
        </StateMessage>
      </AppPage>
    )
  }

  const status = warrantyStatus(appliance)
  const standardEnd = standardWarrantyEnd(appliance)
  const standardSource = findById(DATE_SOURCES, appliance.warrantySource)?.label
  const extendedSource = findById(DATE_SOURCES, appliance.extended?.source)?.label
  const hasInvoice = appliance.documents.some((item) => item.type === 'invoice')
  // כשיש כמה נכסים: «קטגוריה · נכס · חדר» (FR-7.3)
  const details = [findById(CATEGORIES, appliance.category)?.label, propertyName(appliance), findById(ROOMS, appliance.room)?.label]
    .filter(Boolean)
    .join(' · ')
  const identifiers = [appliance.model, appliance.serial && `S/N ${appliance.serial}`].filter(Boolean).join(' · ')
  const editPath = `/appliances/${appliance.id}/edit`

  function openSheet(kind, extra = {}) {
    setSheet((previous) => ({ kind, open: true, key: previous.key + 1, ...extra }))
  }

  function closeSheet() {
    setSheet((previous) => ({ ...previous, open: false }))
  }

  function finish(message) {
    closeSheet()
    setToast(message)
  }

  return (
    <AppPage>
      <title>{`${appliance.name} · אחריות+`}</title>
      <PageHeader
        back="/appliances"
        actions={!isViewer && <IconButton icon="edit" label="עריכת המכשיר" to={editPath} />}
      />

      <div className="appliance-detail">
        <div className="appliance-detail__main">
          <div className="appliance-detail__summary">
            <CategoryIcon category={appliance.category} size="lg" />
            <div className="appliance-detail__heading">
              <h1 className="appliance-detail__name">
                <bdi>{appliance.name}</bdi>
              </h1>
              {details && <p className="appliance-detail__meta">{details}</p>}
              {identifiers && (
                <p className="appliance-detail__meta">
                  <bdi dir="ltr">{identifiers}</bdi>
                </p>
              )}
              {isViewer && <Chip tone="role">צפייה בלבד</Chip>}
            </div>
          </div>

          <WarrantyLabel
            brand={appliance.brand}
            purchaseDate={parseISODate(appliance.purchaseDate)}
            stage={status.stage}
            value={status.amount}
            unit={status.unit ? unitLabel(status.amount, status.unit) : undefined}
            prefix={status.stage === 'expired' ? 'לפני' : undefined}
            estimated={status.estimated}
            summary={labelSummary(status)}
          >
            {standardEnd ? (
              <p>
                {standardEnd < today()
                  ? `אחריות רגילה הסתיימה ב־${formatDate(standardEnd)}`
                  : `אחריות רגילה עד ${formatDate(standardEnd)}`}
                {standardSource && ` · ${standardSource}`}
              </p>
            ) : (
              !isViewer && (
                <p>
                  <TextLink to={editPath} arrow={false}>
                    להשלים תאריך
                  </TextLink>
                </p>
              )
            )}
            {status.estimated && !isViewer && (
              <p>
                יש לכם את התאריך המדויק?{' '}
                <TextLink to={editPath} arrow={false}>
                  לעדכון
                </TextLink>
              </p>
            )}
            {appliance.extended ? (
              <p>
                אחריות מורחבת עד {formatDate(parseISODate(appliance.extended.end))}
                {extendedSource && ` · ${extendedSource}`}
              </p>
            ) : (
              !isViewer && (
                <p>
                  אחריות מורחבת ·{' '}
                  <TextButton aria-haspopup="dialog" onClick={() => openSheet('extended')}>
                    להוסיף
                  </TextButton>
                </p>
              )
            )}
          </WarrantyLabel>

          {status.stage === 'expired' && (
            <p className="appliance-detail__note">האחריות הסתיימה. אנשי הקשר נשארים זמינים כאן.</p>
          )}
        </div>

        <div className="appliance-detail__side">
          <section className="appliance-detail__section" aria-labelledby="contacts-title">
            <h2 id="contacts-title" className="appliance-detail__section-title">
              למי להתקשר
            </h2>
            {appliance.contacts.length > 0 ? (
              <ul className="appliance-detail__rows">
                {appliance.contacts.map((contact) => (
                  <li key={contact.id}>
                    <ContactRow
                      contact={contact}
                      onEdit={isViewer ? undefined : (item) => openSheet('contact', { contact: item })}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="appliance-detail__note">אין עדיין אנשי קשר.</p>
            )}
            {!isViewer && appliance.contacts.length < CONTACT_TYPES.length && (
              <TextButton aria-haspopup="dialog" onClick={() => openSheet('contact', { contact: null })}>
                הוספת איש קשר
              </TextButton>
            )}
            {/* לכל חברי המרחב, גם בצפייה בלבד: זו לא עריכה (FR-8.1) */}
            <Button
              variant="secondary"
              icon="forum"
              fullWidth
              aria-haspopup="dialog"
              disabled={offline}
              title={offline ? 'יהיה זמין כשהחיבור יחזור' : undefined}
              onClick={() => openSheet('message')}
              className="appliance-detail__message"
            >
              הודעה לשירות הלקוחות
            </Button>
            {offline && <p className="appliance-detail__note">יהיה זמין כשהחיבור יחזור</p>}
          </section>

          <section className="appliance-detail__section" aria-labelledby="documents-title">
            <h2 id="documents-title" className="appliance-detail__section-title">
              מסמכים
            </h2>
            {appliance.documents.length > 0 && (
              <ul className="appliance-detail__rows">
                {appliance.documents.map((document) => (
                  <li key={document.id}>
                    <DocumentRow applianceId={appliance.id} document={document} />
                  </li>
                ))}
              </ul>
            )}
            {!hasInvoice && (
              <p className="appliance-detail__note">
                אין עדיין חשבונית
                {!isViewer && (
                  <>
                    {' · '}
                    <TextButton aria-haspopup="dialog" onClick={() => openSheet('document', { defaultType: 'invoice' })}>
                      הוספת חשבונית
                    </TextButton>
                  </>
                )}
              </p>
            )}
            {!isViewer && hasInvoice && (
              <TextButton aria-haspopup="dialog" onClick={() => openSheet('document', { defaultType: 'warranty' })}>
                הוספת מסמך
              </TextButton>
            )}
          </section>

          {!isViewer && scan?.lines?.length > 0 && (
            <TextLink to="/appliances/new/scan">הוספת מכשיר נוסף מהחשבונית</TextLink>
          )}
        </div>
      </div>

      {sheet.kind === 'contact' && (
        <ContactSheet
          key={sheet.key}
          open={sheet.open}
          onClose={closeSheet}
          appliance={appliance}
          contact={sheet.contact}
          onSave={(contact) => {
            saveContact(appliance.id, contact)
            finish('איש הקשר נשמר')
          }}
          onDelete={(contactId) => {
            deleteContact(appliance.id, contactId)
            finish('איש הקשר נמחק')
          }}
        />
      )}
      {sheet.kind === 'extended' && (
        <ExtendedWarrantySheet
          key={sheet.key}
          open={sheet.open}
          onClose={closeSheet}
          onSave={(extended, certificate) => {
            setExtendedWarranty(appliance.id, extended, certificate)
            finish('האחריות המורחבת נשמרה')
          }}
        />
      )}
      {sheet.kind === 'document' && (
        <AddDocumentSheet
          key={sheet.key}
          open={sheet.open}
          onClose={closeSheet}
          defaultType={sheet.defaultType}
          onAdd={(document) => {
            addDocument(appliance.id, document)
            finish('המסמך נוסף')
          }}
        />
      )}

      {sheet.kind === 'message' && (
        <ServiceMessageSheet
          key={sheet.key}
          open={sheet.open}
          onClose={closeSheet}
          appliance={appliance}
          failFirst={searchParams.get('demo') === 'message-failed'}
        />
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </AppPage>
  )
}

export default ApplianceDetailPage
