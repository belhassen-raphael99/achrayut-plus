import { useState } from 'react'
import Sheet from '../../ui/Sheet/Sheet.jsx'
import RadioCards from '../../ui/RadioCards/RadioCards.jsx'
import Button from '../../ui/Button/Button.jsx'
import IconButton from '../../ui/IconButton/IconButton.jsx'
import Notice from '../../ui/Notice/Notice.jsx'
import { formatInviteCode } from '../../../utils/inviteCode.js'
import './InviteSheet.css'

const ROLE_OPTIONS = [
  { id: 'full', label: 'גישה מלאה', description: 'יכולים להוסיף ולערוך' },
  { id: 'viewer', label: 'צפייה בלבד', description: 'רואים הכול, לא משנים דבר' },
]

/**
 * הזמנה למרחב (M2, FR-1.5): קודם בוחרים הרשאה, ואז נוצר קוד של 6 תווים בתוקף 7 ימים, עם שיתוף והעתקה.
 * בתוכנית חינם: מוזמן אחד, בצפייה בלבד. הרכיב נבנה מחדש בכל פתיחה (key בעמוד).
 */
function InviteSheet({ open, onClose, spaceName, rules, onCreate, onMessage }) {
  // הקוד נוצר בשרת (אקראי, ייחודי, עם מגבלות התוכנית)
  const [creating, setCreating] = useState(false)
  const [createFailed, setCreateFailed] = useState(false)

  async function createCode() {
    setCreateFailed(false)
    setCreating(true)
    try {
      setInvite(await onCreate(role))
    } catch (error) {
      console.error('יצירת הקוד נכשלה', error)
      setCreateFailed(true)
    } finally {
      setCreating(false)
    }
  }

  const [role, setRole] = useState('viewer')
  const [invite, setInvite] = useState(null)

  const code = invite ? formatInviteCode(invite.code) : ''
  const shareText = `הצטרפו למרחב «${spaceName}» באחריות+ עם קוד ההזמנה ${code}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(invite.code)
      onMessage('הקוד הועתק')
    } catch {
      onMessage('אי אפשר להעתיק מהדפדפן הזה')
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText })
      } catch {
        // המשתמש סגר את חלון השיתוף
      }
      return
    }
    copy()
  }

  return (
    <Sheet open={open} onClose={onClose} title="הזמנה למרחב">
      <div className="invite-sheet">
        {invite ? (
          <>
            <div className="invite-sheet__code-row">
              <p className="invite-sheet__code">
                <span className="visually-hidden">קוד ההזמנה: </span>
                <bdi dir="ltr">{code}</bdi>
              </p>
              <IconButton icon="content_copy" label="העתקת הקוד" onClick={copy} />
            </div>
            <p className="invite-sheet__hint">הקוד בתוקף ל־7 ימים.</p>
            <Button variant="primary" icon="share" fullWidth onClick={share} autoFocus>
              שיתוף הקוד
            </Button>
            <Button variant="secondary" fullWidth onClick={copy}>
              העתקה
            </Button>
          </>
        ) : rules.limitReached ? (
          <>
            <Notice tone="warning" icon="group">
              בתוכנית חינם אפשר להזמין חבר אחד למרחב, בצפייה בלבד.
            </Notice>
            <Button variant="secondary" to="/pricing" fullWidth onClick={onClose}>
              לתוכניות
            </Button>
          </>
        ) : (
          <>
            <RadioCards
              legend="הרשאה"
              name="role"
              options={ROLE_OPTIONS.map((option) => ({ ...option, disabled: rules.viewerOnly && option.id === 'full' }))}
              value={role}
              onChange={(event) => setRole(event.target.value)}
              helper={rules.viewerOnly ? 'בתוכנית חינם, חברים מוזמנים הם בצפייה בלבד.' : undefined}
            />
            {createFailed && <Notice tone="error">לא הצלחנו ליצור קוד כרגע. אפשר לנסות שוב.</Notice>}
            <Button variant="primary" fullWidth onClick={createCode} disabled={creating}>
              {creating ? 'יוצרים קוד…' : 'יצירת קוד'}
            </Button>
          </>
        )}
      </div>
    </Sheet>
  )
}

export default InviteSheet
