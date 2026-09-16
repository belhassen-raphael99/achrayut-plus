import { useEffect, useMemo, useState } from 'react'
import Sheet from '../../ui/Sheet/Sheet.jsx'
import Button from '../../ui/Button/Button.jsx'
import Notice from '../../ui/Notice/Notice.jsx'
import RadioCards from '../../ui/RadioCards/RadioCards.jsx'
import TextField from '../../ui/TextField/TextField.jsx'
import Skeleton from '../../ui/Skeleton/Skeleton.jsx'
import { useAppData } from '../../../data/useAppData.js'
import { CONTACT_TYPES, findById } from '../../../data/lists.js'
import { dataUrlToFile, renderDocumentImage } from '../../../utils/documentImage.js'
import { buildServiceMessage, factsText, serviceMessageSubject } from '../../../utils/serviceMessage.js'
import { isEmpty } from '../../../utils/validation.js'
import { useValidatedForm } from '../../../utils/useValidatedForm.js'
import './ServiceMessageSheet.css'

// «מה קרה?»: חובה, עד 500 תווים (FR-8.2)
const MAX_ISSUE_LENGTH = 500
// «כתיבה» מדומה; בשלב 8 Claude, עם עצירה אחרי 30 שניות (FR-8.4)
const WRITING_MS = 1400

/**
 * הודעה לשירות הלקוחות (X3 · PRD FR-8). שלבים: locked (חינם) · form · writing · ready · failed · manual.
 * שום דבר לא נשלח אוטומטית: העתקה, וואטסאפ או מייל. key חדש בכל פתיחה מאפס את הגיליון.
 * failFirst: הכתיבה הראשונה נכשלת (בדיקת FR-8.4, ?demo=message-failed בכרטיס).
 */
