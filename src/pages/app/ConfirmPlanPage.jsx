import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import AppPage from '../../components/layout/AppPage/AppPage.jsx'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import Icon from '../../components/ui/Icon/Icon.jsx'
import Notice from '../../components/ui/Notice/Notice.jsx'
import { useAppData } from '../../data/useAppData.js'
import { PLANS, findById } from '../../data/lists.js'
import { billingOptions, planComparison, plans as OFFERS } from '../../data/site.js'
import { addMonths, today } from '../../utils/dates.js'
import { formatDate, formatPrice } from '../../utils/format.js'
import './AppPages.css'

const PLAN_ORDER = PLANS.map((plan) => plan.id)

/** ערך בטבלת ההשוואה: כן/לא → «כלולה» / «לא כלולה» */
function comparisonValue(value) {
  if (value === true) return 'כלולה'
  if (value === false) return 'לא כלולה'
  return value
}

/**
 * אישור שינוי התוכנית (P11, FR-6.2): המחיר, מה משתנה, והתשלום המדומה.
 * ?plan=pro|manager&billing=monthly|annual. ערך לא תקף או התוכנית הנוכחית → חזרה לבחירה.
 */
function ConfirmPlanPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { subscription, changePlan } = useAppData()
  // אחרי האישור התוכנית הנוכחית = התוכנית שנבחרה: לא מפנים שוב, כדי לא לדרוס את המעבר למסך התוכנית
  const [confirmed, setConfirmed] = useState(false)
  if (confirmed) return null

  const target = findById(PLANS, searchParams.get('plan'))
  const billing = searchParams.get('billing')
  const validBilling = billingOptions.some((option) => option.value === billing)
  if (!target || target.id === 'free' || !validBilling || target.id === subscription.plan.id) {
    return <Navigate to="/settings/plan/change" replace />
  }

  const offer = findById(OFFERS, target.id)
  const isAnnual = billing === 'annual'
  const renewsOn = addMonths(today(), isAnnual ? 12 : 1)
  const downgrade = target.rank < subscription.plan.rank

  // רק השורות שמשתנות: סריקות, נכסים, מוזמנים, הודעה לשירות הלקוחות
  const fromIndex = PLAN_ORDER.indexOf(subscription.plan.id)
  const toIndex = PLAN_ORDER.indexOf(target.id)
  const changes = planComparison.rows.filter((row) => row.values[fromIndex] !== row.values[toIndex])

  async function confirm() {
    setConfirmed(true)
    try {
      await changePlan(target.id, billing)
      navigate('/settings/plan', { replace: true, state: { toast: 'התוכנית עודכנה' } })
    } catch (error) {
      console.error('שינוי התוכנית נכשל', error)
      setConfirmed(false)
    }
  }

  return (
    <AppPage width="reading">
      <title>אישור התוכנית · אחריות+</title>
      <PageHeader title="אישור התוכנית" back="/settings/plan/change" />

      <div className="plan-page">
        <section className="plan-summary surface-dark" aria-labelledby="confirm-plan-name">
          <h2 id="confirm-plan-name" className="plan-summary__name">
            {offer.name}
          </h2>
          <p className="plan-summary__price">
            <span className="plan-summary__amount">{formatPrice(isAnnual ? offer.annual : offer.monthly)}</span>
            <span>{isAnnual ? 'לשנה' : 'לחודש'}</span>
          </p>
          <p className="plan-summary__renew">מתחדשת ב־{formatDate(renewsOn)}</p>
        </section>

        {changes.length > 0 && (
          <section className="plan-page__section" aria-labelledby="plan-changes">
            <h2 id="plan-changes" className="settings__section-title">
              מה משתנה
            </h2>
            <dl className="plan-changes">
              {changes.map((row) => (
                <div key={row.label} className="plan-changes__row">
                  <dt className="plan-changes__label">{row.label}</dt>
                  <dd className="plan-changes__values">
                    <span className="plan-changes__from">{comparisonValue(row.values[fromIndex])}</span>
                    <Icon name="arrow_forward" size="sm" flipInRtl className="plan-changes__arrow" />
                    <span className="visually-hidden">אחרי השינוי:</span>
                    <span className="plan-changes__to">{comparisonValue(row.values[toIndex])}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {downgrade && (
          <Notice tone="info">
            שום דבר לא נמחק. מה שמעל המגבלה נשאר, ואי אפשר להוסיף עוד עד שיורדים מתחתיה.
          </Notice>
        )}
        <Notice tone="info" icon="credit_card_off">
          זו הדגמה: לא תחויבו.
        </Notice>

        <Button variant="primary" fullWidth onClick={confirm}>
          אישור
        </Button>
      </div>
    </AppPage>
  )
}

export default ConfirmPlanPage
