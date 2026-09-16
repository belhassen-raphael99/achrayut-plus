import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { AppDataContext } from './AppDataContext.js'
import { appReducer } from './appReducer.js'
import { DEMO_VERSION, createInitialState } from './demoData.js'
import { FORWARDING_DOMAIN, PLANS, ROLES, findById } from './lists.js'
import { addBusinessDays, addDays, addMonths, parseISODate, toISODate, today } from '../utils/dates.js'
import { createId } from '../utils/ids.js'
import { generateInviteCode } from '../utils/inviteCode.js'
import { byGender, fullName } from '../utils/text.js'

const STORAGE_KEY = 'achrayut-demo-data'

// «טעינה» מדומה אחרי החלפת מרחב, כדי שמצב הטעינה (D5) ייראה כמו מול שרת
const SWITCH_LOADING_MS = 700

// ביטול מנוי נכנס לתוקף תוך 3 ימי עסקים (PRD §6, FR-6.3)
const CANCEL_BUSINESS_DAYS = 3

// החלק המקומי של כתובת ההעברה: 8 תווים שקשה לנחש, בלי תווים שמתבלבלים (FR-9.1). בשלב 8 בשרת
const LOCAL_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'
function forwardingLocalPart() {
  return Array.from({ length: 8 }, () => LOCAL_ALPHABET[Math.floor(Math.random() * LOCAL_ALPHABET.length)]).join('')
}

/** התוכנית שחלה בפועל: מנוי שבוטל ותאריך הסיום שלו עבר → חינם (FR-6.3) */
function effectivePlan(user) {
  const ended = user?.cancelAt && parseISODate(user.cancelAt) <= today()
  return findById(PLANS, ended ? 'free' : user?.plan) ?? findById(PLANS, 'free')
}

function loadState() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY))
    if (saved?.version === DEMO_VERSION) return saved
  } catch {
    // נתונים פגומים או אין sessionStorage: מתחילים מנתוני הדוגמה
  }
  return createInitialState()
}

/**
 * «השרת» של שלב 6: הנתונים המזויפים ב־state של React, שנשמרים ב־sessionStorage עד שסוגרים את הלשונית.
 * בשלב 8 הפעולות כאן מוחלפות בקריאות ל־Supabase, וההרשאות נאכפות ב־RLS.
 */
function AppDataProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadState)
  const [loading, setLoading] = useState(false)
  const loadingTimer = useRef(undefined)
  // הקובץ שנבחר להוספת מכשיר (N1 → N3). קובץ לא נשמר ב־sessionStorage, ולכן אחרי רענון בוחרים שוב
  const [scan, setScan] = useState(null)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // בלי sessionStorage השינויים נשמרים רק עד רענון
    }
  }, [state])

  useEffect(() => () => clearTimeout(loadingTimer.current), [])

  const value = useMemo(() => {
    const { userId } = state
    const user = state.users[userId]

    const spaces = state.spaces
      .map((space) => {
        const membership = space.members.find((member) => member.userId === userId)
        if (!membership) return null
        const applianceCount = state.appliances.filter((item) => item.spaceId === space.id).length
        return { ...space, role: membership.role, applianceCount }
      })
      .filter(Boolean)

    const activeSpace =
      spaces.find((space) => space.id === state.activeSpaceByUser[userId]) ?? spaces[0] ?? null
    const role = activeSpace?.role ?? null
    const appliances = activeSpace
      ? state.appliances.filter((item) => item.spaceId === activeSpace.id)
      : []

    // ---------- נכסים (FR-7) ----------
    // מרחב שנוצר לפני הנכסים מקבל נכס אחד בשם המרחב (FR-7.1)
    const properties = activeSpace
      ? activeSpace.properties?.length
        ? activeSpace.properties
        : [{ id: `${activeSpace.id}-property`, name: activeSpace.name }]
      : []
    const multiProperty = properties.length > 1
    const propertyOf = (appliance) => appliance.propertyId ?? properties[0]?.id
    const chosenProperty = activeSpace ? state.activePropertyByUser?.[userId]?.[activeSpace.id] : null
    const activePropertyId =
      multiProperty && properties.some((property) => property.id === chosenProperty) ? chosenProperty : 'all'
    // הדשבורד והרשימה מציגים רק את הנכס שנבחר; כרטיס, עריכה ומסמכים מחפשים בכל המרחב
    const propertyAppliances =
      activePropertyId === 'all' ? appliances : appliances.filter((item) => propertyOf(item) === activePropertyId)
    const propertyName = (appliance) =>
      multiProperty ? properties.find((property) => property.id === propertyOf(appliance))?.name ?? '' : ''

    // התראה על פעולה מוצגת לשאר החברים, לא למי שביצע אותה (FR-5.7)
    // התראה עם recipientId מוצגת רק לו (למשל «חשבונית שהעברתם במייל», FR-9.3)
    const notifications = state.notifications
      .filter(
        (item) =>
          item.spaceId === activeSpace?.id &&
          item.actorId !== userId &&
          (!item.recipientId || item.recipientId === userId),
      )
      .map((item) => ({ ...item, read: item.readBy.includes(userId) }))

    function signIn(nextUserId) {
      dispatch({ type: 'signIn', userId: nextUserId })
    }

    function signOut() {
      dispatch({ type: 'signOut' })
    }

    function switchSpace(spaceId) {
      if (spaceId === activeSpace?.id) return
      dispatch({ type: 'switchSpace', spaceId })
      setLoading(true)
      clearTimeout(loadingTimer.current)
      loadingTimer.current = setTimeout(() => setLoading(false), SWITCH_LOADING_MS)
    }

    /** יוצר מרחב, הופך אותו לפעיל ומחזיר את המזהה שלו (O2) */
    function createSpace({ type, name }) {
      const space = {
        id: createId('space'),
        name: name.trim(),
        type,
        ownerId: userId,
        members: [{ userId, role: 'full' }],
        invites: [],
        // כל מרחב נפתח עם נכס אחד, בשם המרחב (FR-7.1)
        properties: [{ id: createId('property'), name: name.trim() }],
        forwarding: { local: forwardingLocalPart() },
        inbox: [],
      }
      dispatch({ type: 'createSpace', space })
      return space.id
    }

    /**
     * הצטרפות עם קוד (O3–O5). מחזיר:
     * { status: 'joined', spaceId, role, inviterId } · { status: 'member', spaceId } · { status: 'invalid' }
     * קוד שגוי וקוד שפג תוקפו מחזירים אותו דבר (FR-1.4).
     */
    function joinSpace(code) {
      const space = state.spaces.find((item) => item.invites.some((invite) => invite.code === code))
      const invite = space?.invites.find((item) => item.code === code)
      if (!invite || parseISODate(invite.expiresAt) < today()) return { status: 'invalid' }

      if (space.members.some((member) => member.userId === userId)) {
        switchSpace(space.id)
        return { status: 'member', spaceId: space.id }
      }

      const roleLabel = findById(ROLES, invite.role).label
      dispatch({
        type: 'joinSpace',
        spaceId: space.id,
        inviteId: invite.id,
        role: invite.role,
        notification: {
          id: createId('notification'),
          spaceId: space.id,
          kind: 'space',
          tone: 'member',
          text: `${fullName(user)} ${byGender(user, 'הצטרפה', 'הצטרף')} למרחב עם ${roleLabel}`,
          createdAt: new Date().toISOString(),
          target: '/members',
          actorId: userId,
          readBy: [],
        },
      })
      return { status: 'joined', spaceId: space.id, role: invite.role, inviterId: invite.invitedBy }
    }

    /**
     * מכשיר חדש במרחב הפעיל; שאר החברים מקבלים התראה (FR-5.7).
     * בלי נכס: הנכס שנבחר בסינון, ואם נבחרו «כל הנכסים» — הראשון (FR-7.3)
     */
    function addAppliance(newAppliance) {
      const appliance = {
        ...newAppliance,
        propertyId:
          newAppliance.propertyId || (activePropertyId !== 'all' ? activePropertyId : properties[0]?.id),
      }
      const place = propertyName(appliance)
      dispatch({
        type: 'addAppliance',
        appliance,
        notification: {
          id: createId('notification'),
          spaceId: appliance.spaceId,
          kind: 'space',
          tone: 'added',
          // שם הנכס אחרי שם המכשיר, כשיש כמה נכסים (FR-7.3)
          text: `${place ? `${appliance.name} · ${place}` : appliance.name} נוסף למרחב`,
          createdAt: new Date().toISOString(),
          target: `/appliances/${appliance.id}`,
          actorId: userId,
          readBy: [],
        },
      })
      return appliance.id
    }

    function recordScan() {
      dispatch({ type: 'recordScan' })
    }

    const applianceById = (id) => state.appliances.find((item) => item.id === id)

    /**
     * איפה המכשיר ביחס למשתמש: active (במרחב הפעיל) · other (במרחב אחר שלו, spaceId) ·
     * forbidden (במרחב שהוא לא חבר בו, E5) · missing (לא קיים או נמחק, FR-5.4)
     */
    function applianceAccess(id) {
      const appliance = applianceById(id)
      if (!appliance) return { kind: 'missing' }
      if (appliance.spaceId === activeSpace?.id) return { kind: 'active' }
      if (spaces.some((space) => space.id === appliance.spaceId)) return { kind: 'other', spaceId: appliance.spaceId }
      return { kind: 'forbidden' }
    }

    function updateAppliance(id, changes) {
      dispatch({ type: 'updateAppliance', id, changes })
    }

    function deleteAppliance(id) {
      dispatch({ type: 'deleteAppliance', id })
    }

    /**
     * שמירת איש קשר (F10, FR-3.5): איש קשר אחד לכל סוג, ואיש קשר ראשי אחד בדיוק.
     * contact.id ריק → איש קשר חדש. הראשון שנוסף הופך לראשי.
     */
    function saveContact(applianceId, contact) {
      const current = applianceById(applianceId).contacts
      const exists = current.some((item) => item.id === contact.id)
      let next = exists
        ? current.map((item) => (item.id === contact.id ? contact : item))
        : [...current, { ...contact, id: createId('contact') }]

      if (contact.primary) next = next.map((item) => ({ ...item, primary: item.type === contact.type }))
      if (!next.some((item) => item.primary)) next = next.map((item, index) => ({ ...item, primary: index === 0 }))
      updateAppliance(applianceId, { contacts: next })
    }

    function deleteContact(applianceId, contactId) {
      let next = applianceById(applianceId).contacts.filter((item) => item.id !== contactId)
      if (next.length > 0 && !next.some((item) => item.primary)) {
        next = next.map((item, index) => ({ ...item, primary: index === 0 }))
      }
      updateAppliance(applianceId, { contacts: next })
    }

    /** אחריות מורחבת (F11, FR-3.3); עם תעודה → נשמרת גם כמסמך */
    function setExtendedWarranty(applianceId, extended, certificate) {
      const appliance = applianceById(applianceId)
      updateAppliance(applianceId, {
        extended,
        documents: certificate ? [...appliance.documents, certificate] : appliance.documents,
      })
    }

    function addDocument(applianceId, document) {
      updateAppliance(applianceId, { documents: [...applianceById(applianceId).documents, document] })
    }

    function replaceDocument(applianceId, documentId, changes) {
      updateAppliance(applianceId, {
        documents: applianceById(applianceId).documents.map((item) =>
          item.id === documentId ? { ...item, ...changes } : item,
        ),
      })
    }

    function deleteDocument(applianceId, documentId) {
      updateAppliance(applianceId, {
        documents: applianceById(applianceId).documents.filter((item) => item.id !== documentId),
      })
    }

    /** שומר את הקובץ שנבחר ואת הכתובת הזמנית שלו לתצוגה; מחליף קובץ קודם */
    /**
     * extra (חשבונית שהועברה במייל, FR-9.3): { inboxId, result } → ישר לבדיקה · { inboxId, lines } → בחירת מכשיר
     */
    function startScan(file, source, extra = {}) {
      if (scan?.url) URL.revokeObjectURL(scan.url)
      setScan({ file, source, url: URL.createObjectURL(file), ...extra })
    }

    function clearScan() {
      if (scan?.url) URL.revokeObjectURL(scan.url)
      setScan(null)
    }

    /** חשבונית עם כמה מכשירים: השורות שנשארו, כדי להוסיף אותן בלי סריקה נוספת (FR-2.6) */
    function keepScanLines(lines) {
      setScan((previous) => (previous ? { ...previous, lines } : previous))
    }

    function markNotificationsRead(ids) {
      if (ids.length > 0) dispatch({ type: 'markNotificationsRead', ids })
    }

    const updateSpace = (changes) => dispatch({ type: 'updateSpace', id: activeSpace.id, changes })

    // מגבלות המרחב לפי התוכנית של יוצר המרחב (FR-1.5, FR-6.4). הזמנה שפג תוקפה לא נספרת
    const ownerPlan = activeSpace ? effectivePlan(state.users[activeSpace.ownerId]) : null
    const validInvites = activeSpace
      ? activeSpace.invites.filter((invite) => parseISODate(invite.expiresAt) >= today())
      : []
    const invitedCount = activeSpace
      ? activeSpace.members.filter((member) => member.userId !== activeSpace.ownerId).length + validInvites.length
      : 0
    // מגבלת הנכסים לפי התוכנית של יוצר המרחב (FR-7.1, FR-6.4)
    const propertyRules = ownerPlan
      ? { limit: ownerPlan.properties, limitReached: properties.length >= ownerPlan.properties }
      : null

    const inviteRules = ownerPlan
      ? {
          viewerOnly: ownerPlan.viewerOnly,
          limitReached: ownerPlan.invitees !== null && invitedCount >= ownerPlan.invitees,
        }
      : null

    /** קוד הזמנה חדש למרחב הפעיל, עם ההרשאה שנבחרה לפני יצירתו, בתוקף 7 ימים (M2, FR-1.5) */
    function inviteMember(role) {
      const existing = state.spaces.flatMap((space) => space.invites.map((invite) => invite.code))
      const invite = {
        id: createId('invite'),
        name: '',
        role,
        code: generateInviteCode(existing),
        invitedBy: userId,
        expiresAt: toISODate(addDays(today(), 7)),
      }
      updateSpace({ invites: [...activeSpace.invites, invite] })
      return invite
    }

    /** ביטול הזמנה שעוד לא נוצלה: הקוד מפסיק לעבוד, והמקום מתפנה במגבלת התוכנית */
    function cancelInvite(inviteId) {
      updateSpace({ invites: activeSpace.invites.filter((invite) => invite.id !== inviteId) })
    }

    /** שינוי הרשאה (M3, FR-1.7). את יוצר המרחב אי אפשר לשנות */
    function changeMemberRole(memberId, role) {
      if (memberId === activeSpace.ownerId) return
      updateSpace({
        members: activeSpace.members.map((member) => (member.userId === memberId ? { ...member, role } : member)),
      })
    }

    /** הסרה מהמרחב (M4, FR-1.7). את יוצר המרחב אי אפשר להסיר */
    function removeMember(memberId) {
      if (memberId === activeSpace.ownerId) return
      updateSpace({ members: activeSpace.members.filter((member) => member.userId !== memberId) })
    }

    /** עזיבת המרחב (M5). שאר החברים מקבלים התראה (FR-5.7); המרחב הפעיל עובר למרחב אחר, אם יש */
    function leaveSpace() {
      const spaceId = activeSpace.id
      updateSpace({ members: activeSpace.members.filter((member) => member.userId !== userId) })
      dispatch({
        type: 'addNotification',
        notification: {
          id: createId('notification'),
          spaceId,
          kind: 'space',
          tone: 'member',
          text: `${fullName(user)} ${byGender(user, 'עזבה', 'עזב')} את המרחב`,
          createdAt: new Date().toISOString(),
          target: '/members',
          actorId: userId,
          readBy: [],
        },
      })
      const next = spaces.find((space) => space.id !== spaceId)
      if (next) dispatch({ type: 'switchSpace', spaceId: next.id })
    }

    /** בחירת נכס בסינון: מזהה נכס או 'all' (FR-7.4) */
    function setActiveProperty(propertyId) {
      dispatch({ type: 'setActiveProperty', spaceId: activeSpace.id, propertyId })
    }

    /** נכס חדש (FR-7.2). השם כבר נבדק בטופס: חובה, עד 40 תווים, בלי כפילות */
    function addProperty(name) {
      const property = { id: createId('property'), name: name.trim() }
      updateSpace({ properties: [...properties, property] })
      return property.id
    }

    function renameProperty(propertyId, name) {
      updateSpace({
        properties: properties.map((property) =>
          property.id === propertyId ? { ...property, name: name.trim() } : property,
        ),
      })
    }

    /** מחיקה: רק נכס בלי מכשירים, ורק כשיש יותר מנכס אחד (FR-7.2) */
    function deleteProperty(propertyId) {
      if (properties.length <= 1 || appliances.some((item) => propertyOf(item) === propertyId)) return
      updateSpace({ properties: properties.filter((property) => property.id !== propertyId) })
      if (activePropertyId === propertyId) setActiveProperty('all')
    }

    // ---------- העברת חשבוניות במייל (FR-9) ----------
    /** «כתובת חדשה»: הכתובת מתחלפת, והקודמת מפסיקה לעבוד */
    function regenerateForwardingAddress() {
      updateSpace({ forwarding: { local: forwardingLocalPart() } })
    }

    /** החשבונית יוצאת מ«ממתינות לבדיקה»: אחרי שמירת מכשיר, או במחיקה */
    function removeInboxItem(itemId) {
      updateSpace({ inbox: (activeSpace.inbox ?? []).filter((item) => item.id !== itemId) })
    }

    function renameSpace(name) {
      updateSpace({ name: name.trim() })
    }

    /** מחיקת המרחב (P5): רק יוצר המרחב (FR-1.7) */
    function deleteSpace() {
      if (activeSpace.ownerId !== userId) return
      const next = spaces.find((space) => space.id !== activeSpace.id)
      dispatch({ type: 'deleteSpace', id: activeSpace.id })
      if (next) dispatch({ type: 'switchSpace', spaceId: next.id })
    }

    function updateProfile(changes) {
      dispatch({ type: 'updateUser', changes })
    }

    /** מחזיר את נתוני הדוגמה להתחלה (אחרי «מחיקת החשבון» בשלב 6) */
    function resetDemo() {
      dispatch({ type: 'reset', state: createInitialState() })
    }

    // ---------- התוכנית שלי (FR-6) ----------
    /** מעבר לתוכנית בתשלום (P11). התשלום מדומה; החידוש בעוד חודש או שנה, וביטול קודם מתבטל */
    function changePlan(planId, billing) {
      const start = today()
      dispatch({
        type: 'updateUser',
        changes: {
          plan: planId,
          billing,
          renewsAt: toISODate(billing === 'annual' ? addMonths(start, 12) : addMonths(start, 1)),
          cancelAt: null,
        },
      })
    }

    /** ביטול המנוי (P12): התוכנית פעילה עוד 3 ימי עסקים, ואז חינם. שום דבר לא נמחק */
    function cancelSubscription() {
      dispatch({ type: 'updateUser', changes: { cancelAt: toISODate(addBusinessDays(today(), CANCEL_BUSINESS_DAYS)) } })
    }

    /** «חידוש המנוי»: מבטל את הביטול */
    function resumeSubscription() {
      dispatch({ type: 'updateUser', changes: { cancelAt: null } })
    }

    // מכסת הסריקות לפי התוכנית של מי שסורק, ומתחדשת ב־1 בחודש (PRD §6, FR-6.4)
    const plan = effectivePlan(user)
    const now = today()
    const scanQuota = {
      used: user.scansUsed,
      limit: plan.scans,
      remaining: Math.max(0, plan.scans - user.scansUsed),
      renewsOn: addMonths(new Date(now.getFullYear(), now.getMonth(), 1), 1),
    }

    const subscription = {
      plan,
      billing: plan.id === 'free' ? null : user.billing,
      renewsOn: plan.id === 'free' ? null : parseISODate(user.renewsAt),
      cancelOn: plan.id === 'free' ? null : parseISODate(user.cancelAt),
    }

    // שימוש במרחב הפעיל מול המגבלות של יוצר המרחב (P9)
    const spaceLimits = activeSpace
      ? {
          plan: ownerPlan,
          isOwner: activeSpace.ownerId === userId,
          properties: properties.length,
          invited: invitedCount,
        }
      : null

    return {
      user,
      users: state.users,
      spaces,
      activeSpace,
      role,
      isViewer: role === 'viewer',
      appliances,
      properties,
      multiProperty,
      activePropertyId,
      propertyAppliances,
      propertyRules,
      applianceCountIn: (propertyId) => appliances.filter((item) => propertyOf(item) === propertyId).length,
      propertyName,
      forwardingAddress: activeSpace?.forwarding ? `${activeSpace.forwarding.local}@${FORWARDING_DOMAIN}` : null,
      inbox: activeSpace?.inbox ?? [],
      notifications,
      unreadCount: notifications.filter((item) => !item.read).length,
      loading,
      scan,
      scanQuota,
      subscription,
      spaceLimits,
      inviteRules,
      signedOut: state.signedOut === true,
      signIn,
      signOut,
      markNotificationsRead,
      inviteMember,
      cancelInvite,
      changeMemberRole,
      removeMember,
      leaveSpace,
      renameSpace,
      deleteSpace,
      setActiveProperty,
      regenerateForwardingAddress,
      removeInboxItem,
      addProperty,
      renameProperty,
      deleteProperty,
      updateProfile,
      resetDemo,
      changePlan,
      cancelSubscription,
      resumeSubscription,
      switchSpace,
      createSpace,
      joinSpace,
      applianceAccess,
      addAppliance,
      updateAppliance,
      deleteAppliance,
      saveContact,
      deleteContact,
      setExtendedWarranty,
      addDocument,
      replaceDocument,
      deleteDocument,
      recordScan,
      startScan,
      clearScan,
      keepScanLines,
    }
  }, [state, loading, scan])

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export default AppDataProvider
