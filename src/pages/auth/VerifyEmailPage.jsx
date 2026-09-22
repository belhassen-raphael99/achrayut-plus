import { Link, useSearchParams } from 'react-router'
import AuthCard from '../../components/auth/AuthCard/AuthCard.jsx'
import StateMessage from '../../components/ui/StateMessage/StateMessage.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import './AuthPages.css'

/**
 * היעד של קישור האימות מהמייל (A10, A11).
 * Supabase מחזיר לכאן עם קוד שהלקוח מחליף לסשן, או עם error כשהקישור פג.
 * ?status=expired נשאר לבדיקה ידנית.
 */
function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const expired = searchParams.get('status') === 'expired' || searchParams.has('error')

  if (expired) {
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
            <Button variant="primary" to="/onboarding" fullWidth>
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
