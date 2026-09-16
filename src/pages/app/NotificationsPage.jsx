import { useState } from 'react'
import AppPage from '../../components/layout/AppPage/AppPage.jsx'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import Tabs from '../../components/ui/Tabs/Tabs.jsx'
import StateMessage from '../../components/ui/StateMessage/StateMessage.jsx'
import TextButton from '../../components/ui/TextButton/TextButton.jsx'
import NotificationRow from '../../components/app/NotificationRow/NotificationRow.jsx'
import { useAppData } from '../../data/useAppData.js'
import { daysAgo } from '../../utils/relativeDay.js'
import './AppPages.css'

const TABS = [
  { id: 'all', label: 'הכול' },
  { id: 'warranty', label: 'אחריות' },
  { id: 'space', label: 'מרחב' },
]

/**
 * מרכז ההתראות (T1, T2 · FR-5.6, FR-5.7): לשוניות הכול · אחריות · מרחב, וקבוצות «השבוע» ו«קודם».
 * לחיצה על התראה מסמנת אותה כנקראה; «סימון הכול כנקרא» נשמר לכל חבר בנפרד.
 */
function NotificationsPage() {
  const { notifications, markNotificationsRead } = useAppData()
  const [tab, setTab] = useState('all')

  const visible = notifications
    .filter((item) => tab === 'all' || item.kind === tab)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const groups = [
    { id: 'week', title: 'השבוע', items: visible.filter((item) => daysAgo(item.createdAt) < 7) },
    { id: 'older', title: 'קודם', items: visible.filter((item) => daysAgo(item.createdAt) >= 7) },
  ].filter((group) => group.items.length > 0)
  const unreadIds = notifications.filter((item) => !item.read).map((item) => item.id)

  return (
    <AppPage width="reading">
      <title>התראות · אחריות+</title>
      <PageHeader
        title="התראות"
        actions={
          <TextButton disabled={unreadIds.length === 0} onClick={() => markNotificationsRead(unreadIds)}>
            סימון הכול כנקרא
          </TextButton>
        }
      />
      <p className="visually-hidden" role="status">
        {unreadIds.length === 0 && notifications.length > 0 ? 'כל ההתראות נקראו' : ''}
      </p>

      <Tabs label="סוג ההתראות" idPrefix="notifications" tabs={TABS} value={tab} onChange={setTab} />
      <div
        id="notifications-panel"
        role="tabpanel"
        aria-labelledby={`notifications-tab-${tab}`}
        className="notifications__panel"
      >
        {groups.length === 0 ? (
          <StateMessage icon="notifications" titleAs="h2" size="sm" title="אין התראות חדשות" className="appliances__state">
            <p>ניידע אתכם 90, 30 ו־7 ימים לפני שאחריות מסתיימת.</p>
          </StateMessage>
        ) : (
          groups.map((group) => (
            <section key={group.id} className="notifications__group" aria-labelledby={`notifications-${group.id}`}>
              <h2 id={`notifications-${group.id}`} className="notifications__group-title">
                {group.title}
              </h2>
              <ul className="notifications__list">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <NotificationRow notification={item} onOpen={(id) => markNotificationsRead([id])} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </AppPage>
  )
}

export default NotificationsPage
