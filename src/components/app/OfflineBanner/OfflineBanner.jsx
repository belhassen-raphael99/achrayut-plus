import Icon from '../../ui/Icon/Icon.jsx'
import './OfflineBanner.css'

/**
 * פס «אין חיבור לאינטרנט» בראש המסך (E4, DESIGN.md §7.16).
 * אזור ה־status קיים תמיד, כדי שקורא המסך יכריז כשההודעה מופיעה.
 */
function OfflineBanner({ offline }) {
  return (
    <div role="status">
      {offline && (
        <p className="offline-banner">
          <Icon name="wifi_off" size="sm" />
          <span>אין חיבור לאינטרנט. מוצג המידע שנשמר לאחרונה.</span>
        </p>
      )}
    </div>
  )
}

export default OfflineBanner
