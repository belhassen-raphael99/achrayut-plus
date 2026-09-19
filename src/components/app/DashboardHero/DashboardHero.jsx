import Chip from '../../ui/Chip/Chip.jsx'
import IconButton from '../../ui/IconButton/IconButton.jsx'
import Skeleton from '../../ui/Skeleton/Skeleton.jsx'
import SegmentedBar from '../SegmentedBar/SegmentedBar.jsx'
import SpaceChip from '../SpaceChip/SpaceChip.jsx'
import { useCountUp } from '../../../utils/useCountUp.js'
import { useDashboardIntro } from '../../../utils/useDashboardIntro.js'
import { warrantySummaryText } from '../../../utils/warranty.js'
import './DashboardHero.css'

/**
 * בלוק הראש של הדשבורד (D1–D5, DESIGN.md §7.7): ברכה, בורר המרחב, פעמון,
 * והמספר הגדול עם הפס המחולק. variant: ready · empty (מרחב בלי מכשירים, D2) · loading (D5).
 * filter: הסינון לפי נכס (FR-7.4), מתחת למספר
 */
function DashboardHero({
  greeting,
  spaceName,
  isViewer,
  unread,
  onOpenSwitcher,
  switcherOpen,
  variant,
  summary,
  filter,
}) {
  return (
    <section className="dashboard-hero surface-dark" aria-labelledby="dashboard-greeting">
      <div className="dashboard-hero__top">
        <div className="dashboard-hero__identity">
          <h1 id="dashboard-greeting" className="dashboard-hero__greeting">
            {greeting}
          </h1>
          <div className="dashboard-hero__space">
            <SpaceChip name={spaceName} inverse onClick={onOpenSwitcher} expanded={switcherOpen} />
            {isViewer && <Chip tone="role">צפייה בלבד</Chip>}
          </div>
        </div>
        <IconButton
          icon="notifications"
          to="/notifications"
          label={unread ? 'התראות, יש התראות שלא נקראו' : 'התראות'}
          dot={unread}
          className="dashboard-hero__bell"
        />
      </div>

      {variant === 'loading' && (
        <div className="dashboard-hero__loading">
          <Skeleton inverse size="number" width="sm" />
          <Skeleton inverse width="md" />
          <Skeleton inverse size="bar" />
        </div>
      )}

      {variant === 'empty' && (
        <div className="dashboard-hero__empty">
          <p className="dashboard-hero__title">
            {isViewer ? 'אין עדיין מוצרים במרחב הזה' : 'הבית שלכם מתחיל כאן'}
          </p>
          {!isViewer && (
            <p className="dashboard-hero__subtitle">צלמו חשבונית של מוצר אחד, ואנחנו נמלא את השאר.</p>
          )}
        </div>
      )}

      {variant === 'ready' && <HeroCount summary={summary} />}
      {filter && <div className="dashboard-hero__filter">{filter}</div>}
    </section>
  )
}

/** «17 / 18 מכשירים מוגנים באחריות»: סופר ומתמלא רק בכניסה הראשונה בסשן (DESIGN.md §10) */
function HeroCount({ summary }) {
  const animate = useDashboardIntro()
  const shown = useCountUp(summary.active, animate)
  const summaryText = warrantySummaryText(summary.counts)

  return (
    <>
      <p className="dashboard-hero__count">
        <span className="dashboard-hero__numbers" aria-hidden="true">
          <span className="dashboard-hero__number">{shown}</span>
          <span className="dashboard-hero__total">/</span>
          <span className="dashboard-hero__total">{summary.total}</span>
        </span>
        <span className="dashboard-hero__caption">
          <span className="visually-hidden">
            {summary.active} מתוך {summary.total}{' '}
          </span>
          מוצרים מוגנים באחריות
        </span>
      </p>
      <SegmentedBar counts={summary.counts} animate={animate} className="dashboard-hero__bar" />
      {summaryText && <p className="dashboard-hero__summary">{summaryText}</p>}
    </>
  )
}

export default DashboardHero
