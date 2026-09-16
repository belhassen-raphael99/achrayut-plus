import Disclosure from '../../ui/Disclosure/Disclosure.jsx'
import TextLink from '../../ui/TextLink/TextLink.jsx'
import Container from '../../layout/Container/Container.jsx'
import { faqItems, homeFaqIds } from '../../../data/site.js'
import './FaqPreview.css'

/** שלוש שאלות נפוצות בדף הבית, והפניה לכל השאלות */
function FaqPreview() {
  const items = homeFaqIds.map((id) => faqItems.find((item) => item.id === id)).filter(Boolean)

  return (
    <section className="faq-preview" aria-labelledby="faq-preview-title">
      <Container width="reading">
        <h2 id="faq-preview-title" className="section-title" data-reveal>
          שאלות נפוצות
        </h2>
        <div className="faq-preview__list">
          {items.map((item, index) => (
            <div key={item.id} data-reveal style={{ '--reveal-index': index }}>
              <Disclosure title={item.question}>{item.answer}</Disclosure>
            </div>
          ))}
        </div>
        <TextLink to="/faq" className="faq-preview__more">
          לכל השאלות
        </TextLink>
      </Container>
    </section>
  )
}

export default FaqPreview
