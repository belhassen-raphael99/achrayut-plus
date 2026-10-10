const KEY = 'achrayut:reloaded-after-deploy'

/**
 * טעינה של חבילת קוד (dynamic import) שמתאוששת מפריסה חדשה.
 * אחרי פריסה, השמות של קבצי ה־JS משתנים והישנים כבר לא קיימים: דף שנפתח לפני הפריסה
 * נכשל בטעינה הבאה ונופל למסך השגיאה. במקרה כזה טוענים את הדף מחדש, פעם אחת בלבד.
 */
export function importWithReload(load) {
  return load()
    .then((module) => {
      try {
        sessionStorage.removeItem(KEY)
      } catch {
        // אחסון חסום (גלישה פרטית): לא נורא, רק לא נדע אם כבר טענו מחדש
      }
      return module
    })
    .catch((error) => {
      let alreadyReloaded = true
      try {
        alreadyReloaded = sessionStorage.getItem(KEY) === '1'
        if (!alreadyReloaded) sessionStorage.setItem(KEY, '1')
      } catch {
        // בלי אחסון אי אפשר להבטיח טעינה אחת בלבד, ולכן לא טוענים מחדש
      }
      if (alreadyReloaded) throw error
      window.location.reload()
      return new Promise(() => {})
    })
}
