import StageFrame from '../../ui/StageFrame/StageFrame.jsx'
import InvoiceArtifact from '../../ui/InvoiceArtifact/InvoiceArtifact.jsx'
import TextLink from '../../ui/TextLink/TextLink.jsx'
import TextButton from '../../ui/TextButton/TextButton.jsx'
import AddInvoiceButton from '../AddInvoiceButton/AddInvoiceButton.jsx'
import { sampleAppliance } from '../../../data/site.js'
import './DashboardEmpty.css'

/**
 * מרחב בלי מכשירים (D2, FR-4.4): «צילום חשבונית» ו«הזנה ידנית».
 * בלי חיבור: שתי הפעולות מושבתות, עם ההסבר «יהיה זמין כשהחיבור יחזור» (DESIGN.md §8).
 * בצפייה בלבד הכרטיס לא מוצג (הדף מציג משפט בלי כפתורים).
 * הבמה: אותה חשבונית שהאתר מראה, כדי שהצעד הראשון ייראה בדיוק כמו ההבטחה.
 */
function DashboardEmpty({ offline, onAdd, className }) {
  return (
    <section className={['dashboard-empty', className].filter(Boolean).join(' ')} aria-labelledby="dashboard-empty-title">
      <h2 id="dashboard-empty-title" className="visually-hidden">
        הוספת המוצר הראשון
      </h2>
      <div className="dashboard-empty__stage" aria-hidden="true">
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
      {/* במחשב «צילום חשבונית» הממולא נמצא בסרגל הצד: כפתור ממולא אחד בכל מסך. בלי חיבור הוא משני, ולכן נשאר */}
      <AddInvoiceButton
        offline={offline}
        onClick={onAdd}
        className={['dashboard-empty__add', !offline && 'dashboard-empty__add--mobile-only'].filter(Boolean).join(' ')}
      />
      {offline ? (
        <TextButton disabled>הזנה ידנית</TextButton>
      ) : (
        <TextLink to="/appliances/new/manual" arrow={false}>
          הזנה ידנית
        </TextLink>
      )}
    </section>
  )
}

export default DashboardEmpty
