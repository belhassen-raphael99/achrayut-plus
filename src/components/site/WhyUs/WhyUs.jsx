import Icon from '../../ui/Icon/Icon.jsx'
import Container from '../../layout/Container/Container.jsx'
import { whyUs } from '../../../data/site.js'
import './WhyUs.css'

/** «למה אצלנו»: היתרונות שנמצאו בניתוח המתחרים. רשימה עם אייקונים, לא כרטיסים */
function WhyUs() {
  return (
    <section className="why-us" aria-labelledby="why-us-title">
      <Container>
        <h2 id="why-us-title" className="section-title" data-reveal>
          {whyUs.title}
        </h2>
        <ul className="why-us__list">
          {whyUs.items.map((item, index) => (
            <li
              key={item.title}
              className="why-us__item"
              data-reveal="lift"
              style={{ '--reveal-index': index }}
            >
              <span className="why-us__icon">
                <Icon name={item.icon} />
              </span>
              <div>
                <h3 className="why-us__item-title">{item.title}</h3>
                <p className="why-us__item-text">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

export default WhyUs
