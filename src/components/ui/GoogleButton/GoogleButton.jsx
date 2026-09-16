import googleLogo from '../../../assets/google-g.svg'
import './GoogleButton.css'

/** «המשך עם Google» (A1, A7, DESIGN.md §7.17). הלוגו הרשמי, קובץ מקומי: אין בקשה ל־Google */
function GoogleButton({ onClick }) {
  return (
    <button type="button" className="google-button" onClick={onClick}>
      <img src={googleLogo} alt="" className="google-button__logo" />
      <span>המשך עם Google</span>
    </button>
  )
}

export default GoogleButton
