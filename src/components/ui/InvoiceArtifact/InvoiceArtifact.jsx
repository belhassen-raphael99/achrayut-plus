import { formatDate, formatPrice } from '../../../utils/format.js'
import './InvoiceArtifact.css'

/**
 * חשבונית מאוירת: נייר מוטה, קו סריקה עובר עליה.
 * reading: שלב הקריאה — אין קו סריקה, והשדות שזוהו (מוכר, דגם, תאריך) מסומנים אחד אחרי השני.
 * הנתונים מגיעים כ־props, כדי שרכיב ה־ui לא יהיה תלוי בנתוני הדוגמה של האתר.
 */
function InvoiceArtifact({ seller, item, model, price, date, reading = false }) {
  return (
    <div className={['stage-invoice', reading && 'stage-invoice--reading'].filter(Boolean).join(' ')}>
      <div className="stage-invoice__head">
        <span className="stage-invoice__seller" data-field="seller">
          {seller}
        </span>
        <span className="stage-invoice__kind">חשבונית מס / קבלה</span>
      </div>

      <div className="stage-invoice__line">
        <span className="stage-invoice__item">
          <span>{item}</span>
          <span className="stage-invoice__model" dir="ltr" data-field="model">
            {model}
          </span>
        </span>
        <span className="stage-invoice__amount">{formatPrice(price)}</span>
      </div>

      <div className="stage-invoice__foot">
        <span className="stage-invoice__date" dir="ltr" data-field="date">
          {formatDate(date)}
        </span>
        <span className="stage-invoice__total">
          סה״כ <strong>{formatPrice(price)}</strong>
        </span>
      </div>

      <span className="stage-invoice__barcode" />
      {!reading && <span className="stage-invoice__scan" />}
    </div>
  )
}

export default InvoiceArtifact
