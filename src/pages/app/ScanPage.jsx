import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import AppPage from '../../components/layout/AppPage/AppPage.jsx'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import FilePicker from '../../components/ui/FilePicker/FilePicker.jsx'
import StateMessage from '../../components/ui/StateMessage/StateMessage.jsx'
import RadioCards from '../../components/ui/RadioCards/RadioCards.jsx'
import TextButton from '../../components/ui/TextButton/TextButton.jsx'
import Chip from '../../components/ui/Chip/Chip.jsx'
import AnalysisSteps from '../../components/app/AnalysisSteps/AnalysisSteps.jsx'
import ApplianceForm from '../../components/app/ApplianceForm/ApplianceForm.jsx'
import InvoiceThumbnail from '../../components/app/InvoiceThumbnail/InvoiceThumbnail.jsx'
import StageFrame from '../../components/ui/StageFrame/StageFrame.jsx'
import InvoiceArtifact from '../../components/ui/InvoiceArtifact/InvoiceArtifact.jsx'
import { useAppData } from '../../data/useAppData.js'
import { sampleAppliance } from '../../data/site.js'
import { analysisSteps } from '../../data/scanResults.js'
import { applianceFromForm, durationFields, formFromScanResult } from '../../utils/applianceForm.js'
import { isAcceptedUpload, isPdf } from '../../utils/files.js'
import { formatDate, formatPrice } from '../../utils/format.js'
import './AppPages.css'

// השלבים מתקדמים בזמן שהשרת קורא; השלב האחרון נשאר עד שהתשובה חוזרת (N4)
const STEP_MS = 2500

const ACCEPT_ANY = 'image/*,application/pdf'

/** לאן עוברים עם קובץ: קובץ לא מתאים (N8) · מכסה שנגמרה (N10) · PDF ישר לקריאה · תמונה לתצוגה מקדימה (N3) */
function phaseForFile(file, quotaRemaining) {
  if (!isAcceptedUpload(file)) return 'invalid'
  if (quotaRemaining === 0) return 'quota'
  return isPdf(file) ? 'analysing' : 'preview'
}

/**
 * הוספת מכשיר מקובץ (N3–N10, N13 · FR-2.2–2.7). הקובץ נבחר בתפריט ההוספה (N1); בכניסה ישירה בוחרים אותו כאן.
 * שלבים: pick · preview · analysing · choose (כמה מוצרים) · review · unreadable · unavailable · invalid · quota
 * הקריאה עצמה נעשית ב־Edge Function (scan-invoice), והמכסה נבדקת שם (FR-2.3).
 */
