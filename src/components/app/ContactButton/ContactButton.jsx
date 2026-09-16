import Icon from '../../ui/Icon/Icon.jsx'
import './ContactButton.css'

/** «טלפון» → קישור tel: עם ספרות ו־+ בלבד */
function telHref(phone) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

/**
 * כפתור חיוג עגול 44px (DESIGN.md §7.13). בלי טלפון ועם אימייל: כפתור מייל.
 * לחיצה יוצאת מהאפליקציה (חייגן או תוכנת מייל).
 */
function ContactButton({ contact }) {
  if (contact.phone) {
    return (
      <a className="contact-button" href={telHref(contact.phone)} aria-label={`להתקשר ל־${contact.name}`}>
        <Icon name="call" />
      </a>
    )
  }

  if (contact.email) {
    return (
      <a className="contact-button" href={`mailto:${contact.email}`} aria-label={`לשלוח מייל ל־${contact.name}`}>
        <Icon name="mail" />
      </a>
    )
  }

  return null
}

export default ContactButton
