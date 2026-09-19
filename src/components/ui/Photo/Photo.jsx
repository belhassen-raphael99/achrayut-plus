import { unsplashSrcSet, unsplashUrl } from '../../../utils/unsplash.js'
import './Photo.css'

/**
 * צילום שממלא את המכל שלו (object-fit: cover).
 * priority: לתמונת הפתיחה בלבד — נטענת מיד ובעדיפות גבוהה. כל השאר lazy.
 * sizes: כמה רוחב התמונה תופסת במסך, כדי שהדפדפן יוריד את הגודל הנכון ולא 2400px בטלפון.
 * grade: צבעוני אפוי מה־CDN — day · dusk · night · blur (האתר הציבורי, DESIGN.md §14.6).
 * אין כאן אנימציית כניסה: צילום לא יכול להישאר שקוף בגלל אנימציה קפואה (DESIGN.md §10.7).
 */
function Photo({ photo, sizes = '100vw', priority = false, maxWidth, grade, className }) {
  return (
    <img
      className={['photo', className].filter(Boolean).join(' ')}
      src={unsplashUrl(photo.id, 1440, 72, grade)}
      srcSet={unsplashSrcSet(photo.id, maxWidth, grade)}
      sizes={sizes}
      alt=""
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      style={{ objectPosition: photo.position }}
    />
  )
}

export default Photo
