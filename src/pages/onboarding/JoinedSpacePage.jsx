import { Navigate, useLocation } from 'react-router'
import Icon from '../../components/ui/Icon/Icon.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import { useAppData } from '../../data/useAppData.js'
import { ROLES, findById } from '../../data/lists.js'
import { fullName } from '../../utils/text.js'
import './OnboardingPages.css'

const ROLE_ABILITIES = {
  viewer: 'אפשר לראות את המוצרים, המסמכים ואנשי הקשר.',
  full: 'אפשר להוסיף, לערוך ולמחוק מוצרים, אנשי קשר ומסמכים.',
}

/** «הצטרפתם למרחב» (O5): מי הוסיף אתכם ובאיזו הרשאה. בלי הצטרפות קודמת → לדשבורד */
function JoinedSpacePage() {
  const { state } = useLocation()
  const { spaces, users } = useAppData()
  const space = spaces.find((item) => item.id === state?.spaceId)

  if (!space) return <Navigate to="/dashboard" replace />

  const inviter = users[state.inviterId]
  const role = findById(ROLES, space.role)

  return (
    <>
      <title>הצטרפתם למרחב · אחריות+</title>
      <section className="onboarding-hero onboarding-hero--centered surface-dark">
        <div className="onboarding-hero__inner">
          <span className="onboarding-hero__badge">
            <Icon name="check" size="lg" />
          </span>
          <h1 className="onboarding-hero__title">
            הצטרפתם למרחב <bdi>{space.name}</bdi>
          </h1>
        </div>
      </section>

      <div className="onboarding-overlap">
        <div className="onboarding-card">
          {inviter && (
            <p className="onboarding-card__lead">
              {fullName(inviter)} הוסיף/ה אתכם עם {role.label}.
            </p>
          )}
          <p className="onboarding-card__text">{ROLE_ABILITIES[role.id]}</p>
          <Button variant="primary" to="/dashboard" fullWidth>
            למרחב
          </Button>
        </div>
      </div>
    </>
  )
}

export default JoinedSpacePage
