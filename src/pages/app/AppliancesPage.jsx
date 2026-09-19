import { useMemo, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router'
import AppPage from '../../components/layout/AppPage/AppPage.jsx'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import IconButton from '../../components/ui/IconButton/IconButton.jsx'
import SearchField from '../../components/ui/SearchField/SearchField.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import Tabs from '../../components/ui/Tabs/Tabs.jsx'
import StateMessage from '../../components/ui/StateMessage/StateMessage.jsx'
import TextButton from '../../components/ui/TextButton/TextButton.jsx'
import PropertyFilter from '../../components/app/PropertyFilter/PropertyFilter.jsx'
import ApplianceGroups from '../../components/app/ApplianceGroups/ApplianceGroups.jsx'
import ApplianceListSkeleton from '../../components/app/ApplianceListSkeleton/ApplianceListSkeleton.jsx'
import ApplianceFilterSheet from '../../components/app/ApplianceFilterSheet/ApplianceFilterSheet.jsx'
import { useAppData } from '../../data/useAppData.js'
import {
  EMPTY_FILTERS,
  LIST_TABS,
  countActiveFilters,
  filtersFromParams,
  filtersToParams,
  matchesFilters,
  matchesQuery,
} from '../../utils/applianceList.js'
import { today } from '../../utils/dates.js'
import { warrantyStatus } from '../../utils/warranty.js'
import './AppPages.css'

// לשונית ריקה: הודעה מרגיעה (FR-4.5, L4)
const EMPTY_TAB_MESSAGES = {
  all: { title: 'אין מוצרים שמתאימים לסינון', text: 'אפשר לנקות את הסינון ולראות את כל המוצרים.' },
  soon: {
    title: 'אין מוצרים שהאחריות שלהם מסתיימת בקרוב',
    text: 'ניידע אתכם 90 ימים לפני שאחריות מסתיימת.',
  },
  expired: { title: 'אין מוצרים שהאחריות שלהם הסתיימה', text: 'זה סימן טוב. ניידע אתכם לפני שמשהו מסתיים.' },
  unknown: { title: 'לכל המוצרים יש תאריך אחריות', text: 'כשיתווסף מוצר בלי תאריך רכישה, הוא יופיע כאן.' },
}

/**
 * רשימת המכשירים (L1–L4, W2 · FR-4.5–4.8).
 * הכתובת שומרת את המצב: ?tab=soon · ?q=דייסון · ?room=kitchen&category=fridge&source=invoice&year=2025
 */
function AppliancesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  // רק המכשירים של הנכס שנבחר (FR-7.4)
  const { propertyAppliances: appliances, properties, multiProperty, activePropertyId, isViewer, loading } = useAppData()
  const groupProperties = multiProperty && activePropertyId === 'all' ? properties : undefined
  const { offline, openAddAppliance } = useOutletContext()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS)

  const query = searchParams.get('q') ?? ''
  const tabParam = searchParams.get('tab')
  const tab = LIST_TABS.some((item) => item.id === tabParam) ? tabParam : 'all'
  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams])
  const activeFilterCount = countActiveFilters(filters)
  const searching = query.trim() !== ''

  const filtered = useMemo(() => {
    const now = today()
    return appliances
      .filter((appliance) => matchesFilters(appliance, filters))
      .map((appliance) => ({ appliance, status: warrantyStatus(appliance, now) }))
  }, [appliances, filters])

  const counts = { all: filtered.length, soon: 0, expired: 0, unknown: 0 }
  for (const item of filtered) {
    if (item.status.stage !== 'protected') counts[item.status.stage] += 1
  }

  const visible = searching
    ? filtered.filter((item) => matchesQuery(item.appliance, query))
    : filtered.filter((item) => tab === 'all' || item.status.stage === tab)

  /** עדכון הכתובת בלי להוסיף רשומה להיסטוריה; ערך ריק מוחק את הפרמטר */
  function updateParams(changes) {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, value)
          else next.delete(key)
        }
        return next
      },
      { replace: true },
    )
  }

  function openFilters() {
    setDraftFilters(filters)
    setFiltersOpen(true)
  }

  function applyFilters(nextFilters) {
    updateParams(filtersToParams(nextFilters))
    setFiltersOpen(false)
  }

  return (
    <AppPage>
      <title>המוצרים · אחריות+</title>
      <PageHeader
        title="המוצרים"
        actions={
          // בצפייה בלבד הכפתור לא מוצג (FR-1.6); בלי חיבור הוא מושבת עם הסבר (DESIGN.md §8)
          !isViewer && (
            <IconButton
              icon="add"
              label={offline ? 'הוספת מוצר, יהיה זמין כשהחיבור יחזור' : 'הוספת מוצר'}
              title={offline ? 'יהיה זמין כשהחיבור יחזור' : undefined}
              aria-haspopup="dialog"
              disabled={offline}
              onClick={openAddAppliance}
            />
          )
        }
      />

      <PropertyFilter className="appliances__properties" />

      <div className="appliances__tools">
        <SearchField
          label="חיפוש לפי שם, מותג או דגם"
          placeholder="שם, מותג או דגם"
          value={query}
          onChange={(value) => updateParams({ q: value })}
          className="appliances__search"
        />
        <Button variant="secondary" icon="tune" aria-haspopup="dialog" onClick={openFilters}>
          סינון
          {activeFilterCount > 0 && (
            <span className="appliances__filter-count">
              {activeFilterCount}
              <span className="visually-hidden"> מסננים פעילים</span>
            </span>
          )}
        </Button>
      </div>

      <p className="visually-hidden" role="status">
        {searching ? (visible.length === 1 ? 'נמצא מוצר אחד' : `נמצאו ${visible.length} מוצרים`) : ''}
      </p>

      {loading ? (
        <div className="appliances__panel">
          <ApplianceListSkeleton rows={4} />
        </div>
      ) : appliances.length === 0 ? (
        <StateMessage icon="inventory_2" titleAs="h2" size="sm" title="אין עדיין מוצרים במרחב הזה" className="appliances__state">
          <p>{isViewer ? 'כשיוסיפו מוצרים למרחב, הם יופיעו כאן.' : 'צלמו חשבונית של מוצר אחד, ואנחנו נמלא את השאר.'}</p>
        </StateMessage>
      ) : searching ? (
        <div className="appliances__panel">
          {visible.length > 0 ? (
            <ApplianceGroups items={visible} properties={groupProperties} />
          ) : (
            <StateMessage
              icon="search"
              titleAs="h2"
              size="sm"
              title={
                <>
                  לא מצאנו את &quot;<bdi>{query.trim()}</bdi>&quot;
                </>
              }
              actions={<TextButton onClick={() => updateParams({ q: '' })}>ניקוי החיפוש</TextButton>}
              className="appliances__state"
            >
              <p>בדקו את האיות, או חפשו לפי מותג או דגם.</p>
            </StateMessage>
          )}
        </div>
      ) : (
        <>
          <Tabs
            label="סטטוס האחריות"
            idPrefix="appliances"
            tabs={LIST_TABS.map((item) => ({ ...item, count: counts[item.id] }))}
            value={tab}
            onChange={(id) => updateParams({ tab: id === 'all' ? '' : id })}
          />
          <div
            id="appliances-panel"
            role="tabpanel"
            aria-labelledby={`appliances-tab-${tab}`}
            className="appliances__panel"
          >
            {visible.length > 0 ? (
              <ApplianceGroups items={visible} properties={groupProperties} />
            ) : (
              <StateMessage
                icon={tab === 'all' ? 'tune' : 'check_circle'}
                tone={tab === 'all' ? 'neutral' : 'success'}
                titleAs="h2"
                size="sm"
                title={EMPTY_TAB_MESSAGES[tab].title}
                actions={
                  tab === 'all' &&
                  activeFilterCount > 0 && (
                    <TextButton onClick={() => applyFilters(EMPTY_FILTERS)}>ניקוי הסינון</TextButton>
                  )
                }
                className="appliances__state"
              >
                <p>{EMPTY_TAB_MESSAGES[tab].text}</p>
              </StateMessage>
            )}
          </div>
        </>
      )}

      <ApplianceFilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        appliances={appliances}
        query={query}
        draft={draftFilters}
        onDraftChange={setDraftFilters}
        onApply={applyFilters}
      />
    </AppPage>
  )
}

export default AppliancesPage
