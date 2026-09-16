import './FilterChips.css'

/** בחירת קטגוריה אחת מתוך כמה (למשל נושאי השאלות הנפוצות) */
function FilterChips({ label, options, value, onChange }) {
  return (
    <div className="filter-chips" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className="filter-chips__chip"
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default FilterChips
