import Icon from '../../ui/Icon/Icon.jsx'
import Photo from '../../ui/Photo/Photo.jsx'
import { trust } from '../../../data/site.js'
import { photos } from '../../../data/photos.js'
import './TrustBlock.css'

/** «המסמכים שלכם פרטיים»: האריח הגדול בבנטו של «למה אצלנו», על צילום של מסמכים */
function TrustBlock() {
  return (
    <div className="trust">
      <div className="trust__media" aria-hidden="true">
        <Photo photo={photos.paperwork} sizes="(min-width: 1024px) 50vw, 100vw" maxWidth={1440} className="trust__photo" />
        <span className="trust__veil" />
      </div>
      <span className="trust__icon">
        <Icon name="lock" />
      </span>
      <h3 className="trust__title">{trust.title}</h3>
      <ul className="trust__list">
        {trust.items.map((item) => (
          <li key={item} className="trust__item">
            <Icon name="check_circle" size="sm" className="trust__check" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TrustBlock
