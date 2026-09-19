import { CaretDown } from '@phosphor-icons/react'
import './SiteFaq.css'

/**
 * רשימת שאלות נפתחות באתר הציבורי (דף הבית, שאלות נפוצות, תמחור).
 * `<details>` מקורי: נגיש מהמקלדת ולקוראי מסך בלי קוד נוסף. אייקון Phosphor (DESIGN.md §14.7).
 */
function SiteFaq({ items, defaultOpenId, className }) {
  return (
    <div className={['site-faq', className].filter(Boolean).join(' ')}>
      {items.map((item) => (
        <details key={item.id} className="site-faq__item" open={item.id === defaultOpenId || undefined}>
          <summary className="site-faq__summary">
            <span>{item.question}</span>
            <CaretDown weight="duotone" className="site-faq__caret" aria-hidden="true" />
          </summary>
          <p className="site-faq__answer">{item.answer}</p>
        </details>
      ))}
    </div>
  )
}

export default SiteFaq
