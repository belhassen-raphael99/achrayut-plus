import LegalDocument from '../../components/site/LegalDocument/LegalDocument.jsx'
import { accessibilityContent, legalUpdatedAt } from '../../data/site.js'

/** הצהרת נגישות (S9): ת"י 5568 = WCAG 2.0 ברמה AA. פרטי הקשר ימולאו בהמשך */
function AccessibilityPage() {
  return (
    <>
      <title>הצהרת נגישות · אחריות+</title>
      <LegalDocument content={accessibilityContent} updatedAt={legalUpdatedAt} />
    </>
  )
}

export default AccessibilityPage
