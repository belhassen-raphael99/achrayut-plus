import Button from '../../ui/Button/Button.jsx'
import Photo from '../../ui/Photo/Photo.jsx'
import StoreBadges from '../StoreBadges/StoreBadges.jsx'
import Container from '../../layout/Container/Container.jsx'
import { closing } from '../../../data/site.js'
import { photos } from '../../../data/photos.js'
import './ClosingBand.css'

/** הפס המסכם: סלון מסודר מאחורי וילון כחול — «הבית שלכם, מסודר» מקבל תמונה (צילום זמני, src/data/photos.js) */
function ClosingBand() {
  return (
    <section className="closing-band surface-dark" aria-labelledby="closing-band-title">
      <div className="closing-band__media" aria-hidden="true">
        <div className="closing-band__photo-wrap parallax">
          <Photo photo={photos.livingRoom} sizes="100vw" className="closing-band__photo" />
        </div>
        <span className="closing-band__veil" />
      </div>
      <Container className="closing-band__inner">
        <h2 id="closing-band-title" className="closing-band__title" data-reveal="soft">
          {closing.title}
        </h2>
        <div className="closing-band__actions">
          <div data-reveal style={{ '--reveal-index': 1 }}>
            <Button variant="accent" to="/signup">
              {closing.cta}
            </Button>
          </div>
          <StoreBadges className="closing-band__stores" data-reveal style={{ '--reveal-index': 2 }} />
        </div>
      </Container>
    </section>
  )
}

export default ClosingBand
