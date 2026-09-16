import FilterChips from '../../ui/FilterChips/FilterChips.jsx'
import { useAppData } from '../../../data/useAppData.js'

/**
 * סינון לפי נכס (FR-7.4): «כל הנכסים» ואחריו נכס־נכס. מוצג רק כשיש יותר מנכס אחד.
 * הבחירה אחת לדשבורד ולרשימה, ונשמרת לכל משתמש בכל מרחב.
 */
function PropertyFilter({ inverse = false, className }) {
  const { properties, multiProperty, activePropertyId, setActiveProperty } = useAppData()
  if (!multiProperty) return null

  return (
    <FilterChips
      label="סינון לפי נכס"
      options={[{ id: 'all', label: 'כל הנכסים' }, ...properties.map((property) => ({ id: property.id, label: property.name }))]}
      value={activePropertyId}
      onChange={setActiveProperty}
      inverse={inverse}
      className={className}
    />
  )
}

export default PropertyFilter
