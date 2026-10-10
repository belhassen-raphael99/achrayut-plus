/*
 * הקריאות ל־Supabase של האפליקציה (שלב 8.4).
 * load() מביא את כל מה שהמשתמש רשאי לראות (ה־RLS מסנן בשרת) וממיר לצורה שהמסכים הכירו בשלב 6,
 * כדי שהמסכים לא ישתנו. כל פעולה כותבת לשרת, ואחריה AppDataProvider טוען מחדש.
 */
import { callFunction, supabase } from '../lib/supabase.js'

// במסד: קו תחתון (small_kitchen); בקוד ובממשק: מקף (small-kitchen)
export const toDb = (value) => (value ? value.replaceAll('-', '_') : value)
export const fromDb = (value) => (value ? value.replaceAll('_', '-') : value)

/** זורק את השגיאה של Supabase, כדי שהמסך שקרא לפעולה ידע שהיא נכשלה */
export function must({ data, error }) {
  if (error) throw error
  return data
}

const isoDate = (value) => (value ? value.slice(0, 10) : null)

function mapContact(row) {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    phone: row.phone ?? '',
    email: row.email ?? '',
    website: row.website ?? '',
    note: row.note ?? '',
    primary: row.is_primary,
  }
}

function mapDocument(row) {
  return {
    id: row.id,
    type: row.type,
    uploadedAt: isoDate(row.updated_at ?? row.created_at),
    sizeBytes: row.size_bytes,
    fileName: row.file_name,
    mimeType: row.mime_type,
    storagePath: row.storage_path,
  }
}

function mapAppliance(row) {
  // קשר 1 ל־0..1: PostgREST מחזיר אובייקט או מערך, לפי הגרסה
  const extended = Array.isArray(row.extended_warranties) ? row.extended_warranties[0] : row.extended_warranties
  return {
    id: row.id,
    spaceId: row.space_id,
    propertyId: row.property_id,
    name: row.name,
    category: fromDb(row.category),
    room: fromDb(row.room),
    brand: row.brand ?? '',
    model: row.model ?? '',
    serial: row.serial ?? '',
    purchaseDate: row.purchase_date,
    warrantyMonths: row.warranty_months,
    warrantySource: row.warranty_source,
    extended: extended
      ? {
          provider: extended.provider,
          start: extended.start_date,
          end: extended.end_date,
          source: extended.source,
          certificateId: extended.certificate_document_id,
        }
      : null,
    contacts: (row.contacts ?? []).map(mapContact),
    documents: (row.documents ?? [])
      .map(mapDocument)
      .sort((a, b) => (a.uploadedAt ?? '').localeCompare(b.uploadedAt ?? '')),
    addedAt: row.created_at,
  }
}

function mapInvite(row) {
  return {
    id: row.id,
    name: '',
    role: row.role,
    code: row.code,
    invitedBy: row.invited_by,
    expiresAt: isoDate(row.expires_at),
  }
}

function mapInboxItem(row) {
  return {
    id: row.id,
    fileName: row.file_name,
    senderId: row.sender_id,
    receivedAt: row.created_at,
    status: row.status,
    reading: row.mime_type === 'application/pdf' ? 'pdf' : 'invoice',
  }
}

/** תחילת החודש הנוכחי: מכסת הסריקות מתחדשת ב־1 בחודש (FR-2.3) */
function monthStartISO() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

/**
 * כל הנתונים של המשתמש המחובר, בצורה של שלב 6:
 * { users, spaces, appliances, notifications, plans, spacePlans, activeSpaceId, activePropertyBySpace }
 */
/*
 * מיד אחרי ההתחברות, השעון של שרת ההתחברות יכול להקדים בכמה שניות את השעון של מסד הנתונים,
 * ו־PostgREST דוחה את הטוקן החדש («JWT issued at future», PGRST303). זו תקלה חולפת: מנסים שוב.
 */
const RETRYABLE = new Set(['PGRST303'])
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function loadAll(authUser, attempt = 0) {
  try {
    return await loadAllOnce(authUser)
  } catch (error) {
    if (!RETRYABLE.has(error?.code) || attempt >= 3) throw error
    await wait(1500 * (attempt + 1))
    return loadAll(authUser, attempt + 1)
  }
}

