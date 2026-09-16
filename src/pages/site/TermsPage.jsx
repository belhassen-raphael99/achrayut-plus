import LegalDocument from '../../components/site/LegalDocument/LegalDocument.jsx'
import { legalUpdatedAt, termsContent } from '../../data/site.js'

/** תנאי שימוש (תבנית S8). טיוטה לבדיקה משפטית */
function TermsPage() {
  return (
    <>
      <title>תנאי שימוש · אחריות+</title>
      <LegalDocument content={termsContent} updatedAt={legalUpdatedAt} />
    </>
  )
}

export default TermsPage
