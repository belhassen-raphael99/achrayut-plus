import Icon from '../../ui/Icon/Icon.jsx'
import TextLink from '../../ui/TextLink/TextLink.jsx'
import DraftNotice from '../../ui/DraftNotice/DraftNotice.jsx'
import Container from '../../layout/Container/Container.jsx'
import { formatDate } from '../../../utils/format.js'
import './LegalDocument.css'

/**
 * תבנית לדפי קריאה ארוכה (S8, S9): תנאי שימוש, מדיניות פרטיות, הצהרת נגישות.
 * תוכן עניינים עם עוגנים, סעיפים, «חזרה למעלה». סימון «טיוטה» גלוי.
 */
function LegalDocument({ content, updatedAt }) {
  return (
    <article className="legal" aria-labelledby="legal-title">
      <Container width="reading">
        <header className="legal__header">
          <h1 id="legal-title" className="legal__title" tabIndex={-1}>
            {content.title}
          </h1>
          <p className="legal__updated">עודכן ב־{formatDate(updatedAt)}</p>
          <DraftNotice />
        </header>

        <nav className="legal__toc" aria-labelledby="legal-toc-title">
          <h2 id="legal-toc-title" className="legal__toc-title">
            תוכן העניינים
          </h2>
          <ol className="legal__toc-list">
            {content.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        {content.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="legal__section"
            aria-labelledby={`${section.id}-title`}
          >
            <h2 id={`${section.id}-title`} className="legal__section-title">
              {section.title}
            </h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.list && (
              <ul className="legal__list">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {section.providers && (
              <ul className="legal__list">
                {section.providers.map((provider) => (
                  <li key={provider.name}>
                    <bdi>{provider.name}</bdi>: {provider.text}
                  </li>
                ))}
              </ul>
            )}
            {section.closing?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.link && <TextLink to={section.link.to}>{section.link.label}</TextLink>}
          </section>
        ))}

        <a className="legal__top" href="#legal-title">
          <Icon name="arrow_upward" size="sm" />
          <span>חזרה למעלה</span>
        </a>
      </Container>
    </article>
  )
}

export default LegalDocument
