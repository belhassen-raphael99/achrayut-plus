import Hero from '../../components/site/Hero/Hero.jsx'
import HowItWorks from '../../components/site/HowItWorks/HowItWorks.jsx'
import WhyUs from '../../components/site/WhyUs/WhyUs.jsx'
import Audience from '../../components/site/Audience/Audience.jsx'
import PricingTeaser from '../../components/site/PricingTeaser/PricingTeaser.jsx'
import FaqPreview from '../../components/site/FaqPreview/FaqPreview.jsx'
import ClosingBand from '../../components/site/ClosingBand/ClosingBand.jsx'
import Container from '../../components/layout/Container/Container.jsx'
import './SitePages.css'

/** דף הבית (S1 מובייל, S2 מחשב). «המסמכים שלכם פרטיים» נמצא בתוך «למה אצלנו» (בנטו, 16/09/2026) */
function HomePage() {
  return (
    <>
      <title>אחריות+ · כל האחריות של הבית, במקום אחד</title>
      <Hero />
      <HowItWorks />
      <WhyUs />
      <Audience />
      {/* במחשב התמחור והשאלות זה לצד זה: אזור אחד מלא, לא שני אזורים חצי־ריקים */}
      <Container className="home-offer">
        <PricingTeaser />
        <FaqPreview />
      </Container>
      <ClosingBand />
    </>
  )
}

export default HomePage
