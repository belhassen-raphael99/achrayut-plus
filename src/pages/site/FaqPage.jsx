import { useState } from 'react'
import PageIntro from '../../components/site/PageIntro/PageIntro.jsx'
import FilterChips from '../../components/ui/FilterChips/FilterChips.jsx'
import SiteFaq from '../../components/site/SiteFaq/SiteFaq.jsx'
import TextLink from '../../components/ui/TextLink/TextLink.jsx'
import { Headset } from '@phosphor-icons/react'
import Container from '../../components/layout/Container/Container.jsx'
import { faqCategories, faqDefaultOpenId, faqItems } from '../../data/site.js'
import { photos } from '../../data/photos.js'
import './SitePages.css'

/** שאלות נפוצות (S5), בלי הכפתור והתגית ש־Stitch המציא */
function FaqPage() {
  const [category, setCategory] = useState('all')
  const visibleItems = category === 'all' ? faqItems : faqItems.filter((item) => item.category === category)

  return (
    <>
      <title>שאלות נפוצות · אחריות+</title>
      <PageIntro title="שאלות נפוצות" tone="dark" photo={photos.paperwork} width="reading" />

      <Container width="reading" className="site-page">
        <FilterChips
          label="סינון לפי נושא"
          options={faqCategories}
          value={category}
          onChange={setCategory}
        />

        <SiteFaq items={visibleItems} defaultOpenId={faqDefaultOpenId} className="faq-page__list" />

        <div className="faq-page__more" data-reveal="lift">
          <span className="faq-page__more-icon">
            <Headset weight="duotone" aria-hidden="true" />
          </span>
          <p className="faq-page__more-title site-display">לא מצאתם תשובה?</p>
          <TextLink to="/contact" className="faq-page__more-link">
            יצירת קשר
          </TextLink>
        </div>
      </Container>
    </>
  )
}

export default FaqPage
