import Photo from '../../ui/Photo/Photo.jsx'
import Container from '../../layout/Container/Container.jsx'
import './PageIntro.css'

/**
 * כותרת עמוד פנימי.
 * tone="dark": פס שעובר מתחת לכותרת המרחפת, כמו פתיחת דף הבית.
 * photo: צילום, והכותרת יושבת עליו על לוחית זכוכית כחולה (DESIGN.md §14.5). מחייב tone="dark".
 * overlap: משאיר מקום בתחתית, כדי שהכרטיס הבא יחפוף את הפס (טופס יצירת קשר).
 * align="center": לעמוד התמחור, שבו בורר החיוב שולט בכרטיסים שמתחת.
 * width="reading": כשהתוכן שמתחת ברוחב קריאה (שאלות נפוצות, טופס), כדי שהכותרת תתיישר איתו.
 * עמודי קריאה ארוכה (משפטיים) נשארים tone="light" — בלי צילום, בשביל הקריאה.
 */
function PageIntro({
  title,
  children,
  tone = 'light',
  photo,
  overlap = false,
  align = 'start',
  width = 'wide',
  titleId = 'page-title',
}) {
  const isDark = tone === 'dark'
  const classes = [
    'page-intro',
    isDark && 'page-intro--dark surface-dark is-under-header',
    photo && 'page-intro--photo',
    overlap && 'page-intro--overlap',
    align === 'center' && 'page-intro--center',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      {photo && (
        <div className="page-intro__media" aria-hidden="true">
          <Photo photo={photo} grade="day" priority sizes="100vw" className="page-intro__photo" />
          <span className="page-intro__veil" />
        </div>
      )}
      <Container width={width} className="page-intro__inner">
        <div className={['page-intro__panel', photo && 'site-glass'].filter(Boolean).join(' ')}>
          <h1 id={titleId} className="page-intro__title site-display site-display--page" data-reveal="soft">
            {title}
          </h1>
          {children && (
            <div className="page-intro__extra" data-reveal style={{ '--reveal-index': 1 }}>
              {children}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

export default PageIntro
