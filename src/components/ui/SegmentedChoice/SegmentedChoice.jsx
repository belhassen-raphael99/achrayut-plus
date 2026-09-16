import './SegmentedChoice.css'

/** בחירה אחת מתוך שתיים או שלוש (למשל חודשי / שנתי). כפתורי רדיו אמיתיים, לנגישות */
function SegmentedChoice({ legend, name, options, value, onChange, inverse = false }) {
  return (
    <fieldset className={['segmented', inverse && 'segmented--inverse'].filter(Boolean).join(' ')}>
      <legend className="visually-hidden">{legend}</legend>
      {options.map((option) => (
        <label key={option.value} className="segmented__option">
          <input
            type="radio"
            className="segmented__input"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className="segmented__label">{option.label}</span>
        </label>
      ))}
    </fieldset>
  )
}

export default SegmentedChoice
