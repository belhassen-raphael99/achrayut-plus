import './ScanQuota.css'

/** «נותרו לכם 2 מתוך 5 סריקות החודש» ופס של מקטעים (N1, DESIGN.md §7.14). הפס דקורטיבי */
function ScanQuota({ used, limit }) {
  const remaining = Math.max(0, limit - used)

  return (
    <div className="scan-quota">
      <p className="scan-quota__text">
        {remaining === 1 ? 'נותרה' : 'נותרו'} לכם {remaining} מתוך {limit} סריקות החודש
      </p>
      <div className="scan-quota__bar" aria-hidden="true">
        {Array.from({ length: limit }, (_, index) => (
          <span
            key={index}
            className={['scan-quota__segment', index < used && 'scan-quota__segment--used'].filter(Boolean).join(' ')}
          />
        ))}
      </div>
    </div>
  )
}

export default ScanQuota