function ScanPage() {
  const navigate = useNavigate()
  const {
    isViewer,
    activeSpace,
    scan,
    scanQuota,
    startScan,
    clearScan,
    keepScanLines,
    analyse,
    addAppliance,
    removeInboxItem,
  } = useAppData()

  const [phase, setPhase] = useState(() => {
    if (!scan) return 'pick'
    // חשבונית שהועברה במייל כבר נקראה: ישר לבדיקה (FR-9.3)
    if (scan.result) return 'review'
    if (scan.lines?.length) return 'choose'
    return phaseForFile(scan.file, scanQuota.remaining)
  })
  const [stepIndex, setStepIndex] = useState(1)
  const [lines, setLines] = useState(() => scan?.lines ?? [])
  const [selectedLine, setSelectedLine] = useState(() => scan?.lines?.[0]?.id ?? '')
  const [result, setResult] = useState(() => scan?.result ?? null)
  const abortRef = useRef(null)

  const source = scan?.source ?? 'invoice'
  const steps = analysisSteps(source)

  // הקריאה עצמה: השלבים מתקדמים בזמן שהשרת עובד, והתשובה קובעת לאן ממשיכים
  useEffect(() => {
    if (phase !== 'analysing') return undefined

    let live = true
    let index = 1
    const timer = setInterval(() => {
      index += 1
      if (index < steps.length) setStepIndex(index)
      else clearInterval(timer)
    }, STEP_MS)

    const controller = new AbortController()
    abortRef.current = controller

    analyse(scan.file, source, controller.signal)
      .then((answer) => {
        if (!live) return
        // «לא הצלחנו לקרוא» (N7) · «לא זמין» (N9, לא נספר) · המכסה נגמרה (N10)
        if (answer.status === 'quota') return setPhase('quota')
        if (answer.status !== 'succeeded') {
          return setPhase(answer.status === 'unreadable' ? 'unreadable' : 'unavailable')
        }
        // כמה מוצרים בחשבונית אחת: בוחרים אחד (FR-2.6)
        if (answer.items.length > 1) {
          setLines(answer.items)
          setSelectedLine(answer.items[0].id)
          return setPhase('choose')
        }
        setResult(answer.items[0])
        setPhase('review')
      })
      .catch(() => {
        if (live) setPhase('unavailable')
      })

    return () => {
      live = false
      clearInterval(timer)
    }
    // הקריאה מתחילה כשנכנסים לשלב הזה; שאר הערכים קבועים בזמן הקריאה
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // בצפייה בלבד אין הוספה, גם כשנכנסים ישר לכתובת (FR-1.6)
  if (isViewer) return <Navigate to="/dashboard" replace />

  function startAnalysis() {
    setStepIndex(1)
    setPhase('analysing')
  }

  function pickFile(file) {
    const nextSource = source === 'label' ? 'label' : isPdf(file) ? 'pdf' : 'invoice'
    startScan(file, nextSource)
    setStepIndex(1)
    setPhase(phaseForFile(file, scanQuota.remaining))
  }

  function cancel() {
    abortRef.current?.abort()
    clearScan()
    navigate('/dashboard', { replace: true })
  }

  function goManual() {
    // הקובץ עובר להזנה הידנית ולא הולך לאיבוד (FR-2.7)
    navigate('/appliances/new/manual', { state: { fromScan: true } })
  }

  async function saveFromReview(values) {
    const original = durationFields(result.warrantyMonths)
    const durationUnchanged = values.duration === original.duration && values.customMonths === original.customMonths
    const warrantySource = source === 'label' || !durationUnchanged ? 'manual' : 'invoice'

    const appliance = applianceFromForm(values, {
      spaceId: activeSpace.id,
      warrantySource,
      // הקובץ עצמו עולה ל־Storage עם המוצר (docs/07 §8)
      documents: [{ type: source === 'label' ? 'other' : 'invoice', file: scan.file }],
    })
    const id = await addAppliance(appliance)
    // חשבונית שהועברה במייל יוצאת מ«ממתינות לבדיקה» אחרי השמירה (FR-9.3)
    if (scan.inboxId) await removeInboxItem(scan.inboxId)

    // חשבונית עם כמה מכשירים: השאר נשמרים להוספה בלי סריקה נוספת (FR-2.6)
    const remaining = lines.filter((line) => line.id !== result.id)
    if (source === 'pdf' && remaining.length > 0) keepScanLines(remaining)
    else clearScan()

    navigate(`/appliances/${id}`, { replace: true, state: { toast: 'המוצר נשמר' } })
  }

  const header = (title) => (
    <>
      <title>{`${title} · אחריות+`}</title>
      <PageHeader title={title} back="/dashboard" />
    </>
  )

  if (phase === 'pick') {
    return (
      <AppPage width="reading">
        {header('הוספת מוצר')}
        {/* אותה במה שהאתר מבטיח («איך זה עובד»): המשתמש רואה כאן בדיוק מה עומד לקרות */}
        <div className="scan-page__stage" aria-hidden="true" data-reveal="lift">
          <StageFrame>
            <InvoiceArtifact
              seller={sampleAppliance.seller}
              item={sampleAppliance.name}
              model={sampleAppliance.model}
              price={sampleAppliance.price}
              date={sampleAppliance.purchaseDate}
            />
          </StageFrame>
        </div>
        <StateMessage
          tone="info"
          titleAs="h2"
          size="sm"
          title="בחרו את החשבונית"
          actions={
            <>
              <FilePicker accept={ACCEPT_ANY} onFile={pickFile} icon="upload_file" fullWidth>
                צילום או בחירת קובץ
              </FilePicker>
              <Button variant="secondary" to="/appliances/new/manual" fullWidth>
                הזנה ידנית
              </Button>
            </>
          }
          className="scan-page__state"
        >
          <p>תמונה או PDF עד 10MB.</p>
        </StateMessage>
      </AppPage>
    )
  }

  if (phase === 'invalid') {
    return (
      <AppPage width="reading">
        {header('הוספת מוצר')}
        <StateMessage
          icon="description"
          tone="error"
          titleAs="h2"
          size="sm"
          title="אי אפשר להעלות את הקובץ הזה"
          actions={
            <>
              <FilePicker accept={ACCEPT_ANY} onFile={pickFile} fullWidth>
                בחירת קובץ אחר
              </FilePicker>
              <Button variant="secondary" to="/appliances/new/manual" fullWidth onClick={clearScan}>
                הזנה ידנית
              </Button>
            </>
          }
          className="scan-page__state"
        >
          <p>אפשר להעלות תמונה או PDF עד 10MB.</p>
        </StateMessage>
      </AppPage>
    )
  }

  if (phase === 'quota') {
    return (
      <AppPage width="reading">
        {header('הוספת מוצר')}
        <StateMessage
          icon="photo_camera"
          titleAs="h2"
          size="sm"
          title={`השתמשתם בכל ${scanQuota.limit} הסריקות של החודש`}
          actions={
            <>
              <Button variant="primary" fullWidth onClick={goManual}>
                הזנה ידנית
              </Button>
              <Button variant="secondary" to="/pricing" fullWidth>
                לתוכניות
              </Button>
            </>
          }
          className="scan-page__state"
        >
          <p>
            אפשר להמשיך בהזנה ידנית, או לעבור לפרו כדי לקבל עוד סריקות. הסריקות מתחדשות ב־
            {formatDate(scanQuota.renewsOn).slice(0, 5)}.
          </p>
        </StateMessage>
      </AppPage>
    )
  }

  if (phase === 'preview') {
    const label = source === 'label'
    return (
      <AppPage width="reading">
        {header('הוספת מוצר')}
        <div className="scan-page">
          <InvoiceThumbnail file={scan.file} url={scan.url} size="preview" alt={label ? 'התווית שצילמתם' : 'החשבונית שצילמתם'} />
          <div className="scan-page__text">
            <h2 className="scan-page__title">התמונה ברורה?</h2>
            <p>{label ? 'ודאו שרואים את המותג, הדגם והמספר הסידורי.' : 'ודאו שרואים את שם המוכר, התאריך והסכום.'}</p>
          </div>
          <div className="scan-page__actions">
            <Button variant="primary" fullWidth onClick={startAnalysis}>
              שימוש בתמונה
            </Button>
            <FilePicker variant="secondary" accept="image/*" capture="environment" onFile={pickFile} fullWidth>
              צילום מחדש
            </FilePicker>
          </div>
        </div>
      </AppPage>
    )
  }

  if (phase === 'analysing') {
    return (
      <AppPage width="reading">
        {header('הוספת מוצר')}
        <div className="scan-page">
          <InvoiceThumbnail file={scan.file} url={scan.url} alt="הקובץ שנקרא" />
          <AnalysisSteps steps={steps} current={stepIndex} />
          <TextButton onClick={cancel} className="scan-page__cancel">
            ביטול
          </TextButton>
        </div>
      </AppPage>
    )
  }

  if (phase === 'unreadable' || phase === 'unavailable') {
    const unreadable = phase === 'unreadable'
    return (
      <AppPage width="reading">
        {header('הוספת מוצר')}
        <div className="scan-page">
          <InvoiceThumbnail file={scan.file} url={scan.url} alt="הקובץ שהועלה" />
          <StateMessage
            icon={unreadable ? 'error' : 'cloud_off'}
            titleAs="h2"
            size="sm"
            title={unreadable ? 'לא הצלחנו לקרוא את החשבונית' : 'הקריאה האוטומטית לא זמינה כרגע'}
            actions={
              <>
                {unreadable ? (
                  // קובץ PDF שלא נקרא → בוחרים קובץ אחר (תמונה או PDF); צילום → המצלמה של הטלפון (FR-2.2)
                  <FilePicker
                    accept={source === 'pdf' ? ACCEPT_ANY : 'image/*'}
                    capture={source === 'pdf' ? undefined : 'environment'}
                    onFile={pickFile}
                    fullWidth
                  >
                    {source === 'pdf' ? 'בחירת קובץ אחר' : 'צילום מחדש'}
                  </FilePicker>
                ) : (
                  <Button variant="primary" fullWidth onClick={startAnalysis}>
                    לנסות שוב
                  </Button>
                )}
                <Button variant="secondary" fullWidth onClick={goManual}>
                  הזנה ידנית
                </Button>
              </>
            }
          >
            <p>
              {unreadable
                ? 'התמונה נשמרה. אפשר לצלם שוב באור טוב יותר, או להזין את הפרטים ידנית.'
                : 'זו תקלה זמנית אצלנו. התמונה נשמרה, והסריקה לא נספרה במכסה. נסו שוב בעוד כמה דקות.'}
            </p>
          </StateMessage>
        </div>
      </AppPage>
    )
  }

  if (phase === 'choose') {
    return (
      <AppPage width="reading">
        {header('הוספת מוצר')}
        <form
          className="scan-page"
          onSubmit={(event) => {
            event.preventDefault()
            setResult(lines.find((line) => line.id === selectedLine))
            setPhase('review')
          }}
        >
          <div className="scan-page__text">
            <h2 className="scan-page__title">מצאנו כמה מוצרים בחשבונית</h2>
            <p>בחרו את המוצר שתרצו להוסיף עכשיו. את השאר אפשר להוסיף אחר כך.</p>
          </div>
          <RadioCards
            legend="המוצרים בחשבונית"
            name="line"
            options={lines.map((line) => ({
              id: line.id,
              label: line.line || line.name,
              description: line.price ? formatPrice(line.price) : undefined,
            }))}
            value={selectedLine}
            onChange={(event) => setSelectedLine(event.target.value)}
          />
          <Button type="submit" variant="primary" fullWidth>
            המשך לבדיקה
          </Button>
        </form>
      </AppPage>
    )
  }

  // review: בדיקת הפרטים לפני שמירה (N5, N13). שום דבר לא נשמר לפני «שמירה» (FR-2.5)
  const label = source === 'label'
  const verify = Object.fromEntries(result.uncertain.map((field) => [field, 'לבדוק']))
  if (!result.warrantyMonths) verify.duration = 'משוער לפי קטגוריה'

  return (
    <AppPage width="reading">
      {header('בדיקת הפרטים')}
      <ApplianceForm
        key={result.id ?? source}
        initialValues={formFromScanResult(result)}
        verify={verify}
        purchaseDateHelper={
          label && !result.purchaseDate
            ? 'התאריך לא מופיע בתווית. בלי תאריך, המוצר יישמר עם «תאריך לא ידוע».'
            : undefined
        }
        submitLabel="שמירה"
        onSubmit={saveFromReview}
      >
        <div className="scan-summary">
          <InvoiceThumbnail file={scan.file} url={scan.url} size="sm" alt={label ? 'התווית' : 'החשבונית'} />
          <div className="scan-summary__text">
            {label ? <Chip tone="verify">מהתווית</Chip> : <p>בדקו ותקנו לפני השמירה</p>}
            <a href={scan.url} target="_blank" rel="noreferrer" className="text-link">
              {label ? 'הצגת התמונה' : 'הצגת החשבונית'}
            </a>
          </div>
        </div>
      </ApplianceForm>
    </AppPage>
  )
}

export default ScanPage
