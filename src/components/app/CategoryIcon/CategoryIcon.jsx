import Icon from '../../ui/Icon/Icon.jsx'
import { CATEGORIES, findById } from '../../../data/lists.js'
import './CategoryIcon.css'

/** אייקון הקטגוריה על אריח 40px (DESIGN.md §7.5, §9). במקום תמונת מכשיר (FR-3.1). דקורטיבי */
function CategoryIcon({ category, size = 'md' }) {
  const item = findById(CATEGORIES, category) ?? findById(CATEGORIES, 'other')

  return (
    <span className={`category-icon category-icon--${size}`} aria-hidden="true">
      <Icon name={item.icon} size={size === 'lg' ? 'lg' : 'md'} />
    </span>
  )
}

export default CategoryIcon
