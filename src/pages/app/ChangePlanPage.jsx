import { useState } from 'react'
import { useNavigate } from 'react-router'
import AppPage from '../../components/layout/AppPage/AppPage.jsx'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import SegmentedChoice from '../../components/ui/SegmentedChoice/SegmentedChoice.jsx'
import PlanOption from '../../components/app/PlanOption/PlanOption.jsx'
import { useAppData } from '../../data/useAppData.js'
import { billingOptions, plans as OFFERS } from '../../data/site.js'
import './AppPages.css'

/**
 * שינוי תוכנית (P10, FR-6.2): שלוש התוכניות וחיוב חודשי או שנתי (ברירת מחדל: שנתי).
 * תוכנית בתשלום → מסך האישור (P11). חינם = ביטול המנוי (FR-6.3), בדיאלוג של מסך התוכנית.
 */
function ChangePlanPage() {
  const navigate = useNavigate()
  const { subscription } = useAppData()
  const [billing, setBilling] = useState(subscription.billing ?? 'annual')
  const currentId = subscription.plan.id

  function actionFor(offer) {
    if (offer.id === 'free') {
      if (subscription.cancelOn) return null
      return (
        <Button variant="secondary" fullWidth onClick={() => navigate('/settings/plan', { state: { cancel: true } })}>
          ביטול המנוי
        </Button>
      )
    }
    return (
      <Button
        variant="secondary"
        fullWidth
        to={`/settings/plan/confirm?plan=${offer.id}&billing=${billing}`}
        aria-label={`בחירת ${offer.name}`}
      >
        בחירה
      </Button>
    )
  }

  return (
    <AppPage width="reading">
      <title>שינוי תוכנית · אחריות+</title>
      <PageHeader title="שינוי תוכנית" back="/settings/plan" />

      <div className="plan-page">
        <SegmentedChoice
          legend="תקופת חיוב"
          name="billing"
          options={billingOptions}
          value={billing}
          onChange={setBilling}
        />
        <div className="plan-page__options">
          {OFFERS.map((offer) => (
            <PlanOption
              key={offer.id}
              offer={offer}
              billing={billing}
              current={offer.id === currentId}
              action={actionFor(offer)}
            />
          ))}
        </div>
      </div>
    </AppPage>
  )
}

export default ChangePlanPage
