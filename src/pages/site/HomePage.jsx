import Hero from '../../components/site/Hero/Hero.jsx'
import HowItWorks from '../../components/site/HowItWorks/HowItWorks.jsx'
import WhyUs from '../../components/site/WhyUs/WhyUs.jsx'
import Audience from '../../components/site/Audience/Audience.jsx'
import TrustBlock from '../../components/site/TrustBlock/TrustBlock.jsx'
import PricingTeaser from '../../components/site/PricingTeaser/PricingTeaser.jsx'
import FaqPreview from '../../components/site/FaqPreview/FaqPreview.jsx'
import ClosingBand from '../../components/site/ClosingBand/ClosingBand.jsx'

/** דף הבית (S1 מובייל, S2 מחשב): הרכבה של האזורים לפי הסדר ב־prompt */
function HomePage() {
  return (
    <>
      <title>אחריות+ · כל האחריות של הבית, במקום אחד</title>
      <Hero />
      <HowItWorks />
      <WhyUs />
      <Audience />
      <TrustBlock />
      <PricingTeaser />
      <FaqPreview />
      <ClosingBand />
    </>
  )
}

export default HomePage
