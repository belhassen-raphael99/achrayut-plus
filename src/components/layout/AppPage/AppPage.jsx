import './AppPage.css'

/** רוחב ושוליים של עמוד באפליקציה (DESIGN.md §4.1). width="reading" לטפסים ולתוכן צר */
function AppPage({ width = 'wide', className, children }) {
  const classes = ['app-page', width === 'reading' && 'app-page--reading', className].filter(Boolean).join(' ')
  return <div className={classes}>{children}</div>
}

export default AppPage
