import Icon from '../../ui/Icon/Icon.jsx'
import Container from '../../layout/Container/Container.jsx'
import { trust } from '../../../data/site.js'
import './TrustBlock.css'

/** «המסמכים שלכם פרטיים» */
function TrustBlock() {
  return (
    <section className="trust" aria-labelledby="trust-title">
      <Container className="trust__inner">
        <span className="trust__icon" data-reveal>
          <Icon name="lock" />
        </span>
        <h2 id="trust-title" className="section-title trust__title" data-reveal style={{ '--reveal-index': 1 }}>
          {trust.title}
        </h2>
        <ul className="trust__list">
          {trust.items.map((item, index) => (
            <li key={item} className="trust__item" data-reveal style={{ '--reveal-index': index + 2 }}>
              <Icon name="check_circle" size="sm" className="trust__check" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

export default TrustBlock
