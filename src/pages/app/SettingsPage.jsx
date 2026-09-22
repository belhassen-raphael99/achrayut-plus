import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import AppPage from '../../components/layout/AppPage/AppPage.jsx'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import ActionRow from '../../components/ui/ActionRow/ActionRow.jsx'
import Avatar from '../../components/ui/Avatar/Avatar.jsx'
import Icon from '../../components/ui/Icon/Icon.jsx'
import Switch from '../../components/ui/Switch/Switch.jsx'
import TextButton from '../../components/ui/TextButton/TextButton.jsx'
import Toast from '../../components/ui/Toast/Toast.jsx'
import TypedConfirmDialog from '../../components/app/TypedConfirmDialog/TypedConfirmDialog.jsx'
import { useAppData } from '../../data/useAppData.js'
import { useAuth } from '../../data/useAuth.js'
import { ACCOUNT_DELETED_KEY } from '../../utils/loginLockout.js'
import { fullName, propertyCountLabel } from '../../utils/text.js'
import './AppPages.css'

const REMINDERS = [
  { key: 'd90', label: 'תזכורת 90 ימים לפני' },
  { key: 'd30', label: 'תזכורת 30 ימים לפני' },
  { key: 'd7', label: 'תזכורת 7 ימים לפני' },
]

/**
 * הגדרות (P1, P6 · FR-1.9, FR-5.2): פרופיל, שלוש התזכורות (לכל חבר בנפרד), המרחב, החשבון, התנתקות ומחיקת החשבון.
 * «הגדרות המרחב» מוצג רק ליוצר המרחב. «התוכנית שלי» מוביל לתמחור (עמוד התוכנית הוא Should).
 */
function SettingsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, activeSpace, isViewer, properties, inbox, subscription, updateProfile, deleteAccount: deleteAccountOnServer } = useAppData()
  // התנתקות אמיתית: אחריה RequireAuth מחזיר להתחברות, גם בחזרה אחורה (FR-1.9)
  const { signOut } = useAuth()
  const [toast, setToast] = useState(() => location.state?.toast ?? null)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, key: 0 })

  // ההודעה מתת־עמוד («הפרופיל נשמר») מוצגת פעם אחת
  useEffect(() => {
    if (location.state?.toast) navigate(location.pathname, { replace: true, state: null })
    // רק בכניסה לעמוד
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isOwner = activeSpace.ownerId === user.id

  // מחיקה בשרת: הכול נמחק בשרשרת, כולל המרחבים שהמשתמש יצר (P6). מייל האישור (ME6) יגיע עם Resend
  async function deleteAccount() {
    // ההתנתקות מחזירה להתחברות לפני שהעמוד הזה מספיק לנווט, ולכן ההודעה «החשבון נמחק» עוברת בסשן
    try {
      sessionStorage.setItem(ACCOUNT_DELETED_KEY, '1')
    } catch {
      // בלי sessionStorage: המחיקה עובדת, רק בלי ההודעה
    }
    try {
      await deleteAccountOnServer()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('מחיקת החשבון נכשלה', error)
      try {
        sessionStorage.removeItem(ACCOUNT_DELETED_KEY)
      } catch {
        // אין sessionStorage
      }
    }
  }

  return (
    <AppPage width="reading">
      <title>הגדרות · אחריות+</title>
      <PageHeader title="הגדרות" />

      <div className="settings">
        <Link to="/settings/profile" className="settings__profile">
          <Avatar name={user.firstName} />
          <span className="settings__profile-text">
            <span className="settings__profile-name">{fullName(user)}</span>
            <span className="settings__profile-email">
              <bdi dir="ltr">{user.email}</bdi>
            </span>
          </span>
          <span className="visually-hidden">, עריכת הפרופיל</span>
          <Icon name="chevron_right" size="sm" flipInRtl className="settings__chevron" />
        </Link>

        <section className="settings__section" aria-labelledby="settings-reminders">
          <h2 id="settings-reminders" className="settings__section-title">
            תזכורות במייל
          </h2>
          <div className="settings__group">
            {REMINDERS.map((reminder) => (
              <Switch
                key={reminder.key}
                label={reminder.label}
                name={reminder.key}
                checked={user.reminders[reminder.key]}
                onChange={(event) =>
                  updateProfile({ reminders: { ...user.reminders, [reminder.key]: event.target.checked } })
                }
              />
            ))}
          </div>
        </section>

        <section className="settings__section" aria-labelledby="settings-space">
          <h2 id="settings-space" className="settings__section-title">
            המרחב
          </h2>
          <ul className="settings__rows">
            {isOwner && (
              <li>
                <ActionRow to="/settings/space" icon="home" title="הגדרות המרחב" description={activeSpace.name} />
              </li>
            )}
            {!isViewer && (
              <li>
                <ActionRow to="/settings/properties" icon="domain" title="נכסים" description={propertyCountLabel(properties.length)} />
              </li>
            )}
            {!isViewer && (
              <li>
                <ActionRow
                  to="/settings/forwarding"
                  icon="forward_to_inbox"
                  title="העברת חשבוניות במייל"
                  description={inbox.length > 0 ? `${inbox.length} ממתינות לבדיקה` : undefined}
                />
              </li>
            )}
            <li>
              <ActionRow to="/members" icon="group" title="חברי המרחב" description={`${activeSpace.members.length} חברים`} />
            </li>
          </ul>
        </section>

        <section className="settings__section" aria-labelledby="settings-account">
          <h2 id="settings-account" className="settings__section-title">
            החשבון
          </h2>
          <ul className="settings__rows">
            <li>
              <ActionRow to="/settings/password" icon="lock" title="סיסמה" />
            </li>
            <li>
              <ActionRow
                to="/settings/plan"
                icon="receipt_long"
                title="התוכנית שלי"
                description={subscription.plan.label}
              />
            </li>
          </ul>
        </section>

        <div className="settings__footer">
          <TextButton
            onClick={async () => {
              // קודם יוצאים מהאפליקציה, כדי ש־RequireAuth לא ישלח ל«/login?next=/settings»
              navigate('/', { replace: true })
              await signOut()
            }}
          >
            התנתקות
          </TextButton>
          <TextButton
            className="text-button--danger"
            aria-haspopup="dialog"
            onClick={() => setDeleteDialog((previous) => ({ open: true, key: previous.key + 1 }))}
          >
            מחיקת החשבון
          </TextButton>
        </div>
      </div>

      <TypedConfirmDialog
        key={deleteDialog.key}
        open={deleteDialog.open}
        onClose={() => setDeleteDialog((previous) => ({ ...previous, open: false }))}
        title="למחוק את החשבון?"
        confirmWord="מחיקה"
        actionLabel="מחיקת החשבון"
        onConfirm={deleteAccount}
      >
        <p>כל המוצרים, המסמכים והמרחבים שבבעלותכם יימחקו לצמיתות. אי אפשר לבטל את הפעולה.</p>
      </TypedConfirmDialog>

      <Toast message={toast} onDone={() => setToast(null)} />
    </AppPage>
  )
}

export default SettingsPage
