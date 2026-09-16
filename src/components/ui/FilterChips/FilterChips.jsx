import './FilterChips.css'

/** בחירת קטגוריה אחת מתוך כמה (נושאי השאלות הנפוצות, נכס). inverse: על משטח כהה (ראש הדשבורד) */
function FilterChips({ label, options, value, onChange, inverse = false, className }) {
  return (
    <div
      className={['filter-chips', inverse && 'filter-chips--inverse', className].filter(Boolean).join(' ')}
      role="group"
      aria-label={label}
    >
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
