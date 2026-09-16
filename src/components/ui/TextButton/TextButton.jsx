import '../TextLink/TextLink.css'
import './TextButton.css'

/** כפתור שנראה כמו קישור טקסט (למשל «ניקוי הסינון»): פעולה באותו עמוד, לא מעבר לעמוד אחר */
function TextButton({ children, className, ...rest }) {
  return (
    <button type="button" className={['text-link', 'text-button', className].filter(Boolean).join(' ')} {...rest}>
      <span>{children}</span>
    </button>
  )
}

export default TextButton
