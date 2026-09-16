import Icon from '../../ui/Icon/Icon.jsx'
import Container from '../../layout/Container/Container.jsx'
import TrustBlock from '../TrustBlock/TrustBlock.jsx'
import { whyUs } from '../../../data/site.js'
import './WhyUs.css'

/**
 * «למה אצלנו»: היתרונות מניתוח המתחרים, ופרטיות המסמכים — בבנטו אחד (16/09/2026).
 * במחשב: אריח הפרטיות הגדול בצד ההתחלה, היתרון הראשון אריח רחב, והשניים הנותרים קטנים.
 * בטלפון: עמודה אחת, הפרטיות אחרונה.
 */
function WhyUs() {
  return (
    <section className="why-us" aria-labelledby="why-us-title">
      <Container>
        <h2 id="why-us-title" className="why-us__title" data-reveal="soft">
          {whyUs.title}
        </h2>
        <ul className="why-us__grid">
          {whyUs.items.map((item, index) => (
            <li
              key={item.title}
              className={['why-us__tile', index === 0 && 'why-us__tile--wide'].filter(Boolean).join(' ')}
              data-reveal="lift"
              style={{ '--reveal-index': index }}
            >
              <span className="why-us__icon">
                <Icon name={item.icon} />
              </span>
              <h3 className="why-us__tile-title">{item.title}</h3>
              <p className="why-us__tile-text">{item.text}</p>
            </li>
          ))}
          <li className="why-us__tile why-us__tile--trust" data-reveal="lift" style={{ '--reveal-index': 3 }}>
            <TrustBlock />
          </li>
        </ul>
      </Container>
    </section>
  )
}

export default WhyUs
