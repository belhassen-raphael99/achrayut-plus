import Icon from '../../ui/Icon/Icon.jsx'
import Photo from '../../ui/Photo/Photo.jsx'
import Container from '../../layout/Container/Container.jsx'
import { audience } from '../../../data/site.js'
import { photos } from '../../../data/photos.js'
import './Audience.css'

/**
 * «למי זה מתאים»: שלוש הפרסונות, כאריחי צילום.
 * הפרסונה הראשונה (משפחות) היא הלקוח המרכזי, ולכן האריח הגדול.
 * הצילומים זמניים מ־Unsplash (src/data/photos.js).
 */
function Audience() {
  return (
    <section className="audience" aria-labelledby="audience-title">
      <Container>
        <h2 id="audience-title" className="audience__title" data-reveal="soft">
          {audience.title}
        </h2>
        <ul className="audience__cards">
          {audience.items.map((item, index) => (
            <li
              key={item.title}
              className="audience__card"
              data-reveal="lift"
              style={{ '--reveal-index': index }}
            >
              <div className="audience__media" aria-hidden="true">
                <Photo
                  photo={photos[item.photo]}
                  sizes={index === 0 ? '(min-width: 768px) 55vw, 100vw' : '(min-width: 768px) 45vw, 100vw'}
                  maxWidth={index === 0 ? 1920 : 1440}
                  className="audience__photo"
                />
                <span className="audience__veil" />
              </div>
              <div className="audience__body">
                <span className="audience__icon">
                  <Icon name={item.icon} />
                </span>
                <h3 className="audience__card-title">{item.title}</h3>
                <p className="audience__card-text">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

export default Audience
