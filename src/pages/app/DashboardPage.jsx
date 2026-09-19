import { useMemo } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router'
import DashboardHero from '../../components/app/DashboardHero/DashboardHero.jsx'
import UrgentCard from '../../components/app/UrgentCard/UrgentCard.jsx'
import ApplianceList from '../../components/app/ApplianceList/ApplianceList.jsx'
import AddInvoiceButton from '../../components/app/AddInvoiceButton/AddInvoiceButton.jsx'
import DashboardEmpty from '../../components/app/DashboardEmpty/DashboardEmpty.jsx'
import DashboardSkeleton from '../../components/app/DashboardSkeleton/DashboardSkeleton.jsx'
import PropertyFilter from '../../components/app/PropertyFilter/PropertyFilter.jsx'
import TextLink from '../../components/ui/TextLink/TextLink.jsx'
import ActionRow from '../../components/ui/ActionRow/ActionRow.jsx'
import Dialog from '../../components/ui/Dialog/Dialog.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import { useAppData } from '../../data/useAppData.js'
import { today } from '../../utils/dates.js'
import { greetingFor } from '../../utils/greeting.js'
import { summarizeWarranties, warrantyStatus } from '../../utils/warranty.js'
import './AppPages.css'

// «נוספו לאחרונה»: 3 בטלפון, 6 במחשב (FR-4.3)
const RECENT_MOBILE = 3
const RECENT_DESKTOP = 6

/**
 * דשבורד (D1–D5, E4, W1 · FR-4.1–4.4).
 * D2 = מרחב חדש בלי מכשירים · D3 = המרחב «דירות להשכרה» · D4 = eyal@example.com (צפייה בלבד)
 * מצבים דרך הכתובת: ?state=loading (D5) · ?offline=1 (E4) · ?session=expired (A18)
 */
function DashboardPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // רק המכשירים של הנכס שנבחר (FR-7.4)
  const { user, activeSpace, isViewer, propertyAppliances: appliances, activePropertyId, propertyName, unreadCount, loading } =
    useAppData()
  const showPlace = activePropertyId === 'all'
  const { offline, switcherOpen, openSpaceSwitcher, openAddAppliance } = useOutletContext()

  const isLoading = loading || searchParams.get('state') === 'loading'
  const sessionExpired = searchParams.get('session') === 'expired'

  const { summary, urgent, moreSoon, recent } = useMemo(() => {
    const now = today()
    // ב«כל הנכסים» ליד כל מכשיר מופיע הנכס שלו (ריק כשיש נכס אחד)
    const items = appliances.map((appliance) => ({
      appliance,
      status: warrantyStatus(appliance, now),
      place: showPlace ? propertyName(appliance) : '',
    }))
    const soon = items
      .filter((item) => item.status.stage === 'soon')
      .sort((a, b) => a.status.days - b.status.days)

    return {
      summary: summarizeWarranties(appliances, now),
      urgent: soon[0] ?? null,
      moreSoon: Math.max(0, soon.length - 1),
      recent: [...items]
        .sort((a, b) => b.appliance.addedAt.localeCompare(a.appliance.addedAt))
        .slice(0, RECENT_DESKTOP),
    }
    // propertyName משתנה רק עם המרחב והנכסים, שמשנים גם את appliances
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliances, showPlace])

  const variant = isLoading ? 'loading' : appliances.length === 0 ? 'empty' : 'ready'

  return (
    <div className="dashboard">
      <title>בית · אחריות+</title>
      <p className="visually-hidden" role="status">
        {isLoading ? 'טוענים את המרחב…' : ''}
      </p>

      <DashboardHero
        greeting={`${greetingFor()}, ${user.firstName}`}
        spaceName={activeSpace.name}
        isViewer={isViewer}
        unread={unreadCount > 0}
        onOpenSwitcher={openSpaceSwitcher}
        switcherOpen={switcherOpen}
        variant={variant}
        summary={summary}
        filter={<PropertyFilter inverse />}
      />

      {variant !== 'empty' || !isViewer ? (
        <div className="dashboard__body">
          {variant === 'loading' && <DashboardSkeleton />}

          {variant === 'empty' && (
            <DashboardEmpty offline={offline} onAdd={openAddAppliance} className="dashboard__wide" />
          )}

          {variant === 'ready' && (
            <>
              {/* במחשב: «לטיפול עכשיו» והעוזר בעמודה אחת, «נוספו לאחרונה» בשנייה */}
              <div className="dashboard__lead">
                <div data-reveal="lift">
                  <UrgentCard appliance={urgent?.appliance} status={urgent?.status} moreCount={moreSoon} />
                </div>

                {!isViewer && (
                  <AddInvoiceButton
                    offline={offline}
                    onClick={openAddAppliance}
                    className="dashboard__add"
                    data-reveal
                    style={{ '--reveal-index': 1 }}
                  />
                )}

                {/* העוזר לקריאה בלבד: לכל חברי המרחב (FR-10.1). בלי חיבור: מושבת */}
                <div data-reveal style={{ '--reveal-index': 2 }}>
                  {offline ? (
                    <ActionRow icon="forum" title="שאלו את העוזר" description="יהיה זמין כשהחיבור יחזור" variant="card" trailing="none" disabled />
                  ) : (
                    <ActionRow to="/assistant" icon="forum" title="שאלו את העוזר" variant="card" />
                  )}
                </div>
              </div>

              <section
                className="dashboard__section"
                aria-labelledby="recent-title"
                data-reveal
                style={{ '--reveal-index': 2 }}
              >
                <div className="dashboard__section-header">
                  <h2 id="recent-title" className="dashboard__section-title">
                    נוספו לאחרונה
                  </h2>
                  <TextLink to="/appliances">לכל המוצרים</TextLink>
                </div>
                <ApplianceList items={recent} mobileLimit={RECENT_MOBILE} />
              </section>
            </>
          )}
        </div>
      ) : null}

      <Dialog
        open={sessionExpired}
        onClose={() => {}}
        dismissible={false}
        title="החיבור הסתיים"
        actions={
          <Button variant="primary" fullWidth onClick={() => navigate('/login?next=%2Fdashboard')}>
            התחברות
          </Button>
        }
      >
        <p>מטעמי אבטחה התנתקתם אחרי זמן ללא פעילות. התחברו שוב ונחזיר אתכם לאותו מקום.</p>
      </Dialog>
    </div>
  )
}

export default DashboardPage
