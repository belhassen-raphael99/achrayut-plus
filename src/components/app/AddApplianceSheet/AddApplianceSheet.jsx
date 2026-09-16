import { useState } from 'react'
import { useNavigate } from 'react-router'
import Sheet from '../../ui/Sheet/Sheet.jsx'
import ActionRow from '../../ui/ActionRow/ActionRow.jsx'
import Button from '../../ui/Button/Button.jsx'
import ScanQuota from '../ScanQuota/ScanQuota.jsx'
import { useAppData } from '../../../data/useAppData.js'
import { formatDate } from '../../../utils/format.js'
import './AddApplianceSheet.css'

// בטלפון נפתחת המצלמה של הטלפון עצמו (capture); במחשב נפתחת בחירת קובץ (FR-2.2)
const SCAN_WAYS = [
  {
    id: 'invoice',
    icon: 'photo_camera',
    title: 'צילום חשבונית',
    description: 'נמלא את הפרטים בשבילכם',
    accept: 'image/*',
    capture: 'environment',
  },
  {
    id: 'pdf',
    icon: 'upload_file',
    title: 'העלאת קובץ PDF',
    description: 'חשבונית שקיבלתם במייל',
    accept: 'application/pdf',
  },
  {
    id: 'label',
    icon: 'label',
    title: 'צילום התווית של המכשיר',
    description: 'כשאין חשבונית',
    accept: 'image/*',
    capture: 'environment',
  },
]

/**
 * ארבע הדרכים להוסיף מכשיר, וכמה סריקות נותרו החודש (N1, FR-2.1).
 * כשהמכסה נגמרה, דרכי הסריקה מציגות את «השתמשתם בכל הסריקות» (N10, FR-2.3).
 */
function AddApplianceSheet({ open, onClose }) {
  const navigate = useNavigate()
  const { scanQuota, startScan } = useAppData()
  const [quotaReached, setQuotaReached] = useState(false)

  function close() {
    setQuotaReached(false)
    onClose()
  }

  function handleFile(file, source) {
    startScan(file, source)
    close()
    navigate('/appliances/new/scan')
  }

  if (quotaReached) {
    return (
      <Sheet open={open} onClose={close} title={`השתמשתם בכל ${scanQuota.limit} הסריקות של החודש`}>
        <div className="add-appliance-sheet__quota">
          <p>
            אפשר להמשיך בהזנה ידנית, או לעבור לפרו כדי לקבל עוד סריקות. הסריקות מתחדשות ב־
            {formatDate(scanQuota.renewsOn).slice(0, 5)}.
          </p>
          {/* הפוקוס עובר לפעולה הראשית, כי השורה שנלחצה כבר לא במסך (autoFocus עובד רק על button) */}
          <Button
            variant="primary"
            fullWidth
            autoFocus
            onClick={() => {
              close()
              navigate('/appliances/new/manual')
            }}
          >
            הזנה ידנית
          </Button>
          <Button variant="secondary" to="/pricing" fullWidth onClick={close}>
            לתוכניות
          </Button>
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet open={open} onClose={close} title="הוספת מכשיר">
      <ul className="add-appliance-sheet__list">
        {SCAN_WAYS.map((way) => (
          <li key={way.id}>
            {scanQuota.remaining > 0 ? (
              <ActionRow
                icon={way.icon}
                title={way.title}
                description={way.description}
                fileInput={{ accept: way.accept, capture: way.capture, onFile: (file) => handleFile(file, way.id) }}
              />
            ) : (
              <ActionRow
                icon={way.icon}
                title={way.title}
                description={way.description}
                onClick={() => setQuotaReached(true)}
              />
            )}
          </li>
        ))}
        <li>
          <ActionRow
            to="/appliances/new/manual"
            icon="edit_note"
            title="הזנה ידנית"
            description="ממלאים את הפרטים בעצמכם"
            onClick={close}
          />
        </li>
      </ul>
      <ScanQuota used={scanQuota.used} limit={scanQuota.limit} />
    </Sheet>
  )
}

export default AddApplianceSheet
