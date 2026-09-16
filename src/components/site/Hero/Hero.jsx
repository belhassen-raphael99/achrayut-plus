import { Link } from 'react-router'
import Button from '../../ui/Button/Button.jsx'
import Icon from '../../ui/Icon/Icon.jsx'
import Photo from '../../ui/Photo/Photo.jsx'
import WarrantyLabel from '../../ui/WarrantyLabel/WarrantyLabel.jsx'
import Container from '../../layout/Container/Container.jsx'
import { hero, sampleAppliance } from '../../../data/site.js'
import { photos } from '../../../data/photos.js'
import { formatDate } from '../../../utils/format.js'
import './Hero.css'

/**
 * פתיחת דף הבית (S1, S2), בדקדוק של rmnetsec-it.com: צילום מלא, וילון כחול בצד הטקסט,
 * ותו האחריות מרחף מעל המכשירים כאובייקט.
 * הצילום זמני מ־Unsplash (החלטת רפאל, 16/09/2026) — ראו src/data/photos.js.
 */
function Hero() {
  return (
    <section className="hero surface-dark is-under-header" aria-labelledby="hero-title">
      <div className="hero__media" aria-hidden="true">
        <Photo photo={photos.heroKitchen} priority sizes="100vw" className="hero__photo" />
        <span className="hero__veil" />
      </div>

      <Container className="hero__inner">
        <div className="hero__content">
          <h1 id="hero-title" className="hero__title" data-reveal="soft">
            {hero.title}
          </h1>
          <p className="hero__text" data-reveal style={{ '--reveal-index': 1 }}>
            {hero.text}
          </p>
          <div className="hero__actions" data-reveal style={{ '--reveal-index': 2 }}>
            <Button variant="accent" to="/signup">
              {hero.cta}
            </Button>
            <Link className="hero__link" to="/#how-it-works">
              {hero.secondaryLink}
              <Icon name="chevron_right" size="sm" flipInRtl className="hero__link-icon" />
            </Link>
          </div>
          <p className="hero__note" data-reveal style={{ '--reveal-index': 3 }}>
            {hero.note}
          </p>
        </div>

        <div className="hero__visual" data-reveal="lift" style={{ '--reveal-index': 2 }}>
          <WarrantyLabel
            className="hero__label parallax-object"
            brand={sampleAppliance.brand}
            purchaseDate={sampleAppliance.purchaseDate}
            stage="soon"
            value={sampleAppliance.daysLeft}
            unit="ימים"
            lines={[`אחריות רגילה עד ${formatDate(sampleAppliance.standardUntil)} · מהחשבונית`]}
            summary={`דוגמה: האחריות על ${sampleAppliance.name} מסתיימת בעוד ${sampleAppliance.daysLeft} ימים.`}
          />
        </div>
      </Container>
    </section>
  )
}

export default Hero
