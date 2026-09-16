import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { AppDataContext } from './AppDataContext.js'
import { appReducer } from './appReducer.js'
import { DEMO_VERSION, createInitialState } from './demoData.js'
import { PLANS, ROLES, findById } from './lists.js'
import { addDays, addMonths, parseISODate, toISODate, today } from '../utils/dates.js'
import { createId } from '../utils/ids.js'
import { generateInviteCode } from '../utils/inviteCode.js'
import { byGender, fullName } from '../utils/text.js'

const STORAGE_KEY = 'achrayut-demo-data'

// «טעינה» מדומה אחרי החלפת מרחב, כדי שמצב הטעינה (D5) ייראה כמו מול שרת
const SWITCH_LOADING_MS = 700

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

    // התראה על פעולה מוצגת לשאר החברים, לא למי שביצע אותה (FR-5.7)
    const notifications = state.notifications
      .filter((item) => item.spaceId === activeSpace?.id && item.actorId !== userId)
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

    /** מכשיר חדש במרחב הפעיל; שאר החברים מקבלים התראה (FR-5.7) */
    function addAppliance(appliance) {
      dispatch({
        type: 'addAppliance',
        appliance,
        notification: {
          id: createId('notification'),
          spaceId: appliance.spaceId,
          kind: 'space',
          tone: 'added',
          text: `${appliance.name} נוסף למרחב`,
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
    function startScan(file, source) {
      if (scan?.url) URL.revokeObjectURL(scan.url)
      setScan({ file, source, url: URL.createObjectURL(file) })
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

    // מגבלת ההזמנות לפי התוכנית של יוצר המרחב (FR-1.5). הזמנה שפג תוקפה לא נספרת
    const ownerPlan = activeSpace ? findById(PLANS, state.users[activeSpace.ownerId]?.plan) : null
    const validInvites = activeSpace
      ? activeSpace.invites.filter((invite) => parseISODate(invite.expiresAt) >= today())
      : []
    const invitedCount = activeSpace
      ? activeSpace.members.filter((member) => member.userId !== activeSpace.ownerId).length + validInvites.length
      : 0
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

    // מכסת הסריקות מתחדשת ב־1 בחודש (PRD §6)
    const plan = findById(PLANS, user.plan)
    const now = today()
    const scanQuota = {
      used: user.scansUsed,
      limit: plan.scans,
      remaining: Math.max(0, plan.scans - user.scansUsed),
      renewsOn: addMonths(new Date(now.getFullYear(), now.getMonth(), 1), 1),
    }

    return {
      user,
      users: state.users,
      spaces,
      activeSpace,
      role,
      isViewer: role === 'viewer',
      appliances,
      notifications,
      unreadCount: notifications.filter((item) => !item.read).length,
      loading,
      scan,
      scanQuota,
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
      updateProfile,
      resetDemo,
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
