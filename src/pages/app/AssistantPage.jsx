import { useEffect, useId, useRef, useState } from 'react'
import { Link, Navigate, useOutletContext, useSearchParams } from 'react-router'
import AppPage from '../../components/layout/AppPage/AppPage.jsx'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import IconButton from '../../components/ui/IconButton/IconButton.jsx'
import Notice from '../../components/ui/Notice/Notice.jsx'
import TextButton from '../../components/ui/TextButton/TextButton.jsx'
import { useAppData } from '../../data/useAppData.js'
import { ASSISTANT_SUGGESTIONS, answerQuestion } from '../../utils/assistant.js'
import { createId } from '../../utils/ids.js'
import './AppPages.css'

// שאלה: עד 300 תווים (FR-10.2). «חיפוש» מדומה; בשלב 8 Claude
const MAX_QUESTION_LENGTH = 300
const ANSWER_MS = 900

/**
 * העוזר לקריאה בלבד (X4 · PRD FR-10): שאלות על המכשירים במרחב הפעיל ובנכס שנבחר.
 * השיחה לא נשמרת: היא ב־state של העמוד בלבד, ונמחקת כשיוצאים. ?demo=assistant-failed: התשובה הראשונה נכשלת.
 */
function AssistantPage() {
  const { propertyAppliances, propertyName } = useAppData()
  const { offline } = useOutletContext()
  const [searchParams] = useSearchParams()
  const failFirst = searchParams.get('demo') === 'assistant-failed'
  const inputId = useId()
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(null)
  const [failedOnce, setFailedOnce] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [messages, pending])

  useEffect(() => {
    if (!pending) return undefined
    const timer = setTimeout(() => {
      if (failFirst && !failedOnce) {
        setFailedOnce(true)
        setMessages((previous) => [...previous, { id: createId('message'), role: 'error', retry: pending.text }])
      } else {
        const answer = answerQuestion(pending.text, propertyAppliances, propertyName)
        setMessages((previous) => [...previous, { id: createId('message'), role: 'assistant', ...answer }])
      }
      setPending(null)
    }, ANSWER_MS)
    return () => clearTimeout(timer)
    // תשובה חדשה רק לשאלה חדשה
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending])

  // במרחב בלי מכשירים אין עוזר (FR-10.1)
  if (propertyAppliances.length === 0) return <Navigate to="/dashboard" replace />

  function ask(text) {
    const trimmed = text.trim()
    if (!trimmed) {
      setError('צריך לכתוב שאלה.')
      return
    }
    if (trimmed.length > MAX_QUESTION_LENGTH) {
      setError(`אפשר לכתוב עד ${MAX_QUESTION_LENGTH} תווים.`)
      return
    }
    setError('')
    setQuestion('')
    setMessages((previous) => [...previous, { id: createId('message'), role: 'user', text: trimmed }])
    setPending({ text: trimmed })
  }

  function retry(text) {
    setMessages((previous) => previous.filter((message) => message.role !== 'error'))
    setPending({ text })
  }

  const busy = pending !== null

  return (
    <AppPage width="reading">
      <title>העוזר · אחריות+</title>
      <PageHeader
        title="העוזר"
        back="/dashboard"
        actions={
          messages.length > 0 && (
            <TextButton
              onClick={() => {
                setMessages([])
                setPending(null)
              }}
            >
              שיחה חדשה
            </TextButton>
          )
        }
      />

      <div className="assistant">
        {messages.length === 0 && !busy && (
          <ul className="assistant__suggestions" aria-label="הצעות לשאלות">
            {ASSISTANT_SUGGESTIONS.map((suggestion) => (
              <li key={suggestion}>
                <button type="button" className="assistant__suggestion" disabled={offline} onClick={() => ask(suggestion)}>
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        )}

        <ol className="assistant__chat" aria-live="polite" aria-label="השיחה">
          {messages.map((message) => (
            <li key={message.id} className={`chat-bubble chat-bubble--${message.role}`}>
              {message.role === 'user' && (
                <>
                  <span className="visually-hidden">אתם: </span>
                  <p className="chat-bubble__text">{message.text}</p>
                </>
              )}
              {message.role === 'assistant' && (
                <>
                  <span className="visually-hidden">העוזר: </span>
                  <p className="chat-bubble__text">{message.text}</p>
                  {message.links.length > 0 && (
                    <ul className="chat-bubble__links">
                      {message.links.map((appliance) => (
                        <li key={appliance.id}>
                          <Link to={`/appliances/${appliance.id}`} className="chat-bubble__link">
                            <bdi>{propertyName(appliance) ? `${appliance.name} · ${propertyName(appliance)}` : appliance.name}</bdi>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
              {message.role === 'error' && (
                <Notice
                  tone="error"
                  action={
                    <Button variant="secondary" icon="refresh" onClick={() => retry(message.retry)}>
                      לנסות שוב
                    </Button>
                  }
                >
                  העוזר לא זמין כרגע. נסו שוב בעוד רגע.
                </Notice>
              )}
            </li>
          ))}
          {busy && (
            <li className="chat-bubble chat-bubble--assistant chat-bubble--pending">
              <p className="chat-bubble__text">מחפשים במרחב…</p>
              <TextButton onClick={() => setPending(null)}>עצירה</TextButton>
            </li>
          )}
        </ol>
        <div ref={endRef} />

        <form
          className="assistant__form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            ask(question)
          }}
        >
          <label htmlFor={inputId} className="field__label">
            שאלו על המכשירים שלכם
          </label>
          <div className="assistant__input-row">
            <input
              id={inputId}
              name="question"
              className="field__control assistant__input"
              dir="auto"
              autoComplete="off"
              value={question}
              disabled={offline}
              aria-invalid={error ? true : undefined}
              aria-describedby={`${inputId}-note${error ? ` ${inputId}-error` : ''}`}
              onChange={(event) => {
                setQuestion(event.target.value)
                if (error) setError('')
              }}
            />
            <IconButton icon="send" flipInRtl label="שליחה" type="submit" disabled={busy || offline} className="assistant__send" />
          </div>
          {error && (
            <p id={`${inputId}-error`} className="field__error" role="alert">
              {error}
            </p>
          )}
          <p id={`${inputId}-note`} className="assistant__note">
            {offline ? 'יהיה זמין כשהחיבור יחזור' : 'העוזר עונה לפי המידע במרחב. לפני החלטה, כדאי לבדוק בכרטיס המכשיר.'}
          </p>
          <p className="assistant__note">השיחה לא נשמרת: כשיוצאים מהמסך, היא נמחקת.</p>
        </form>
      </div>
    </AppPage>
  )
}

export default AssistantPage
