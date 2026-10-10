import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import SiteLayout from './components/layout/SiteLayout/SiteLayout.jsx'
import SystemLayout from './components/layout/SystemLayout/SystemLayout.jsx'
import AuthLayout from './components/layout/AuthLayout/AuthLayout.jsx'
import OnboardingLayout from './components/layout/OnboardingLayout/OnboardingLayout.jsx'
import AppShell from './components/layout/AppShell/AppShell.jsx'
import RequireAuth from './components/layout/RequireAuth/RequireAuth.jsx'
import RequireGuest from './components/layout/RequireGuest/RequireGuest.jsx'
import HomePage from './pages/site/HomePage.jsx'
import PricingPage from './pages/site/PricingPage.jsx'
import FaqPage from './pages/site/FaqPage.jsx'
import ContactPage from './pages/site/ContactPage.jsx'
import TermsPage from './pages/site/TermsPage.jsx'
import PrivacyPage from './pages/site/PrivacyPage.jsx'
import AccessibilityPage from './pages/site/AccessibilityPage.jsx'
import CancelSubscriptionPage from './pages/site/CancelSubscriptionPage.jsx'
import NotFoundPage from './pages/site/NotFoundPage.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'
import SignupPage from './pages/auth/SignupPage.jsx'
import CheckEmailPage from './pages/auth/CheckEmailPage.jsx'
import VerifyEmailPage from './pages/auth/VerifyEmailPage.jsx'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx'
import AccountDisabledPage from './pages/auth/AccountDisabledPage.jsx'
import ServerErrorPage from './pages/system/ServerErrorPage.jsx'
import MaintenancePage from './pages/system/MaintenancePage.jsx'
import { importWithReload } from './utils/importWithReload.js'

/*
 * כל מה שמאחורי ההתחברות יורד בחבילה נפרדת, פעם אחת: כל השורות כאן מפנות לאותו מודול,
 * ולכן נוצרת חבילה אחת ולא 23 (צעד 9). דף הבית עצמו נטען ישר, כי הוא העמוד הראשון שרואים.
 */
const appPages = () => importWithReload(() => import('./pages/appPages.js'))
const page = (name) => lazy(() => appPages().then((module) => ({ default: module[name] })))

const WelcomePage = page('WelcomePage')
const CreateSpacePage = page('CreateSpacePage')
const JoinSpacePage = page('JoinSpacePage')
const JoinedSpacePage = page('JoinedSpacePage')
const DashboardPage = page('DashboardPage')
const AppliancesPage = page('AppliancesPage')
const ScanPage = page('ScanPage')
const ManualEntryPage = page('ManualEntryPage')
const ApplianceDetailPage = page('ApplianceDetailPage')
const EditAppliancePage = page('EditAppliancePage')
const DocumentViewerPage = page('DocumentViewerPage')
const NotificationsPage = page('NotificationsPage')
const MembersPage = page('MembersPage')
const SettingsPage = page('SettingsPage')
const ProfilePage = page('ProfilePage')
const PasswordPage = page('PasswordPage')
const SpaceSettingsPage = page('SpaceSettingsPage')
const PropertiesPage = page('PropertiesPage')
const ForwardingPage = page('ForwardingPage')
const AssistantPage = page('AssistantPage')
const PlanPage = page('PlanPage')
const ChangePlanPage = page('ChangePlanPage')
const ConfirmPlanPage = page('ConfirmPlanPage')

// מפת האתר (docs/04-wireframes.md)
function App() {
  return (
    <Routes>
      {/* האתר הציבורי */}
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="accessibility" element={<AccessibilityPage />} />
        <Route path="cancel-subscription" element={<CancelSubscriptionPage />} />
      </Route>

      {/* התחברות והרשמה (A1–A20) */}
      <Route element={<AuthLayout />}>
        {/* מי שכבר מחובר לא רואה התחברות והרשמה */}
        <Route element={<RequireGuest />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
        </Route>
        <Route path="check-email" element={<CheckEmailPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="account-disabled" element={<AccountDisabledPage />} />
      </Route>

      {/* מכאן צריך סשן: בלי התחברות חוזרים ל־/login עם ?next (FR-1.2) */}
      <Route element={<RequireAuth />}>

      {/* כניסה ראשונה (O1–O5) */}
      <Route element={<OnboardingLayout />}>
        <Route path="onboarding" element={<WelcomePage />} />
        <Route path="onboarding/create" element={<CreateSpacePage />} />
        <Route path="onboarding/join" element={<JoinSpacePage />} />
        <Route path="onboarding/joined" element={<JoinedSpacePage />} />
      </Route>

      {/* האפליקציה: עמודי הסרגל התחתון (APP LAYOUT) */}
      <Route element={<AppShell />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="appliances" element={<AppliancesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* תתי־עמודים עם כפתור ממולא משלהם (SUB-PAGE LAYOUT): בלי «צילום חשבונית» בסרגל הצד, כדי שיהיה כפתור ממולא אחד */}
      <Route element={<AppShell subPage hideAddAction />}>
        {/* /appliances/new לפני /appliances/:id, כדי ש«new» לא ייקרא כמזהה מכשיר */}
        <Route path="appliances/new" element={<Navigate to="/appliances/new/scan" replace />} />
        <Route path="appliances/new/scan" element={<ScanPage />} />
        <Route path="appliances/new/manual" element={<ManualEntryPage />} />
        <Route path="appliances/:applianceId/edit" element={<EditAppliancePage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="settings/profile" element={<ProfilePage />} />
        <Route path="settings/password" element={<PasswordPage />} />
        <Route path="settings/space" element={<SpaceSettingsPage />} />
        <Route path="settings/properties" element={<PropertiesPage />} />
        <Route path="settings/forwarding" element={<ForwardingPage />} />
        {/* התוכנית שלי (P9–P12, FR-6) */}
        <Route path="settings/plan" element={<PlanPage />} />
        <Route path="settings/plan/change" element={<ChangePlanPage />} />
        <Route path="settings/plan/confirm" element={<ConfirmPlanPage />} />
      </Route>

      {/* תתי־עמודים לצפייה (SUB-PAGE LAYOUT) */}
      <Route element={<AppShell subPage />}>
        <Route path="appliances/:applianceId" element={<ApplianceDetailPage />} />
        <Route path="appliances/:applianceId/documents/:documentId" element={<DocumentViewerPage />} />
        {/* העוזר לקריאה בלבד (X4, FR-10) */}
        <Route path="assistant" element={<AssistantPage />} />
      </Route>

      </Route>

      {/* דפי מערכת: 404 (E1) · 500 (E2, גם כשרכיב נכשל) · תחזוקה (E3). E4 = הפס «אין חיבור»; E5 = כרטיס ממרחב אחר */}
      <Route element={<SystemLayout />}>
        <Route path="error" element={<ServerErrorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="maintenance" element={<MaintenancePage />} />
    </Routes>
  )
}

export default App
