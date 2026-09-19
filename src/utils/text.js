// ניסוחים בעברית שתלויים במספר או במגדר (DESIGN.md §11)

/** «מכשיר אחד» · «18 מכשירים» · «אין עדיין מכשירים» */
export function applianceCountLabel(count) {
  if (count === 0) return 'אין עדיין מוצרים'
  if (count === 1) return 'מוצר אחד'
  return `${count} מוצרים`
}

/** «נכס אחד» · «3 נכסים» (FR-7) */
export function propertyCountLabel(count) {
  return count === 1 ? 'נכס אחד' : `${count} נכסים`
}

/** «נועה לוי» */
export function fullName(user) {
  return `${user.firstName} ${user.lastName}`
}

/** פועל לפי מגדר המשתמש: byGender(user, 'הוסיפה', 'הוסיף') */
export function byGender(user, female, male) {
  return user?.gender === 'female' ? female : male
}
