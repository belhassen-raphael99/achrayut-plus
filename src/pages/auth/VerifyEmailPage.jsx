import { Link, useSearchParams } from 'react-router'
import AuthCard from '../../components/auth/AuthCard/AuthCard.jsx'
import StateMessage from '../../components/ui/StateMessage/StateMessage.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import { NEW_DEMO_USER_ID } from '../../data/fakeAuth.js'
import { useAppData } from '../../data/useAppData.js'
import './AuthPages.css'

/**
 * היעד של קישור האימות מהמייל.
 * ?status=expired → «הקישור כבר לא בתוקף» (A10) · אחרת → «האימייל אומת» (A11)
 */
function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const { signIn } = useAppData()

  if (searchParams.get('status') === 'expired') {
    return (
      <>
        <title>הקישור כבר לא בתוקף · אחריות+</title>
        <AuthCard>
          <StateMessage
            icon="link_off"
            tone="neutral"
            title="הקישור כבר לא בתוקף"
            actions={
              <Button variant="primary" to="/check-email" fullWidth>
                שליחת קישור חדש
              </Button>
            }
          >
            <p>הקישורים לאימות תקפים לזמן מוגבל. שלחו קישור חדש ונמשיך מאותו מקום.</p>
          </StateMessage>
        </AuthCard>
        <p className="auth-links">
          <Link to="/login">חזרה להתחברות</Link>
        </p>
      </>
    )
  }

  return (
    <>
      <title>האימייל אומת · אחריות+</title>
      <AuthCard>
        <StateMessage
          icon="check_circle"
          tone="success"
          title="האימייל אומת"
          actions={
            <Button variant="primary" to="/onboarding" fullWidth onClick={() => signIn(NEW_DEMO_USER_ID)}>
              המשך
            </Button>
          }
        >
          <p>הכול מוכן. בואו ניצור את המרחב הראשון שלכם.</p>
        </StateMessage>
      </AuthCard>
    </>
  )
}

export default VerifyEmailPage