async function loadAllOnce(authUser) {
  const userId = authUser.id

  const [
    profile,
    subscription,
    plans,
    spaces,
    members,
    properties,
    invites,
    appliances,
    notifications,
    reads,
    spacePlans,
    scans,
    inbox,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single().then(must),
    supabase.from('subscriptions').select('*').eq('user_id', userId).single().then(must),
    supabase.from('plans').select('*').order('rank').then(must),
    supabase.from('spaces').select('*').order('created_at').then(must),
    supabase.from('space_members').select('*').order('joined_at').then(must),
    supabase.from('properties').select('*').order('created_at').then(must),
    supabase.from('invites').select('*').order('created_at').then(must),
    supabase
      .from('appliances')
      .select('*, extended_warranties(*), contacts(*), documents!documents_appliance_id_fkey(*)')
      .order('created_at')
      .then(must),
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(200).then(must),
    supabase.from('notification_reads').select('notification_id').eq('user_id', userId).then(must),
    supabase.rpc('my_space_plans').then(must),
    supabase
      .from('scans')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'succeeded')
      .gte('created_at', monthStartISO()),
    supabase.from('inbox_items').select('*').order('created_at', { ascending: false }).then(must),
  ])

  // שמות החברים בכל מרחב (profiles של אחרים סגורה ב־RLS; ה־RPC מחזיר שם בלבד)
  const people = await Promise.all(
    spaces.map((space) => supabase.rpc('get_space_members', { p_space_id: space.id }).then(must)),
  )

  const users = {}
  people.flat().forEach((person) => {
    users[person.user_id] = { id: person.user_id, firstName: person.first_name, lastName: person.last_name }
  })

  const providers = authUser.app_metadata?.providers ?? []
  users[userId] = {
    ...users[userId],
    id: userId,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: authUser.email ?? '',
    phone: profile.phone ?? '',
    googleConnected: providers.includes('google'),
    reminders: { d90: profile.reminder_90, d30: profile.reminder_30, d7: profile.reminder_7 },
    plan: subscription.plan_id,
    billing: subscription.billing,
    renewsAt: subscription.renews_at,
    cancelAt: subscription.cancel_at,
    scansUsed: scans.count ?? 0,
  }

  const readIds = new Set(reads.map((row) => row.notification_id))
  const activePropertyBySpace = {}

  return {
    userId,
    users,
    plans,
    spacePlans: Object.fromEntries(spacePlans.map((row) => [row.space_id, row.plan_id])),
    activeSpaceId: profile.active_space_id,
    spaces: spaces.map((space) => {
      const own = members.find((row) => row.space_id === space.id && row.user_id === userId)
      activePropertyBySpace[space.id] = own?.active_property_id ?? 'all'
      return {
        id: space.id,
        name: space.name,
        type: space.type,
        ownerId: space.owner_id,
        members: members
          .filter((row) => row.space_id === space.id)
          .map((row) => ({ userId: row.user_id, role: row.role, joinedAt: row.joined_at })),
        invites: invites.filter((row) => row.space_id === space.id).map(mapInvite),
        properties: properties
          .filter((row) => row.space_id === space.id)
          .map((row) => ({ id: row.id, name: row.name })),
        forwarding: { local: space.forwarding_local },
        inbox: inbox.filter((row) => row.space_id === space.id).map(mapInboxItem),
      }
    }),
    activePropertyBySpace,
    appliances: appliances.map(mapAppliance),
    notifications: notifications.map((row) => ({
      id: row.id,
      spaceId: row.space_id,
      kind: row.kind,
      tone: row.tone,
      text: row.text,
      createdAt: row.created_at,
      target: row.target_path,
      actorId: row.actor_id,
      recipientId: row.recipient_id,
      applianceId: row.appliance_id,
      readBy: readIds.has(row.id) ? [userId] : [],
    })),
  }
}

