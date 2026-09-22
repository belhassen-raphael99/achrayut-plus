import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppDataContext } from './AppDataContext.js'
import { useAuth } from './useAuth.js'
import { loadAll, must, removeStoredFiles, toDb, uploadDocument } from './api.js'
import { FORWARDING_DOMAIN, PLANS, findById } from './lists.js'
import { addMonths, parseISODate, today } from '../utils/dates.js'
import { supabase } from '../lib/supabase.js'

/** התוכנית שחלה בפועל: מנוי שבוטל ותאריך הסיום שלו עבר → חינם (FR-6.3) */
function effectivePlan(user) {
  const ended = user?.cancelAt && parseISODate(user.cancelAt) <= today()
  return findById(PLANS, ended ? 'free' : user?.plan) ?? findById(PLANS, 'free')
}

const EMPTY = {
  userId: null,
  users: {},
  plans: [],
  spacePlans: {},
  activeSpaceId: null,
  activePropertyBySpace: {},
  spaces: [],
  appliances: [],
  notifications: [],
}

/**
 * הנתונים של האפליקציה (שלב 8.4): מ־Supabase, בהרשאות של המשתמש המחובר (RLS).
 * הצורה של הערך זהה לשלב 6, ולכן המסכים לא השתנו. הפעולות אסינכרוניות:
 * כותבות לשרת, ואחר כך טוענות הכול מחדש (הנתונים של משתמש אחד קטנים).
 * שגיאה בפעולה נזרקת הלאה, כדי שהמסך יציג אותה.
 */
