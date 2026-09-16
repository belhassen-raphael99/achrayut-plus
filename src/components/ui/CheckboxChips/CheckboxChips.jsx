import Icon from '../Icon/Icon.jsx'
import './CheckboxChips.css'

/**
 * כמה בחירות מתוך תגיות (L3): תיבות סימון אמיתיות בתוך fieldset, בצורת תגיות.
 * options: [{ id, label }] · values: המזהים שנבחרו · onChange מקבל את המערך החדש.
 */
function CheckboxChips({ legend, name, options, values, onChange }) {
  function toggle(id) {
    onChange(values.includes(id) ? values.filter((value) => value !== id) : [...values, id])
  }

  return (
    <fieldset className="checkbox-chips">
      <legend className="checkbox-chips__legend">{legend}</legend>
      <div className="checkbox-chips__options">
        {options.map((option) => {
          const checked = values.includes(option.id)
          return (
            <label key={option.id} className="checkbox-chip">
              <input
                type="checkbox"
                className="checkbox-chip__input"
                name={name}
                value={option.id}
                checked={checked}
                onChange={() => toggle(option.id)}
              />
              <span className="checkbox-chip__label">
                {checked && <Icon name="check" size="sm" />}
                {option.label}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export default CheckboxChips
