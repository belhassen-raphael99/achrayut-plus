import { useId } from 'react'
import Chip from '../../ui/Chip/Chip.jsx'
import Icon from '../../ui/Icon/Icon.jsx'
import TextLink from '../../ui/TextLink/TextLink.jsx'
import ContactButton from '../ContactButton/ContactButton.jsx'
import { CONTACT_TYPES, ROOMS, findById } from '../../../data/lists.js'
import { formatDate } from '../../../utils/format.js'
import './UrgentCard.css'

/**
 * הכרטיס «לטיפול עכשיו» (D1, D3, FR-4.2, DESIGN.md §7.9): המכשיר שהאחריות שלו מסתיימת הכי קרוב,
 * עם איש הקשר הראשי וקישור לכרטיס. בלי מכשיר כזה (appliance ריק): המשפט הרגוע.
 */
function UrgentCard({ appliance, status, moreCount = 0 }) {
  const titleId = useId()

  if (!appliance) {
    return (
      <section className="urgent-card urgent-card--calm" aria-labelledby={titleId}>
        <h2 id={titleId} className="visually-hidden">
          לטיפול עכשיו
        </h2>
        <span className="urgent-card__calm-icon">
          <Icon name="check_circle" size="lg" />
        </span>
        <p>אין כרגע משהו לטפל בו. ניידע אתכם 90 ימים לפני שאחריות מסתיימת.</p>
      </section>
    )
  }

  const contact = appliance.contacts.find((item) => item.primary) ?? appliance.contacts[0]
  const room = findById(ROOMS, appliance.room)?.label

  return (
    <section className="urgent-card" aria-labelledby={titleId}>
      <div className="urgent-card__header">
        <h2 id={titleId} className="urgent-card__title">
          לטיפול עכשיו
        </h2>
        <Chip tone="soon">{status.text}</Chip>
      </div>

      <h3 className="urgent-card__name">
        <bdi>{appliance.name}</bdi>
      </h3>
      <p className="urgent-card__meta">
        {room && `${room} · `}האחריות מסתיימת ב־{formatDate(status.end)}
      </p>

      <div className="urgent-card__footer">
        {contact && (
          <div className="urgent-card__contact">
            <ContactButton contact={contact} />
            <span>
              {findById(CONTACT_TYPES, contact.type)?.short} · <bdi dir="rtl">{contact.name}</bdi>
            </span>
          </div>
        )}
        <TextLink to={`/appliances/${appliance.id}`} className="urgent-card__link">
          לכרטיס<span className="visually-hidden"> של {appliance.name}</span>
        </TextLink>
      </div>

      {moreCount > 0 && (
        <TextLink to="/appliances?tab=soon" className="urgent-card__more">
          ועוד {moreCount} {moreCount === 1 ? 'מסתיימת' : 'מסתיימות'} בקרוב
        </TextLink>
      )}
    </section>
  )
}

export default UrgentCard
