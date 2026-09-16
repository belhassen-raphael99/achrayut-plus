import Icon from '../Icon/Icon.jsx'
import '../Button/Button.css'
import './FilePicker.css'

/**
 * כפתור שפותח בחירת קובץ, או את המצלמה של הטלפון כש־capture מוגדר (FR-2.2: המצלמה של הטלפון עצמו).
 * התווית עוטפת שדה קובץ אמיתי, כדי שמקלדת וקורא מסך יעבדו. onFile מקבל את הקובץ שנבחר.
 */
function FilePicker({ accept, capture, onFile, variant = 'primary', icon, fullWidth = false, className, children }) {
  function handleChange(event) {
    const file = event.target.files?.[0]
    // מאפשר לבחור שוב את אותו קובץ (למשל «צילום מחדש»)
    event.target.value = ''
    if (file) onFile(file)
  }

  const classes = ['button', `button--${variant}`, fullWidth && 'button--full', 'file-picker', className]
    .filter(Boolean)
    .join(' ')

  return (
    <label className={classes}>
      <input
        type="file"
        accept={accept}
        capture={capture}
        className="visually-hidden file-picker__input"
        onChange={handleChange}
      />
      {icon && <Icon name={icon} size="sm" />}
      <span>{children}</span>
    </label>
  )
}

export default FilePicker
