import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import AuthCard from '../../components/auth/AuthCard/AuthCard.jsx'
import StateMessage from '../../components/ui/StateMessage/StateMessage.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import TextLink from '../../components/ui/TextLink/TextLink.jsx'
import { useAuth } from '../../data/useAuth.js'
import './AuthPages.css'

/** «בדקו את תיבת המייל» אחרי הרשמה (A9). בלי כפתור ראשי */
function CheckEmailPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email')
  const [resent, setResent] = useState(false)
  const { resendVerification } = useAuth()

  async function handleResend() {
    setResent(true)
    if (email) await resendVerification(email)
  }

  return (
    <>
      <title>בדקו את תיבת המייל · אחריות+</title>
      <AuthCard>
        <StateMessage
          icon="mail"
          tone="info"
          title="בדקו את תיבת המייל"
          actions={
            <>
              <Button variant="secondary" fullWidth onClick={handleResend}>
                שליחת הקישור שוב
              </Button>
              <TextLink to="/signup" arrow={false}>
                שינוי כתובת המייל
              </TextLink>
            </>
          }
        >
          <p>
            {email ? (
              <>
                שלחנו קישור לאימות אל <bdi dir="ltr">{email}</bdi>. לחצו עליו כדי להמשיך.
              </>
            ) : (
              'שלחנו קישור לאימות לכתובת שהזנתם. לחצו עליו כדי להמשיך.'
            )}
          </p>
          {resent && (
            <p className="auth-status" role="status">
              שלחנו קישור חדש.
            </p>
          )}
        </StateMessage>
      </AuthCard>

      <p className="auth-links">
        <Link to="/login">חזרה להתחברות</Link>
      </p>
    </>
  )
}

export default CheckEmailPage
