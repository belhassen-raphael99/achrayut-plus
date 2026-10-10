import { useSearchParams } from 'react-router'
import Button from '../../components/ui/Button/Button.jsx'
import StateMessage from '../../components/ui/StateMessage/StateMessage.jsx'
import TextLink from '../../components/ui/TextLink/TextLink.jsx'
import { safeNextPath } from '../../utils/loginLockout.js'
import './SystemPages.css'

/**
 * «משהו השתבש אצלנו» (E2, SYSTEM PAGE): בלי קוד שגיאה ובלי הודעה טכנית.
 * מוצג כשרכיב נכשל (ErrorBoundary), ובכתובת /error כשטעינת הנתונים נכשלה.
 * ?from= : העמוד שממנו הגענו. «רענון הדף» חוזר אליו, ולא טוען שוב את /error עצמו.
 */
function ServerErrorPage() {
  const [searchParams] = useSearchParams()
  const from = safeNextPath(searchParams.get('from'))

  function retry() {
    if (from) window.location.assign(from)
    else window.location.reload()
  }

  return (
    <div className="server-error">
      <title>משהו השתבש · אחריות+</title>
      <StateMessage
        icon="build"
        title="משהו השתבש אצלנו"
        actions={
          <>
            <Button variant="primary" fullWidth onClick={retry}>
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
