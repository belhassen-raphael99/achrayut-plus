import Chip from '../../ui/Chip/Chip.jsx'
import IconButton from '../../ui/IconButton/IconButton.jsx'
import ContactButton from '../ContactButton/ContactButton.jsx'
import { CONTACT_TYPES, findById } from '../../../data/lists.js'
import './ContactRow.css'

/**
 * איש קשר בכרטיס המכשיר (F1, DESIGN.md §7.13): סוג ושם, הערה, טלפון/אימייל/אתר משמאל לימין,
 * כפתור חיוג. onEdit (גישה מלאה בלבד) → כפתור עריכה.
 */
function ContactRow({ contact, onEdit }) {
  const type = findById(CONTACT_TYPES, contact.type)
  const values = [contact.phone, contact.email].filter(Boolean)

  return (
    <div className="contact-row">
      <div className="contact-row__text">
        <p className="contact-row__title">
          <span>
            {type?.short} · <bdi dir="rtl">{contact.name}</bdi>
          </span>
          {contact.primary && <Chip tone="role">ראשי</Chip>}
        </p>
        {contact.note && <p className="contact-row__note">{contact.note}</p>}
        {values.map((value) => (
          <p key={value} className="contact-row__value">
            <bdi dir="ltr">{value}</bdi>
          </p>
        ))}
        {contact.website && (
          <p className="contact-row__value">
            <a href={contact.website} target="_blank" rel="noreferrer">
              <bdi dir="ltr">{contact.website}</bdi>
            </a>
          </p>
        )}
      </div>
      {onEdit && <IconButton icon="edit" label={`עריכת ${contact.name}`} onClick={() => onEdit(contact)} />}
      <ContactButton contact={contact} />
    </div>
  )
}

export default ContactRow
