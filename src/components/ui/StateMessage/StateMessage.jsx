import { useEffect, useRef } from 'react'
import Icon from '../Icon/Icon.jsx'
import './StateMessage.css'

/**
 * מצב מרוכז: אייקון בעיגול, כותרת, טקסט ופעולות (A9–A11, A13, A16, A17, A19, S7).
 * tone: success · info · error · neutral. focusOnMount מעביר את הפוקוס לכותרת (אחרי שליחה).
 * size="sm": מצב ריק בתוך עמוד (L2, L4) — כותרת 20px וטקסט 16px (DESIGN.md §8).
 */
function StateMessage({
  icon,
  tone = 'neutral',
  title,
  titleAs: Title = 'h1',
  size = 'md',
  children,
  actions,
  focusOnMount = false,
  className,
}) {
  const titleRef = useRef(null)

  useEffect(() => {
    if (focusOnMount) titleRef.current?.focus()
  }, [focusOnMount])

  return (
    <div className={['state-message', size === 'sm' && 'state-message--compact', className].filter(Boolean).join(' ')}>
      {icon && (
        <span className={`state-message__badge state-message__badge--${tone}`}>
          <Icon name={icon} size="lg" />
        </span>
      )}
      {title && (
        <Title ref={titleRef} tabIndex={-1} className="state-message__title">
          {title}
        </Title>
      )}
      {children && <div className="state-message__text">{children}</div>}
      {actions && <div className="state-message__actions">{actions}</div>}
    </div>
  )
}

export default StateMessage
