import { useId, useRef } from 'react'
import Icon from '../Icon/Icon.jsx'
import IconButton from '../IconButton/IconButton.jsx'
import './SearchField.css'

/**
 * שדה חיפוש עם אייקון וכפתור ניקוי (L1, L2). התוצאות מתעדכנות בזמן ההקלדה (FR-4.6).
 * התווית המלאה מוסתרת חזותית; אייקון החיפוש ו־placeholder קצר מסמנים את התפקיד בשדה צר.
 */
function SearchField({ label, placeholder = label, value, onChange, className }) {
  const id = useId()
  const inputRef = useRef(null)

  function clear() {
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <div className={['search-field', value && 'search-field--filled', className].filter(Boolean).join(' ')}>
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <Icon name="search" className="search-field__icon" />
      <input
        ref={inputRef}
        id={id}
        type="search"
        dir="auto"
        className="search-field__control"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        onChange={(event) => onChange(event.target.value)}
      />
      {value && <IconButton icon="close" label="ניקוי החיפוש" onClick={clear} className="search-field__clear" />}
    </div>
  )
}

export default SearchField
