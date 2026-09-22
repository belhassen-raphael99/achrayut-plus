import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import AppPage from '../../components/layout/AppPage/AppPage.jsx'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import Chip from '../../components/ui/Chip/Chip.jsx'
import Dialog from '../../components/ui/Dialog/Dialog.jsx'
import Icon from '../../components/ui/Icon/Icon.jsx'
import IconButton from '../../components/ui/IconButton/IconButton.jsx'
import StateMessage from '../../components/ui/StateMessage/StateMessage.jsx'
import TextButton from '../../components/ui/TextButton/TextButton.jsx'
import Toast from '../../components/ui/Toast/Toast.jsx'
import { useAppData } from '../../data/useAppData.js'
import { invoiceResult, multiInvoiceResults } from '../../data/scanResults.js'
import { dataUrlToFile, renderDocumentImage } from '../../utils/documentImage.js'
import { formatDate } from '../../utils/format.js'
import { fullName } from '../../utils/text.js'
import './AppPages.css'

// מצב החשבונית ברשימה (FR-9.3)
const STATUS = {
  ready: { label: 'מוכנה לבדיקה', tone: 'role', action: 'בדיקה' },
  unreadable: { label: 'לא הצלחנו לקרוא', tone: 'expired', action: 'הזנה ידנית' },
  waiting: { label: 'ממתינה לסריקה', tone: 'unknown', action: 'הזנה ידנית' },
}

/**
 * העברת חשבוניות במייל (X5 · PRD FR-9): הכתובת של המרחב, והחשבוניות שממתינות לבדיקה.
 * בגישה מלאה בלבד. שלב 6: החשבוניות ברשימה הן נתוני דוגמה; הקבלה והקריאה בשרת בשלב 8.
 */
function ForwardingPage() {
  const navigate = useNavigate()
  const { activeSpace, isViewer, users, forwardingAddress, inbox, startScan, regenerateForwardingAddress, removeInboxItem } =
    useAppData()
  const [copied, setCopied] = useState(false)
  const [renewOpen, setRenewOpen] = useState(false)
  const [removing, setRemoving] = useState(null)
  const [toast, setToast] = useState(null)

  if (isViewer) return <Navigate to="/settings" replace />

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(forwardingAddress)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  async function renewAddress() {
    setRenewOpen(false)
    try {
      await regenerateForwardingAddress()
      setCopied(false)
      setToast('נוצרה כתובת חדשה')
    } catch (error) {
      console.error('יצירת הכתובת נכשלה', error)
      setToast('לא הצלחנו ליצור כתובת חדשה כרגע.')
    }
  }

  /** «בדיקה» → מסך הבדיקה (N5, או N6 כשיש כמה מכשירים) · «הזנה ידנית» → עם הקובץ (FR-2.7) */
  async function open(item) {
    const image = renderDocumentImage({ title: 'חשבונית', lines: [item.fileName] })
    const file = await dataUrlToFile(image, `${item.fileName.replace(/\.[^.]+$/, '')}.png`)
    if (item.status === 'ready') {
      const extra = item.reading === 'pdf' ? { lines: multiInvoiceResults() } : { result: invoiceResult() }
      startScan(file, item.reading === 'pdf' ? 'pdf' : 'invoice', { inboxId: item.id, ...extra })
      navigate('/appliances/new/scan')
      return
    }
    startScan(file, 'invoice', { inboxId: item.id })
    navigate('/appliances/new/manual', { state: { fromScan: true } })
  }

  async function confirmRemove() {
    const target = removing
    setRemoving(null)
    try {
      await removeInboxItem(target.id)
      setToast('החשבונית נמחקה')
    } catch (error) {
      console.error('המחיקה נכשלה', error)
      setToast('לא הצלחנו למחוק כרגע.')
    }
  }

  return (
    <AppPage width="reading">
      <title>העברת חשבוניות במייל · אחריות+</title>
      <PageHeader title="העברת חשבוניות במייל" subtitle={activeSpace.name} back="/settings" />

      <div className="forwarding">
        <section className="forwarding__address" aria-labelledby="forwarding-address">
          <span className="forwarding__icon" aria-hidden="true">
            <Icon name="forward_to_inbox" />
          </span>
          <p id="forwarding-address" className="forwarding__email">
            <bdi dir="ltr">{forwardingAddress}</bdi>
          </p>
          <p className="forwarding__text">
            העבירו לכתובת הזאת מייל עם חשבונית בתמונה או ב־PDF. נקרא אותה, והיא תחכה כאן לבדיקה.
          </p>
          <Button variant="primary" icon="content_copy" fullWidth onClick={copyAddress}>
            העתקת הכתובת
          </Button>
          <p className="forwarding__copied" role="status">
            {copied ? 'הכתובת הועתקה' : ''}
          </p>
          <TextButton aria-haspopup="dialog" onClick={() => setRenewOpen(true)}>
            כתובת חדשה
          </TextButton>
        </section>

        <section className="forwarding__section" aria-labelledby="forwarding-inbox">
          <h2 id="forwarding-inbox" className="settings__section-title">
            ממתינות לבדיקה
          </h2>
          {inbox.length === 0 ? (
            <StateMessage icon="inbox" titleAs="h3" size="sm" title="עוד לא הגיעו חשבוניות במייל." />
          ) : (
            <ul className="forwarding__list">
              {inbox.map((item) => {
                const status = STATUS[item.status] ?? STATUS.waiting
                const sender = users[item.senderId]
                return (
                  <li key={item.id} className="inbox-row">
                    <span className="inbox-row__icon" aria-hidden="true">
                      <Icon name={item.status === 'ready' ? 'description' : 'error'} />
                    </span>
                    <span className="inbox-row__text">
                      {/* שם קובץ: bdi בלי כיוון קבוע, כי הוא יכול להיות בעברית או באנגלית (CLAUDE.md) */}
                      <bdi className="inbox-row__name">
                        {item.fileName}
                      </bdi>
                      <span className="inbox-row__meta">
                        {sender ? fullName(sender) : ''} · {formatDate(new Date(item.receivedAt))}
                      </span>
                      <Chip tone={status.tone}>{status.label}</Chip>
                    </span>
                    <span className="inbox-row__actions">
                      <Button variant="secondary" onClick={() => open(item)}>
                        {status.action}
                      </Button>
                      <IconButton
                        icon="delete"
                        label={`מחיקת ${item.fileName}`}
                        aria-haspopup="dialog"
                        onClick={() => setRemoving(item)}
                      />
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      <Dialog
        open={renewOpen}
        onClose={() => setRenewOpen(false)}
        title="ליצור כתובת חדשה?"
        actions={
          <>
            <Button variant="primary" fullWidth onClick={renewAddress}>
              כתובת חדשה
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setRenewOpen(false)}>
              ביטול
            </Button>
          </>
        }
      >
        <p>הכתובת הנוכחית תפסיק לעבוד.</p>
      </Dialog>

      <Dialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="למחוק את החשבונית?"
        actions={
          <>
            <Button variant="danger" fullWidth onClick={confirmRemove}>
              מחיקה
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setRemoving(null)}>
              ביטול
            </Button>
          </>
        }
      >
        <p>החשבונית תוסר מהרשימה, ושום מוצר לא יישמר.</p>
      </Dialog>

      <Toast message={toast} onDone={() => setToast(null)} />
    </AppPage>
  )
}

export default ForwardingPage
