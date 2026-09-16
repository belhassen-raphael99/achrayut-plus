import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import CodeInput from '../../components/ui/CodeInput/CodeInput.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import { useAppData } from '../../data/useAppData.js'
import { INVITE_CODE_LENGTH } from '../../utils/inviteCode.js'
import '../app/AppPages.css'
import './OnboardingPages.css'

// הודעה אחת לקוד שגוי ולקוד שפג תוקפו (FR-1.4, O4)
const INVALID_CODE_MESSAGE = 'הקוד לא נכון או שפג תוקפו. בקשו קוד חדש ממי שהזמין אתכם.'

/**
 * הצטרפות למרחב עם קוד (O3, O4). קוד תקף → «הצטרפתם» (O5).
 * קוד הדוגמה: BLH4K2 (הזמנה של רחל כהן ל«משפחת לוי»).
 */
function JoinSpacePage() {
  const navigate = useNavigate()
  const { spaces, joinSpace } = useAppData()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  function handleCodeChange(nextCode) {
    setCode(nextCode)
    if (error) setError('')
  }

  function handleSubmit(event) {
    event.preventDefault()

    let message = INVALID_CODE_MESSAGE
    if (code.length === 0) {
      message = 'צריך להזין את הקוד שקיבלתם.'
    } else if (code.length < INVITE_CODE_LENGTH) {
      message = 'הקוד כולל 6 תווים. בדקו שהקלדתם את כולם.'
    } else {
      const result = joinSpace(code)
      if (result.status === 'joined') {
        navigate('/onboarding/joined', { replace: true, state: result })
        return
      }
      if (result.status === 'member') {
        navigate('/dashboard', { replace: true })
        return
      }
    }

    setError(message)
    inputRef.current?.focus()
  }

  return (
    <div className="onboarding-page">
      <title>הצטרפות למרחב · אחריות+</title>
      <PageHeader title="הצטרפות למרחב" back={spaces.length > 0 ? '/dashboard' : '/onboarding'} />

      <form className="app-form app-form--plate" noValidate onSubmit={handleSubmit}>
        <CodeInput
          ref={inputRef}
          label="הזינו את הקוד שקיבלתם בהזמנה."
          value={code}
          onChange={handleCodeChange}
          error={error}
        />
        <Button type="submit" variant="primary" fullWidth>
          הצטרפות
        </Button>
      </form>
    </div>
  )
}

export default JoinSpacePage
