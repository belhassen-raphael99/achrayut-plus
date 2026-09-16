import Icon from '../Icon/Icon.jsx'
import './Disclosure.css'

/** שאלה שנפתחת (שאלות נפוצות). <details> מקורי: נגיש מהמקלדת ולקוראי מסך בלי קוד נוסף */
function Disclosure({ title, children, defaultOpen = false }) {
  return (
    <details className="disclosure" open={defaultOpen || undefined}>
      <summary className="disclosure__summary">
        <span>{title}</span>
        <span className="disclosure__toggle" aria-hidden="true">
          <Icon name="keyboard_arrow_down" />
        </span>
      </summary>
      <div className="disclosure__content">{children}</div>
    </details>
  )
}

export default Disclosure
