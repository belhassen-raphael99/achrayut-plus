import Button from '../../components/ui/Button/Button.jsx'
import TextLink from '../../components/ui/TextLink/TextLink.jsx'
import WarrantyLabel from '../../components/ui/WarrantyLabel/WarrantyLabel.jsx'
import Container from '../../components/layout/Container/Container.jsx'
import './SitePages.css'

/** עמוד 404 (E1): תו האחריות עם החץ על «הסתיימה», בלי קוד טכני נוסף */
function NotFoundPage() {
  return (
    <>
      <title>הדף לא נמצא · אחריות+</title>
      <Container width="reading" className="system-page">
        <WarrantyLabel className="system-page__label" stage="expired" value="404" summary="שגיאה 404." />
        <h1 className="system-page__title site-display site-display--page">הדף הזה לא נמצא</h1>
        <p className="system-page__text">ייתכן שהקישור ישן, או שהדף הועבר.</p>
        <div className="system-page__actions">
          <Button variant="primary" to="/">
            לדף הבית
          </Button>
          <TextLink to="/contact" arrow={false}>
            יצירת קשר
          </TextLink>
        </div>
      </Container>
    </>
  )
}

export default NotFoundPage