function AppDataProvider({ children }) {
  const { user: authUser } = useAuth()
  const authUserId = authUser?.id ?? null
  // למי שייכים הנתונים שנטענו: נתונים של משתמש קודם לא מוצגים אף פעם
  const [loaded, setLoaded] = useState({ userId: null, data: EMPTY, error: null })
  const [switching, setSwitching] = useState(false)
  // הקובץ שנבחר להוספת מוצר (N1 → N3). נשאר בדפדפן עד השמירה
  const [scan, setScan] = useState(null)
  const authUserRef = useRef(authUser)

  useEffect(() => {
    authUserRef.current = authUser
  }, [authUser])

  useEffect(() => {
    if (!authUserId) return undefined
    let active = true
    loadAll(authUserRef.current)
      .then((data) => {
        if (active) setLoaded({ userId: authUserId, data, error: null })
      })
      .catch((error) => {
        console.error('טעינת הנתונים נכשלה', error)
        if (active) setLoaded({ userId: authUserId, data: EMPTY, error })
      })
    return () => {
      active = false
    }
  }, [authUserId])

  /** טוען מחדש אחרי כל כתיבה. כישלון בטעינה לא מבטל פעולה שכבר נשמרה */
  const refresh = useCallback(async () => {
    const current = authUserRef.current
    if (!current) return
    try {
      const data = await loadAll(current)
      setLoaded({ userId: current.id, data, error: null })
    } catch (error) {
      console.error('טעינת הנתונים נכשלה', error)
    }
  }, [])

  const ready = Boolean(authUserId) && loaded.userId === authUserId
  const state = ready ? loaded.data : EMPTY
  const loadError = ready ? loaded.error : null

  const value = useMemo(() => {
    const { userId } = state
    const user = state.users[userId] ?? null

    const spaces = state.spaces
      .map((space) => {
        const membership = space.members.find((member) => member.userId === userId)
        if (!membership) return null
        const applianceCount = state.appliances.filter((item) => item.spaceId === space.id).length
        return { ...space, role: membership.role, applianceCount }
      })
      .filter(Boolean)

    const activeSpace = spaces.find((space) => space.id === state.activeSpaceId) ?? spaces[0] ?? null
    const role = activeSpace?.role ?? null
    const appliances = activeSpace ? state.appliances.filter((item) => item.spaceId === activeSpace.id) : []

    // ---------- נכסים (FR-7): בכל מרחב יש לפחות נכס אחד (נוצר בשרת עם המרחב) ----------
    const properties = activeSpace?.properties ?? []
    const multiProperty = properties.length > 1
    const propertyOf = (appliance) => appliance.propertyId ?? properties[0]?.id
    const chosenProperty = activeSpace ? state.activePropertyBySpace[activeSpace.id] : null
    const activePropertyId =
      multiProperty && properties.some((property) => property.id === chosenProperty) ? chosenProperty : 'all'
    // הדשבורד והרשימה מציגים רק את הנכס שנבחר; כרטיס, עריכה ומסמכים מחפשים בכל המרחב
    const propertyAppliances =
      activePropertyId === 'all' ? appliances : appliances.filter((item) => propertyOf(item) === activePropertyId)
    const propertyName = (appliance) =>
      multiProperty ? properties.find((property) => property.id === propertyOf(appliance))?.name ?? '' : ''

    // ה־RLS כבר מסנן: לא מי שביצע, ועם נמען — רק הוא (FR-5.7, FR-9.3)
    const notifications = state.notifications
      .filter((item) => item.spaceId === activeSpace?.id)
      .map((item) => ({ ...item, read: item.readBy.includes(userId) }))

    const applianceById = (id) => state.appliances.find((item) => item.id === id)
    const spaceOfAppliance = (id) => applianceById(id)?.spaceId

    // ---------- מרחבים ----------

    async function setActiveSpaceId(spaceId) {
      must(await supabase.from('profiles').update({ active_space_id: spaceId }).eq('id', userId))
    }

    async function switchSpace(spaceId) {
      if (spaceId === activeSpace?.id) return
      setSwitching(true)
      try {
        await setActiveSpaceId(spaceId)
        await refresh()
      } finally {
        setSwitching(false)
      }
    }

    /** יוצר מרחב (השרת מוסיף את היוצר בגישה מלאה ונכס ראשון), הופך אותו לפעיל ומחזיר את המזהה (O2) */
    async function createSpace({ type, name }) {
      const space = must(await supabase.from('spaces').insert({ name: name.trim(), type }).select('id').single())
      await setActiveSpaceId(space.id)
      await refresh()
      return space.id
    }

    /**
     * הצטרפות עם קוד (O3–O5). מחזיר:
     * { status: 'joined', spaceId, role, inviterId } · { status: 'member', spaceId } · { status: 'invalid' }
     */
    async function joinSpace(code) {
      const result = must(await supabase.rpc('join_space', { p_code: code }))
      if (result.status === 'invalid') return { status: 'invalid' }
      await setActiveSpaceId(result.space_id)
      await refresh()
      if (result.status === 'member') return { status: 'member', spaceId: result.space_id }
      return { status: 'joined', spaceId: result.space_id, role: result.role, inviterId: result.invited_by }
    }

    async function renameSpace(name) {
      must(await supabase.from('spaces').update({ name: name.trim() }).eq('id', activeSpace.id))
      await refresh()
    }

    /** מחיקת המרחב (P5): רק יוצר המרחב (FR-1.7, נאכף ב־RLS). הקבצים נמחקים מה־Storage */
    async function deleteSpace() {
      const paths = appliances.flatMap((item) => item.documents.map((doc) => doc.storagePath).filter(Boolean))
      const next = spaces.find((space) => space.id !== activeSpace.id)
      // קודם הקבצים: אחרי מחיקת המרחב כבר אין הרשאה לתיקייה שלו ב־Storage
      await removeStoredFiles(paths).catch(() => {})
      must(await supabase.from('spaces').delete().eq('id', activeSpace.id))
      if (next) await setActiveSpaceId(next.id)
      await refresh()
    }

    // ---------- מוצרים ----------

    /**
     * מוצר חדש במרחב הפעיל. בלי נכס: הנכס שנבחר בסינון, ואם נבחרו «כל הנכסים» — הראשון (FR-7.3).
     * השרת יוצר את ההתראה לשאר החברים (FR-5.7). documents: [{ type, file }]
     */
    async function addAppliance(newAppliance) {
      const spaceId = newAppliance.spaceId ?? activeSpace.id
      const propertyId =
        newAppliance.propertyId || (activePropertyId !== 'all' ? activePropertyId : properties[0]?.id)

      const row = must(
        await supabase
          .from('appliances')
          .insert({
            space_id: spaceId,
            property_id: propertyId,
            name: newAppliance.name,
            category: toDb(newAppliance.category || 'other'),
            room: toDb(newAppliance.room || 'other'),
            brand: newAppliance.brand || null,
            model: newAppliance.model || null,
            serial: newAppliance.serial || null,
            purchase_date: newAppliance.purchaseDate || null,
            warranty_months: newAppliance.warrantyMonths,
            warranty_source: newAppliance.warrantySource,
          })
          .select('id')
          .single(),
      )

      if (newAppliance.extended) await writeExtended(row.id, newAppliance.extended)

      const contacts = (newAppliance.contacts ?? []).map((item) => ({
        appliance_id: row.id,
        ...contactColumns(item),
      }))
      if (contacts.length > 0) must(await supabase.from('contacts').insert(contacts))

      for (const doc of newAppliance.documents ?? []) {
        if (doc.file) await uploadDocument({ spaceId, applianceId: row.id, type: doc.type, file: doc.file })
      }

      await refresh()
      return row.id
    }

    /**
     * איפה המוצר ביחס למשתמש: active (במרחב הפעיל) · other (במרחב אחר שלו, spaceId) ·
     * missing (לא קיים, נמחק, או במרחב שהוא לא חבר בו — ה־RLS לא מחזיר אותו, E5)
     */
    function applianceAccess(id) {
      const appliance = applianceById(id)
      if (!appliance) return { kind: 'missing' }
      if (appliance.spaceId === activeSpace?.id) return { kind: 'active' }
      return { kind: 'other', spaceId: appliance.spaceId }
    }

    async function updateAppliance(id, changes) {
      const columns = {}
      const map = {
        propertyId: 'property_id',
        name: 'name',
        brand: 'brand',
        model: 'model',
        serial: 'serial',
        purchaseDate: 'purchase_date',
        warrantyMonths: 'warranty_months',
        warrantySource: 'warranty_source',
      }
      Object.entries(map).forEach(([key, column]) => {
        if (key in changes) columns[column] = changes[key] === '' ? null : changes[key]
      })
      if ('category' in changes) columns.category = toDb(changes.category || 'other')
      if ('room' in changes) columns.room = toDb(changes.room || 'other')

      if (Object.keys(columns).length > 0) must(await supabase.from('appliances').update(columns).eq('id', id))
      if ('extended' in changes) {
        if (changes.extended) await writeExtended(id, changes.extended)
        else must(await supabase.from('extended_warranties').delete().eq('appliance_id', id))
      }
      await refresh()
    }

    /** מחיקה (F9): המסמכים, התזכורות ואנשי הקשר נמחקים בשרשרת; הקבצים נמחקים מה־Storage */
    async function deleteAppliance(id) {
      const paths = (applianceById(id)?.documents ?? []).map((doc) => doc.storagePath).filter(Boolean)
      must(await supabase.from('appliances').delete().eq('id', id))
      await removeStoredFiles(paths).catch(() => {})
      await refresh()
    }

    async function writeExtended(applianceId, extended) {
      must(
        await supabase.from('extended_warranties').upsert({
          appliance_id: applianceId,
          provider: extended.provider,
          start_date: extended.start,
          end_date: extended.end,
          source: extended.source ?? 'manual',
          certificate_document_id: extended.certificateId ?? null,
        }),
      )
    }

    // ---------- אנשי קשר (F10, FR-3.5): אחד לכל סוג, ראשי אחד בדיוק ----------

    function contactColumns(contact) {
      return {
        type: contact.type,
        name: contact.name.trim(),
        phone: contact.phone?.trim() || null,
        email: contact.email?.trim() || null,
        website: contact.website?.trim() || null,
        note: contact.note?.trim() || null,
        is_primary: Boolean(contact.primary),
      }
    }

    async function ensureOnePrimary(applianceId, primaryId) {
      // קודם מורידים את הראשי הקודם, כי במסד מותר רק ראשי אחד לכל מוצר
      must(
        await supabase
          .from('contacts')
          .update({ is_primary: false })
          .eq('appliance_id', applianceId)
          .neq('id', primaryId),
      )
      must(await supabase.from('contacts').update({ is_primary: true }).eq('id', primaryId))
    }

    /** contact.id ריק או לא קיים → איש קשר חדש. הראשון שנוסף הופך לראשי */
    async function saveContact(applianceId, contact) {
      const current = applianceById(applianceId)?.contacts ?? []
      const exists = current.some((item) => item.id === contact.id)
      const columns = { ...contactColumns(contact), is_primary: false }

      const saved = exists
        ? must(await supabase.from('contacts').update(columns).eq('id', contact.id).select('id').single())
        : must(
            await supabase
              .from('contacts')
              .insert({ appliance_id: applianceId, ...columns })
              .select('id')
              .single(),
          )

      const others = current.filter((item) => item.id !== saved.id)
      if (contact.primary || !others.some((item) => item.primary)) await ensureOnePrimary(applianceId, saved.id)
      await refresh()
    }

    async function deleteContact(applianceId, contactId) {
      must(await supabase.from('contacts').delete().eq('id', contactId))
      const rest = (applianceById(applianceId)?.contacts ?? []).filter((item) => item.id !== contactId)
      if (rest.length > 0 && !rest.some((item) => item.primary)) await ensureOnePrimary(applianceId, rest[0].id)
      await refresh()
    }

    // ---------- אחריות מורחבת ומסמכים ----------

    /** אחריות מורחבת (F11, FR-3.3); עם תעודה → נשמרת גם כמסמך. certificate: { type, file } */
    async function setExtendedWarranty(applianceId, extended, certificate) {
      let certificateId = extended?.certificateId ?? null
      if (certificate?.file) {
        const doc = await uploadDocument({
          spaceId: spaceOfAppliance(applianceId),
          applianceId,
          type: 'warranty',
          file: certificate.file,
        })
        certificateId = doc.id
      }
      if (extended) await writeExtended(applianceId, { ...extended, certificateId })
      else must(await supabase.from('extended_warranties').delete().eq('appliance_id', applianceId))
      await refresh()
    }

    /** document: { type, file } */
    async function addDocument(applianceId, document) {
      await uploadDocument({ spaceId: spaceOfAppliance(applianceId), applianceId, type: document.type, file: document.file })
      await refresh()
    }

    /** «החלפת קובץ»: אותו נתיב, קובץ חדש */
    async function replaceDocument(applianceId, documentId, changes) {
      const doc = applianceById(applianceId)?.documents.find((item) => item.id === documentId)
      if (!doc || !changes.file) return
      must(
        await supabase.storage
          .from('documents')
          .update(doc.storagePath, changes.file, { contentType: changes.file.type, upsert: true }),
      )
      must(
        await supabase
          .from('documents')
          .update({
            file_name: changes.file.name || doc.fileName,
            mime_type: changes.file.type || doc.mimeType,
            size_bytes: changes.file.size,
          })
          .eq('id', documentId),
      )
      await refresh()
    }

    async function deleteDocument(applianceId, documentId) {
      const doc = applianceById(applianceId)?.documents.find((item) => item.id === documentId)
      must(await supabase.from('documents').delete().eq('id', documentId))
      if (doc?.storagePath) await removeStoredFiles([doc.storagePath]).catch(() => {})
      await refresh()
    }

    // ---------- סריקה (הקובץ נשאר בדפדפן עד השמירה) ----------

    // הקריאה האמיתית והמכסה נספרות בשרת (שלב 8.5); עד אז הסריקה מדומה ולא נספרת
    function recordScan() {}

    /** extra (חשבונית שהועברה במייל, FR-9.3): { inboxId, result } → ישר לבדיקה · { inboxId, lines } → בחירת מוצר */
    function startScan(file, source, extra = {}) {
      if (scan?.url) URL.revokeObjectURL(scan.url)
      setScan({ file, source, url: URL.createObjectURL(file), ...extra })
    }

    function clearScan() {
      if (scan?.url) URL.revokeObjectURL(scan.url)
      setScan(null)
    }

    /** חשבונית עם כמה מוצרים: השורות שנשארו, כדי להוסיף אותן בלי סריקה נוספת (FR-2.6) */
    function keepScanLines(lines) {
      setScan((previous) => (previous ? { ...previous, lines } : previous))
    }

    // ---------- התראות (FR-5.6): הסימון נשמר לכל חבר בנפרד ----------

    async function markNotificationsRead(ids) {
      if (ids.length === 0) return
      must(
        await supabase
          .from('notification_reads')
          .upsert(
            ids.map((id) => ({ notification_id: id })),
            { onConflict: 'notification_id,user_id', ignoreDuplicates: true },
          ),
      )
      await refresh()
    }

    // ---------- חברים והזמנות (FR-1.5, FR-1.7). המגבלות נאכפות גם בשרת ----------

    // מגבלות המרחב לפי התוכנית של יוצר המרחב (FR-1.5, FR-6.4). הזמנה שפג תוקפה לא נספרת
    const ownerPlan = activeSpace
      ? findById(PLANS, state.spacePlans[activeSpace.id]) ?? findById(PLANS, 'free')
      : null
    const validInvites = activeSpace
      ? activeSpace.invites.filter((invite) => parseISODate(invite.expiresAt) >= today())
      : []
    const invitedCount = activeSpace
      ? activeSpace.members.filter((member) => member.userId !== activeSpace.ownerId).length + validInvites.length
      : 0
    const propertyRules = ownerPlan
      ? { limit: ownerPlan.properties, limitReached: properties.length >= ownerPlan.properties }
      : null
    const inviteRules = ownerPlan
      ? {
          viewerOnly: ownerPlan.viewerOnly,
          limitReached: ownerPlan.invitees !== null && invitedCount >= ownerPlan.invitees,
        }
      : null

    /** קוד הזמנה חדש, עם ההרשאה שנבחרה לפני יצירתו, בתוקף 7 ימים (M2). הקוד נוצר בשרת */
    async function inviteMember(role) {
      const row = must(
        await supabase.from('invites').insert({ space_id: activeSpace.id, role }).select().single(),
      )
      await refresh()
      return { id: row.id, name: '', role: row.role, code: row.code, invitedBy: row.invited_by, expiresAt: row.expires_at.slice(0, 10) }
    }

    async function cancelInvite(inviteId) {
      must(await supabase.from('invites').delete().eq('id', inviteId))
      await refresh()
    }

    async function changeMemberRole(memberId, nextRole) {
      if (memberId === activeSpace.ownerId) return
      must(
        await supabase
          .from('space_members')
          .update({ role: nextRole })
          .eq('space_id', activeSpace.id)
          .eq('user_id', memberId),
      )
      await refresh()
    }

    async function removeMember(memberId) {
      if (memberId === activeSpace.ownerId) return
      must(await supabase.from('space_members').delete().eq('space_id', activeSpace.id).eq('user_id', memberId))
      await refresh()
    }

    /** עזיבת המרחב (M5). השרת מודיע לשאר החברים; המרחב הפעיל עובר למרחב אחר, אם יש */
    async function leaveSpace() {
      const next = spaces.find((space) => space.id !== activeSpace.id)
      must(await supabase.from('space_members').delete().eq('space_id', activeSpace.id).eq('user_id', userId))
      await setActiveSpaceId(next?.id ?? null)
      await refresh()
    }

    // ---------- נכסים (FR-7) ----------

    /** בחירת נכס בסינון: מזהה נכס או 'all'. נשמר לכל חבר בנפרד (FR-7.4) */
    async function setActiveProperty(propertyId) {
      setLoaded((previous) => ({
        ...previous,
        data: {
          ...previous.data,
          activePropertyBySpace: { ...previous.data.activePropertyBySpace, [activeSpace.id]: propertyId },
        },
      }))
      must(
        await supabase
          .from('space_members')
          .update({ active_property_id: propertyId === 'all' ? null : propertyId })
          .eq('space_id', activeSpace.id)
          .eq('user_id', userId),
      )
    }

    async function addProperty(name) {
      const row = must(
        await supabase.from('properties').insert({ space_id: activeSpace.id, name: name.trim() }).select('id').single(),
      )
      await refresh()
      return row.id
    }

    async function renameProperty(propertyId, name) {
      must(await supabase.from('properties').update({ name: name.trim() }).eq('id', propertyId))
      await refresh()
    }

    /** מחיקה: רק נכס בלי מוצרים, ורק כשיש יותר מנכס אחד (FR-7.2, נאכף גם בשרת) */
    async function deleteProperty(propertyId) {
      if (properties.length <= 1 || appliances.some((item) => propertyOf(item) === propertyId)) return
      must(await supabase.from('properties').delete().eq('id', propertyId))
      if (activePropertyId === propertyId) await setActiveProperty('all')
      await refresh()
    }

    // ---------- העברת חשבוניות במייל (FR-9) ----------

    async function regenerateForwardingAddress() {
      must(await supabase.rpc('regenerate_forwarding_address', { p_space_id: activeSpace.id }))
      await refresh()
    }

    async function removeInboxItem(itemId) {
      must(await supabase.from('inbox_items').delete().eq('id', itemId))
      await refresh()
    }

    // ---------- פרופיל, חשבון ותוכנית ----------

    async function updateProfile(changes) {
      const columns = {}
      if ('firstName' in changes) columns.first_name = changes.firstName.trim()
      if ('lastName' in changes) columns.last_name = changes.lastName.trim()
      if ('phone' in changes) columns.phone = changes.phone.trim() || null
      if (changes.reminders) {
        columns.reminder_90 = changes.reminders.d90
        columns.reminder_30 = changes.reminders.d30
        columns.reminder_7 = changes.reminders.d7
      }
      must(await supabase.from('profiles').update(columns).eq('id', userId))
      await refresh()
    }

    /** מחיקת החשבון (P6): הכול נמחק בשרשרת בשרת, כולל המרחבים שהמשתמש יצר */
    async function deleteAccount() {
      const paths = state.spaces
        .filter((space) => space.ownerId === userId)
        .flatMap((space) =>
          state.appliances
            .filter((item) => item.spaceId === space.id)
            .flatMap((item) => item.documents.map((doc) => doc.storagePath).filter(Boolean)),
        )
      await removeStoredFiles(paths).catch(() => {})
      must(await supabase.rpc('delete_my_account'))
      await supabase.auth.signOut()
    }

    /** מעבר לתוכנית (P11). ⚠️ תשלום מדומה עד שיהיה ספק תשלומים */
    async function changePlan(planId, billing) {
      must(await supabase.rpc('change_plan', { p_plan_id: planId, p_billing: billing }))
      await refresh()
    }

    /** ביטול המנוי (P12): פעיל עוד 3 ימי עסקים, ואז חינם. שום דבר לא נמחק */
    async function cancelSubscription() {
      must(await supabase.rpc('cancel_subscription'))
      await refresh()
    }

    async function resumeSubscription() {
      must(await supabase.rpc('resume_subscription'))
      await refresh()
    }

    // מכסת הסריקות לפי התוכנית של מי שסורק, ומתחדשת ב־1 בחודש (PRD §6, FR-6.4)
    const plan = effectivePlan(user)
    const now = today()
    const used = user?.scansUsed ?? 0
    const scanQuota = {
      used,
      limit: plan.scans,
      remaining: Math.max(0, plan.scans - used),
      renewsOn: addMonths(new Date(now.getFullYear(), now.getMonth(), 1), 1),
    }

    const subscription = {
      plan,
      billing: plan.id === 'free' ? null : user?.billing ?? null,
      renewsOn: plan.id === 'free' ? null : parseISODate(user?.renewsAt),
      cancelOn: plan.id === 'free' ? null : parseISODate(user?.cancelAt),
    }

    // שימוש במרחב הפעיל מול המגבלות של יוצר המרחב (P9)
    const spaceLimits = activeSpace
      ? { plan: ownerPlan, isOwner: activeSpace.ownerId === userId, properties: properties.length, invited: invitedCount }
      : null

    return {
      ready,
      loadError,
      refresh,
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
      loading: !ready || switching,
      scan,
      scanQuota,
      subscription,
      spaceLimits,
      inviteRules,
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
      deleteAccount,
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
  }, [state, ready, loadError, switching, scan, refresh])

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export default AppDataProvider
