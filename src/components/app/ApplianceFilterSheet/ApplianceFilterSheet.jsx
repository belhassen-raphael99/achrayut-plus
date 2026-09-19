import Sheet from '../../ui/Sheet/Sheet.jsx'
import CheckboxChips from '../../ui/CheckboxChips/CheckboxChips.jsx'
import SelectField from '../../ui/SelectField/SelectField.jsx'
import Button from '../../ui/Button/Button.jsx'
import TextButton from '../../ui/TextButton/TextButton.jsx'
import { CATEGORIES, DATE_SOURCES, ROOMS } from '../../../data/lists.js'
import { EMPTY_FILTERS, dateSource, matchesFilters, matchesQuery, purchaseYear } from '../../../utils/applianceList.js'
import './ApplianceFilterSheet.css'

/** רק ערכים שיש להם לפחות מכשיר אחד במרחב, כדי שלא יהיו מסננים שמובילים לרשימה ריקה */
function presentOptions(list, appliances, getValue) {
  const present = new Set(appliances.map(getValue))
  return list.filter((item) => present.has(item.id))
}

/**
 * סינון המכשירים (L3, FR-4.7): חדר · קטגוריה · מקור התאריך · שנת רכישה.
 * הבחירה היא טיוטה (draft) שמוחלת רק בלחיצה על «הצגת X מכשירים»; הכפתור מראה כמה מכשירים יוצגו,
 * כולל החיפוש שכבר מוקלד (query).
 */
function ApplianceFilterSheet({ open, onClose, appliances, query = '', draft, onDraftChange, onApply }) {
  const rooms = presentOptions(ROOMS, appliances, (item) => item.room)
  const categories = presentOptions(CATEGORIES, appliances, (item) => item.category)
  const sources = presentOptions(DATE_SOURCES, appliances, dateSource)
  const years = [...new Set(appliances.map(purchaseYear).filter(Boolean))].sort().reverse()
  const matchCount = appliances.filter((item) => matchesFilters(item, draft) && matchesQuery(item, query)).length

  const update = (changes) => onDraftChange({ ...draft, ...changes })

  return (
    <Sheet open={open} onClose={onClose} title="סינון">
      <div className="filter-sheet">
        <CheckboxChips
          legend="מיקום"
          name="room"
          options={rooms}
          values={draft.rooms}
          onChange={(values) => update({ rooms: values })}
        />
        <CheckboxChips
          legend="קטגוריה"
          name="category"
          options={categories}
          values={draft.categories}
          onChange={(values) => update({ categories: values })}
        />
        <CheckboxChips
          legend="מקור התאריך"
          name="source"
          options={sources}
          values={draft.sources}
          onChange={(values) => update({ sources: values })}
        />
        <SelectField
          label="שנת רכישה"
          name="year"
          value={draft.year}
          onChange={(event) => update({ year: event.target.value })}
          options={[{ value: '', label: 'כל השנים' }, ...years.map((year) => ({ value: year, label: year }))]}
        />

        <div className="filter-sheet__actions">
          <Button variant="primary" fullWidth onClick={() => onApply(draft)}>
            {matchCount === 1 ? 'הצגת מוצר אחד' : `הצגת ${matchCount} מוצרים`}
          </Button>
          <TextButton onClick={() => onDraftChange(EMPTY_FILTERS)}>ניקוי הסינון</TextButton>
        </div>
      </div>
    </Sheet>
  )
}

export default ApplianceFilterSheet
