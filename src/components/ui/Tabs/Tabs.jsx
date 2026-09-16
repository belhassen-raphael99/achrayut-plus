import { useRef } from 'react'
import './Tabs.css'

/**
 * לשוניות (DESIGN.md §7.4) לפי דפוס ה־tabs של WAI-ARIA: חיצים עוברים בין הלשוניות לפי כיוון הקריאה, ו־Home / End.
 * tabs: [{ id, label, count? }]. המזהים: `${idPrefix}-tab-${id}`, והפאנל: `${idPrefix}-panel` (העמוד מציג אותו).
 */
function Tabs({ label, tabs, value, onChange, idPrefix }) {
  const listRef = useRef(null)

  function selectAt(index) {
    const next = tabs[(index + tabs.length) % tabs.length]
    onChange(next.id)
    listRef.current?.querySelector(`[data-tab-id="${next.id}"]`)?.focus()
  }

  function handleKeyDown(event) {
    const index = tabs.findIndex((tab) => tab.id === value)
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl'
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight'
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft'

    if (event.key === forward) selectAt(index + 1)
    else if (event.key === backward) selectAt(index - 1)
    else if (event.key === 'Home') selectAt(0)
    else if (event.key === 'End') selectAt(tabs.length - 1)
    else return

    event.preventDefault()
  }

  return (
    <div ref={listRef} className="tabs" role="tablist" aria-label={label} onKeyDown={handleKeyDown}>
      {tabs.map((tab) => {
        const selected = tab.id === value
        return (
          <button
            key={tab.id}
            id={`${idPrefix}-tab-${tab.id}`}
            data-tab-id={tab.id}
            type="button"
            role="tab"
            className="tabs__tab"
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && <span className="tabs__count">{tab.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
