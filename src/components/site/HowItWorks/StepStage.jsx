import Icon from '../../ui/Icon/Icon.jsx'
import InvoiceArtifact from '../../ui/InvoiceArtifact/InvoiceArtifact.jsx'
import WarrantyLabel from '../../ui/WarrantyLabel/WarrantyLabel.jsx'
import { sampleAppliance } from '../../../data/site.js'
import { formatDate } from '../../../utils/format.js'
import './StepStage.css'

/*
 * מה שמוצג על הבמה בכל שלב. אותו אובייקט עובר טרנספורמציה, כמו מצלמה שעוברת מיום ללילה:
 * החשבונית ← אותה חשבונית כשהשדות מסומנים ← התו ← התו עם התזכורת מעליו.
 * איור בלבד: ההורה מסמן את הבמה aria-hidden, והטקסט של השלב נושא את המשמעות.
 */

function SampleInvoice({ reading }) {
  const { seller, name, model, price, purchaseDate } = sampleAppliance
  return (
    <InvoiceArtifact
      seller={seller}
      item={name}
      model={model}
      price={price}
      date={purchaseDate}
      reading={reading}
    />
  )
}

function StepStage({ id }) {
  if (id === 'invoice') return <SampleInvoice />
  if (id === 'fields') return <SampleInvoice reading />

  const label = (
    <WarrantyLabel
      className="stage-label"
      brand={sampleAppliance.brand}
      purchaseDate={sampleAppliance.purchaseDate}
      stage="soon"
      value={sampleAppliance.daysLeft}
      unit="ימים"
      lines={[`אחריות רגילה עד ${formatDate(sampleAppliance.standardUntil)}`]}
    />
  )

  if (id === 'label') return label

  return (
    <div className="stage-alert">
      <div className="stage-alert__behind">{label}</div>
      <div className="stage-alert__card">
        <span className="stage-alert__icon">
          <Icon name="notifications" />
        </span>
        <div className="stage-alert__body">
          <p className="stage-alert__title">
            האחריות על {sampleAppliance.name} מסתיימת בעוד {sampleAppliance.reminderDays} ימים
          </p>
          <p className="stage-alert__who">
            למי להתקשר · <bdi dir="rtl">{sampleAppliance.importer}</bdi>
          </p>
        </div>
      </div>
    </div>
  )
}

export default StepStage
