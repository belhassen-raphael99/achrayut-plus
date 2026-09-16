import './Avatar.css'

/** אווטר של האות הראשונה בשם (M1, P1, P2). דקורטיבי: השם מופיע לידו כטקסט */
function Avatar({ name, size = 'md' }) {
  return (
    <span className={`avatar avatar--${size}`} aria-hidden="true">
      {name?.trim().charAt(0)}
    </span>
  )
}

export default Avatar
