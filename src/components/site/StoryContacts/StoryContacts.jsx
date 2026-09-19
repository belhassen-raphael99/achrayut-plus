import { Phone, Storefront, Truck, Wrench } from '@phosphor-icons/react'
import { story } from '../../../data/site.js'
import './StoryContacts.css'

const ICONS = { seller: Storefront, importer: Truck, installer: Wrench }

/**
 * שלושת אנשי הקשר של מכשיר (PRD §5.6): מוכר, יבואן, מתקין. בפרקים 3 ו־5 של דף הבית.
 * איור של רכיב אמיתי: ההורה מסמן אותו aria-hidden ונותן את המשמעות במילים.
 */
function StoryContacts({ className }) {
  return (
    <ul className={['story-contacts', className].filter(Boolean).join(' ')}>
      {story.contacts.map((contact) => {
        const ContactIcon = ICONS[contact.id]
        const missing = contact.id === 'installer'
        return (
          <li key={contact.id} className="story-contacts__row">
            <ContactIcon weight="duotone" className="story-contacts__icon" />
            <span className="story-contacts__text">
              <span className="story-contacts__role">{contact.role}</span>
              <bdi dir="rtl" className={missing ? 'story-contacts__add' : 'story-contacts__name'}>
                {contact.value}
              </bdi>
            </span>
            {!missing && (
              <span className="story-contacts__call">
                <Phone weight="duotone" />
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default StoryContacts
