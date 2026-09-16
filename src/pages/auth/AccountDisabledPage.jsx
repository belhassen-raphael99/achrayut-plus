import { Link } from 'react-router'
import AuthCard from '../../components/auth/AuthCard/AuthCard.jsx'
import StateMessage from '../../components/ui/StateMessage/StateMessage.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import './AuthPages.css'

/** «החשבון הזה מושבת» (A19) */
function AccountDisabledPage() {
  return (
    <>
      <title>החשבון מושבת · אחריות+</title>
      <AuthCard>
        <StateMessage
          icon="lock"
          tone="neutral"
          title="החשבון הזה מושבת"
          actions={
            <Button variant="primary" to="/contact" fullWidth>
              יצירת קשר
            </Button>
          }
        >
          <p>אי אפשר להתחבר לחשבון כרגע. אם לדעתכם זו טעות, כתבו לנו ונבדוק.</p>
        </StateMessage>
      </AuthCard>
      <p className="auth-links">
        <Link to="/">חזרה לדף הבית</Link>
      </p>
    </>
  )
}

export default AccountDisabledPage
