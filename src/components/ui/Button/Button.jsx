import { Link } from 'react-router'
import Icon from '../Icon/Icon.jsx'
import './Button.css'

/**
 * כפתור, או קישור בצורת כפתור (DESIGN.md §7.1).
 * variant: accent (זעפרן) · primary (כחול לילה) · secondary · secondary-inverse (על משטח כהה)
 * כלל: כפתור ממולא אחד בלבד בכל מסך (accent או primary).
 */
function Button({
  variant = 'primary',
  to,
  href,
  fullWidth = false,
  icon,
  className,
  children,
  type = 'button',
  ...rest
}) {
  const classes = ['button', `button--${variant}`, fullWidth && 'button--full', className]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {icon && <Icon name={icon} size="sm" />}
      <span>{children}</span>
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    )
  }

  return (
    <button type={type} className={classes} {...rest}>
      {content}
    </button>
  )
}

export default Button