function ServiceMessageSheet({ open, onClose, appliance, failFirst = false }) {
  const { user, spaceLimits } = useAppData()
  const locked = !spaceLimits?.plan.serviceMessage
  const primary = appliance.contacts.find((item) => item.primary) ?? appliance.contacts[0]
  const invoice = appliance.documents.find((item) => item.type === 'invoice')

  const [phase, setPhase] = useState(locked ? 'locked' : 'form')
  const [attempt, setAttempt] = useState(0)
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const { values, errors, formRef, handleChange, handleSubmit } = useValidatedForm(
    { contactId: primary?.id ?? '', issue: '' },
    (formValues) => {
      if (isEmpty(formValues.issue)) return { issue: 'צריך לתאר מה קרה.' }
      if (formValues.issue.trim().length > MAX_ISSUE_LENGTH) return { issue: `אפשר לכתוב עד ${MAX_ISSUE_LENGTH} תווים.` }
      return {}
    },
  )
  const contact = appliance.contacts.find((item) => item.id === values.contactId) ?? null

  useEffect(() => {
    if (phase !== 'writing') return undefined
    const timer = setTimeout(() => {
      if (failFirst && attempt === 1) {
        setPhase('failed')
        return
      }
      setMessage(buildServiceMessage({ appliance, contact, issue: values.issue, user, hasInvoice: Boolean(invoice) }))
      setPhase('ready')
    }, WRITING_MS)
    return () => clearTimeout(timer)
    // הכתיבה מתחילה מחדש רק בניסיון חדש
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, attempt])

  const invoiceImage = useMemo(() => {
    if (!invoice || (phase !== 'ready' && phase !== 'manual')) return null
    return renderDocumentImage({
      title: 'חשבונית',
      lines: [appliance.name, [appliance.brand, appliance.model].filter(Boolean).join(' ')].filter(Boolean),
    })
  }, [invoice, phase, appliance])

  function write() {
    setCopied(false)
    setAttempt((value) => value + 1)
    setPhase('writing')
  }

  function writeYourself() {
    setMessage(`${contact ? `שלום ${contact.name},` : 'שלום,'}\n\n${factsText(appliance)}\n\n`)
    setPhase('manual')
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const contactOptions = appliance.contacts.map((item) => ({
    id: item.id,
    label: item.name,
    description: findById(CONTACT_TYPES, item.type)?.label,
  }))

  return (
    <Sheet open={open} onClose={onClose} title="הודעה לשירות הלקוחות">
      <div className="service-message">
        {phase === 'locked' && (
          <Notice
            tone="info"
            title="הודעה שנכתבת בשבילכם זמינה בתוכנית פרו"
            action={
              spaceLimits?.isOwner && (
                <Button variant="secondary" to="/settings/plan/change">
                  לתוכניות
                </Button>
              )
            }
          >
            {!spaceLimits?.isOwner && 'רק מי שיצר את המרחב יכול לשנות את התוכנית'}
          </Notice>
        )}

        {phase === 'form' && (
          <form ref={formRef} className="app-form" noValidate onSubmit={handleSubmit(write)}>
            {contactOptions.length > 0 && (
              <RadioCards
                legend="למי?"
                name="contactId"
                options={contactOptions}
                value={values.contactId}
                onChange={handleChange}
              />
            )}
            <TextField
              label="מה קרה?"
              name="issue"
              multiline
              rows={3}
              dir="auto"
              helper="למשל: המכונה לא סוחטת"
              value={values.issue}
              onChange={handleChange}
              error={errors.issue}
            />
            <Button type="submit" variant="primary" fullWidth>
              כתיבת ההודעה
            </Button>
          </form>
        )}

        {phase === 'writing' && (
          <div className="service-message__writing" role="status">
            <p className="service-message__status">כותבים את ההודעה…</p>
            <div className="service-message__lines" aria-hidden="true">
              <Skeleton width="lg" />
              <Skeleton width="md" />
              <Skeleton width="lg" />
              <Skeleton width="sm" />
            </div>
          </div>
        )}

        {phase === 'failed' && (
          <>
            <Notice tone="error">לא הצלחנו לכתוב את ההודעה כרגע.</Notice>
            <div className="service-message__actions">
              <Button variant="primary" fullWidth icon="refresh" onClick={write}>
                לנסות שוב
              </Button>
              <Button variant="secondary" fullWidth onClick={writeYourself}>
                כתיבה בעצמכם
              </Button>
            </div>
          </>
        )}

        {(phase === 'ready' || phase === 'manual') && (
          <>
            <TextField
              label="ההודעה"
              name="message"
              multiline
              rows={12}
              dir="auto"
              value={message}
              onChange={(event) => {
                setMessage(event.target.value)
                setCopied(false)
              }}
            />
            <p className="service-message__copied" role="status">
              {copied ? 'ההודעה הועתקה' : ''}
            </p>
            <div className="service-message__actions">
              <Button variant="primary" fullWidth icon="content_copy" onClick={copy}>
                העתקה
              </Button>
              <Button
                variant="secondary"
                fullWidth
                icon="chat"
                href={`https://wa.me/?text=${encodeURIComponent(message)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                שליחה בוואטסאפ
              </Button>
              {contact?.email && (
                <Button
                  variant="secondary"
                  fullWidth
                  icon="mail"
                  href={`mailto:${contact.email}?subject=${encodeURIComponent(serviceMessageSubject(appliance))}&body=${encodeURIComponent(message)}`}
                >
                  שליחה במייל
                </Button>
              )}
              {invoiceImage && (
                <a
                  className="service-message__invoice"
                  href={invoiceImage}
                  download={`חשבונית - ${appliance.name}.png`}
                  onClick={async (event) => {
                    // בדפדפן שלא מוריד קישור data: (Safari ישן) נפתח שיתוף הקובץ
                    if (!navigator.canShare) return
                    const file = await dataUrlToFile(invoiceImage, `חשבונית - ${appliance.name}.png`)
                    if (!navigator.canShare({ files: [file] })) return
                    event.preventDefault()
                  }}
                >
                  הורדת החשבונית
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </Sheet>
  )
}

export default ServiceMessageSheet
