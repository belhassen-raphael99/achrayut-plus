import './Container.css'

/** רוחב תוכן ושוליים (DESIGN.md §4.1). width="reading" לעמודי קריאה ארוכה */
function Container({ as: Tag = 'div', width = 'wide', className, children, ...rest }) {
  const classes = ['container', width === 'reading' && 'container--reading', className]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  )
}

export default Container
