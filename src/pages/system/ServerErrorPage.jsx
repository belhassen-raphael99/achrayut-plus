import Button from '../../components/ui/Button/Button.jsx'
import StateMessage from '../../components/ui/StateMessage/StateMessage.jsx'
import TextLink from '../../components/ui/TextLink/TextLink.jsx'
import './SystemPages.css'

/**
 * «משהו השתבש אצלנו» (E2, SYSTEM PAGE): בלי קוד שגיאה ובלי הודעה טכנית.
 * מוצג כשרכיב נכשל (ErrorBoundary), ובכתובת /error לבדיקה.
 */
function ServerErrorPage() {
  return (
    <div className="server-error">
      <title>משהו השתבש · אחריות+</title>
      <StateMessage
        icon="build"
        title="משהו השתבש אצלנו"
        actions={
          <>
            <Button variant="primary" fullWidth onClick={() => window.location.reload()}>
              רענון הדף
            </Button>
            <TextLink to="/" arrow={false}>
              לדף הבית
            </TextLink>
          </>
        }
      >
        <p>זו תקלה שלנו, לא שלכם. המידע שלכם שמור. נסו לרענן בעוד רגע.</p>
      </StateMessage>
    </div>
  )
}

export default ServerErrorPage
