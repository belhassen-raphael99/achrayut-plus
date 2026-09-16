import { Navigate } from 'react-router'
import Logo from '../../components/ui/Logo/Logo.jsx'
import ActionRow from '../../components/ui/ActionRow/ActionRow.jsx'
import Photo from '../../components/ui/Photo/Photo.jsx'
import { photos } from '../../data/photos.js'
import { useAppData } from '../../data/useAppData.js'
import './OnboardingPages.css'

/**
 * כניסה ראשונה: יצירה או הצטרפות (O1, FR-1.4). משתמש שכבר יש לו מרחב → לדשבורד.
 * בלי כפתורים ובלי ניווט: שתי השורות הן כל המסך.
 * הצילום: הרגע הראשון באפליקציה הוא «הבית שלכם», לא טופס (צילום זמני, src/data/photos.js).
 */
function WelcomePage() {
  const { user, spaces } = useAppData()

  if (spaces.length > 0) return <Navigate to="/dashboard" replace />

  return (
    <>
      <title>ברוכים הבאים · אחריות+</title>
      <section className="onboarding-hero onboarding-hero--photo surface-dark">
        <div className="onboarding-hero__media" aria-hidden="true">
          <Photo photo={photos.welcomeHome} priority sizes="100vw" className="onboarding-hero__photo" />
          <span className="onboarding-hero__veil" />
        </div>
        <div className="onboarding-hero__inner">
          <div className="onboarding-hero__logo">
            <Logo inverse />
          </div>
          <h1 className="onboarding-hero__title" data-reveal="soft">
            ברוכים הבאים, {user.firstName}
          </h1>
          <p className="onboarding-hero__text" data-reveal style={{ '--reveal-index': 1 }}>
            איך תרצו להתחיל?
          </p>
        </div>
      </section>

      <div className="onboarding-overlap">
        <ul className="onboarding-choices">
          <li data-reveal="lift" style={{ '--reveal-index': 2 }}>
            <ActionRow
              variant="card"
              to="/onboarding/create"
              icon="add_home"
              title="יצירת מרחב חדש"
              description="לבית, למשפחה או לעסק"
            />
          </li>
          <li data-reveal="lift" style={{ '--reveal-index': 3 }}>
            <ActionRow
              variant="card"
              to="/onboarding/join"
              icon="key"
              title="הצטרפות למרחב קיים"
              description="קיבלתם קוד הזמנה? הזינו אותו כאן"
            />
          </li>
        </ul>
      </div>
    </>
  )
}

export default WelcomePage
