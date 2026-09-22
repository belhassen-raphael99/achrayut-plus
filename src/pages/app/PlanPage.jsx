import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import AppPage from '../../components/layout/AppPage/AppPage.jsx'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import Dialog from '../../components/ui/Dialog/Dialog.jsx'
import Notice from '../../components/ui/Notice/Notice.jsx'
import TextButton from '../../components/ui/TextButton/TextButton.jsx'
import Toast from '../../components/ui/Toast/Toast.jsx'
import UsageMeter from '../../components/app/UsageMeter/UsageMeter.jsx'
import { useAppData } from '../../data/useAppData.js'
import { findById } from '../../data/lists.js'
import { plans as OFFERS } from '../../data/site.js'
import { addBusinessDays, today } from '../../utils/dates.js'
import { formatDate, formatPrice } from '../../utils/format.js'
import './AppPages.css'

/**
 * התוכנית שלי (P9, P12 · PRD FR-6.1, FR-6.3): התוכנית, השימוש מול המגבלות, שינוי וביטול.
 * state.cancel = true (מ«שינוי תוכנית» → חינם) פותח את דיאלוג הביטול.
 */
function PlanPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { subscription, scanQuota, spaceLimits, cancelSubscription, resumeSubscription } = useAppData()
  const [toast, setToast] = useState(() => location.state?.toast ?? null)
  const [cancelOpen, setCancelOpen] = useState(() => location.state?.cancel === true)

  // ההודעה או הדיאלוג שהגיעו מתת־עמוד מוצגים פעם אחת
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null })
    // רק בכניסה לעמוד
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { plan, billing, renewsOn, cancelOn } = subscription
  const offer = findById(OFFERS, plan.id)
  const isPaid = plan.id !== 'free'
  const isAnnual = billing === 'annual'
  const price = isPaid ? (isAnnual ? offer.annual : offer.monthly) : 0

  async function confirmCancel() {
    setCancelOpen(false)
    try {
      await cancelSubscription()
    } catch (error) {
      console.error('הביטול נכשל', error)
    }
  }

  return (
    <AppPage width="reading">
      <title>התוכנית שלי · אחריות+</title>
      <PageHeader title="התוכנית שלי" back="/settings" />

      <div className="plan-page">
        <section className="plan-summary surface-dark" aria-labelledby="plan-name">
          <h2 id="plan-name" className="plan-summary__name">
            {plan.label}
          </h2>
          <p className="plan-summary__price">
            <span className="plan-summary__amount">{formatPrice(price)}</span>
            {isPaid && <span>{isAnnual ? 'לשנה' : 'לחודש'}</span>}
          </p>
          {isPaid && !cancelOn && <p className="plan-summary__renew">מתחדשת ב־{formatDate(renewsOn)}</p>}
        </section>

        {cancelOn && (
          <Notice
            tone="warning"
            title={`המנוי בוטל. התוכנית פעילה עד ${formatDate(cancelOn)}`}
            action={
              <Button variant="secondary" onClick={resumeSubscription}>
                חידוש המנוי
              </Button>
            }
          />
        )}

        <section className="plan-page__section" aria-labelledby="plan-usage">
          <h2 id="plan-usage" className="settings__section-title">
            שימוש
          </h2>
          <div className="plan-usage">
            <UsageMeter
              label="סריקות החודש"
              used={scanQuota.used}
              limit={scanQuota.limit}
              helper={`מתחדשות ב־${formatDate(scanQuota.renewsOn)}`}
            />
            {spaceLimits?.isOwner && (
              <>
                <UsageMeter label="נכסים" used={spaceLimits.properties} limit={spaceLimits.plan.properties} />
                <UsageMeter label="חברים מוזמנים" used={spaceLimits.invited} limit={spaceLimits.plan.invitees} />
              </>
            )}
          </div>
          {spaceLimits && !spaceLimits.isOwner && (
            <p className="plan-page__note">המגבלות של המרחב הזה נקבעות לפי התוכנית של מי שיצר אותו.</p>
          )}
        </section>

        <div className="plan-page__actions">
          <Button variant="primary" to="/settings/plan/change" fullWidth>
            שינוי תוכנית
          </Button>
          {isPaid && !cancelOn && (
            <TextButton className="text-button--danger" aria-haspopup="dialog" onClick={() => setCancelOpen(true)}>
              ביטול המנוי
            </TextButton>
          )}
        </div>
      </div>

      <Dialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="לבטל את המנוי?"
        actions={
          <>
            <Button variant="danger" fullWidth onClick={confirmCancel}>
              ביטול המנוי
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setCancelOpen(false)}>
              חזרה
            </Button>
          </>
        }
      >
        <p>
          המנוי יסתיים ב־{formatDate(addBusinessDays(today(), 3))}. המוצרים, המסמכים והתזכורות נשמרים, והחשבון
          יעבור לתוכנית החינמית.
        </p>
      </Dialog>

      <Toast message={toast} onDone={() => setToast(null)} />
    </AppPage>
  )
}

export default PlanPage
