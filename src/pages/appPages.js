/*
 * כל העמודים שמאחורי ההתחברות, בקובץ אחד (צעד 9, 30/09/2026).
 * App.jsx טוען אותם ב־lazy דרך המודול הזה, ולכן כולם נכנסים לחבילה אחת שיורדת פעם אחת,
 * ולא לחבילה של האתר הציבורי: מבקר שקורא את דף הבית לא מוריד את האפליקציה.
 */
export { default as WelcomePage } from './onboarding/WelcomePage.jsx'
export { default as CreateSpacePage } from './onboarding/CreateSpacePage.jsx'
export { default as JoinSpacePage } from './onboarding/JoinSpacePage.jsx'
export { default as JoinedSpacePage } from './onboarding/JoinedSpacePage.jsx'
export { default as DashboardPage } from './app/DashboardPage.jsx'
export { default as AppliancesPage } from './app/AppliancesPage.jsx'
export { default as ScanPage } from './app/ScanPage.jsx'
export { default as ManualEntryPage } from './app/ManualEntryPage.jsx'
export { default as ApplianceDetailPage } from './app/ApplianceDetailPage.jsx'
export { default as EditAppliancePage } from './app/EditAppliancePage.jsx'
export { default as DocumentViewerPage } from './app/DocumentViewerPage.jsx'
export { default as NotificationsPage } from './app/NotificationsPage.jsx'
export { default as MembersPage } from './app/MembersPage.jsx'
export { default as SettingsPage } from './app/SettingsPage.jsx'
export { default as ProfilePage } from './app/ProfilePage.jsx'
export { default as PasswordPage } from './app/PasswordPage.jsx'
export { default as SpaceSettingsPage } from './app/SpaceSettingsPage.jsx'
export { default as PropertiesPage } from './app/PropertiesPage.jsx'
export { default as ForwardingPage } from './app/ForwardingPage.jsx'
export { default as AssistantPage } from './app/AssistantPage.jsx'
export { default as PlanPage } from './app/PlanPage.jsx'
export { default as ChangePlanPage } from './app/ChangePlanPage.jsx'
export { default as ConfirmPlanPage } from './app/ConfirmPlanPage.jsx'
