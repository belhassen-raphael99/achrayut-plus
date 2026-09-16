import Logo from '../../components/ui/Logo/Logo.jsx'
import TextLink from '../../components/ui/TextLink/TextLink.jsx'
import './SystemPages.css'

// שלב 6: שעת החזרה לדוגמה. בשלב 8 היא מגיעה מהגדרות השרת
const BACK_AT = '06:00'

/** «אנחנו משדרגים את המערכת» (E3, SYSTEM PAGE על רקע כחול לילה): בלי כפתור, עם קישור ליצירת קשר */
function MaintenancePage() {
  return (
    <div className="maintenance surface-dark">
      <title>משדרגים את המערכת · אחריות+</title>
      <header>
        <Logo inverse />
      </header>
      <main id="content" className="maintenance__main">
        <p className="maintenance__time" aria-hidden="true">
          {BACK_AT}
        </p>
        <h1 className="maintenance__title">אנחנו משדרגים את המערכת</h1>
        <p className="maintenance__text">
          נחזור עד השעה {BACK_AT}. המידע והתזכורות שלכם שמורים, ותזכורות שתוזמנו יישלחו אחרי העדכון.
        </p>
        <TextLink to="/contact" arrow={false} className="maintenance__link">
          יצירת קשר
        </TextLink>
      </main>
    </div>
  )
}

export default MaintenancePage
