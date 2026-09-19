// ניווט האפליקציה (PRD FR-4.8 · DESIGN.md §7.10)
// desktopOnly: מופיע רק בסרגל הצד (מ־1024px). בטלפון, «חברי המרחב» נמצא בהגדרות.

export const appNavItems = [
  { to: '/dashboard', label: 'בית', icon: 'home' },
  { to: '/appliances', label: 'מוצרים', icon: 'inventory_2' },
  { to: '/notifications', label: 'התראות', icon: 'notifications' },
  { to: '/members', label: 'חברי המרחב', icon: 'group', desktopOnly: true },
  { to: '/settings', label: 'הגדרות', icon: 'settings' },
]
