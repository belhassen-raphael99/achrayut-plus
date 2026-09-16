import './TextDivider.css'

/** מפריד עם מילה באמצע («או»). דקורטיבי: הכפתורים והשדות מובנים גם בלעדיו */
function TextDivider({ children = 'או' }) {
  return (
    <div className="text-divider" aria-hidden="true">
      <span>{children}</span>
    </div>
  )
}

export default TextDivider