// ---------- מסמכים ב־Storage (docs/07 §8): דלי פרטי, קישור חתום ל־5 דקות ----------

const BUCKET = 'documents'

/** מעלה קובץ למסמך של מוצר ומחזיר את השורה במסד. documentId נקבע כאן כי הוא חלק מהנתיב */
export async function uploadDocument({ spaceId, applianceId, type, file }) {
  const id = crypto.randomUUID()
  const storagePath = `${spaceId}/${applianceId}/${id}`
  must(await supabase.storage.from(BUCKET).upload(storagePath, file, { contentType: file.type }))
  return must(
    await supabase
      .from('documents')
      .insert({
        id,
        appliance_id: applianceId,
        type,
        storage_path: storagePath,
        file_name: file.name || 'document',
        mime_type: file.type || 'application/octet-stream',
        size_bytes: file.size,
      })
      .select()
      .single(),
  )
}

export async function removeStoredFiles(paths) {
  if (paths.length > 0) must(await supabase.storage.from(BUCKET).remove(paths))
}

/** קישור זמני לצפייה או הורדה (5 דקות, כמו במדיניות הפרטיות). download: שם קובץ → הורדה במקום פתיחה */
export async function signedDocumentUrl(storagePath, download) {
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 300, download ? { download } : undefined)
  return data?.signedUrl ?? null
}

// ---------- קריאת החשבונית (FR-2.3, FR-2.4) ----------
// הקובץ עולה לדלי הזמני scans, ו־Edge Function קוראת אותו מול Claude:
// המפתח של Claude לא מגיע לדפדפן, והמכסה נבדקת בשרת. הדלי מתנקה בסוף הקריאה.

const SCAN_BUCKET = 'scans'
const SCAN_TIMEOUT_MS = 30000 // «הקריאה נקטעת אחרי 30 שניות» (FR-2.4)
const MAX_IMAGE_EDGE = 1568 // מעבר לזה המודל ממילא מקטין; ההעלאה מהירה יותר

// בקוד: invoice (צילום) · במסד: photo
const SCAN_SOURCE = { invoice: 'photo', pdf: 'pdf', label: 'label' }

/** מקטין תמונה ל־JPEG לפני ההעלאה. דפדפן שלא יודע לפענח את הקובץ → שולחים אותו כמו שהוא */
async function shrinkImage(file) {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
    return blob ?? file
  } catch {
    return file
  }
}

/**
 * שולח את הקובץ לקריאה ומחזיר { status, items }.
 * status: succeeded · unreadable (N7) · unavailable (N9, לא נספר) · quota (N10) · forbidden.
 * signal: «ביטול» במסך הקריאה.
 */
export async function analyseScan({ file, source, spaceId, signal }) {
  const { data } = await supabase.auth.getSession()
  const userId = data.session?.user?.id
  if (!userId) return { status: 'unavailable' }

  const scanId = crypto.randomUUID()
  const upload = source === 'pdf' ? file : await shrinkImage(file)
  const uploaded = await supabase.storage
    .from(SCAN_BUCKET)
    .upload(`${userId}/${scanId}`, upload, { contentType: upload.type || file.type })
  if (uploaded.error) return { status: 'unavailable' }

  const controller = new AbortController()
  const stop = setTimeout(() => controller.abort(), SCAN_TIMEOUT_MS)
  const cancel = () => controller.abort()
  signal?.addEventListener('abort', cancel)

  try {
    const response = await callFunction(
      'scan-invoice',
      { scanId, spaceId, source: SCAN_SOURCE[source] ?? 'photo', mimeType: upload.type || file.type },
      controller.signal,
    )
    const body = await response.json().catch(() => ({}))
    if (response.ok) return { status: body.status ?? 'unreadable', items: body.items ?? [] }
    return { status: body.reason === 'quota' || body.reason === 'forbidden' ? body.reason : 'unavailable' }
  } catch {
    // כולל ביטול של המשתמש ועצירה אחרי 30 שניות
    return { status: 'unavailable' }
  } finally {
    clearTimeout(stop)
    signal?.removeEventListener('abort', cancel)
  }
}
