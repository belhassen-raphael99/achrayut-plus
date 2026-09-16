import LegalDocument from '../../components/site/LegalDocument/LegalDocument.jsx'
import { legalUpdatedAt, privacyContent } from '../../data/site.js'

/** מדיניות פרטיות (תבנית S8, NFR-7). טיוטה לבדיקה משפטית */
function PrivacyPage() {
  return (
    <>
      <title>מדיניות פרטיות · אחריות+</title>
      <LegalDocument content={privacyContent} updatedAt={legalUpdatedAt} />
    </>
  )
}

export default PrivacyPage
