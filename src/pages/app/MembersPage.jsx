import { useState } from 'react'
import { useNavigate } from 'react-router'
import AppPage from '../../components/layout/AppPage/AppPage.jsx'
import PageHeader from '../../components/layout/PageHeader/PageHeader.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import Dialog from '../../components/ui/Dialog/Dialog.jsx'
import TextButton from '../../components/ui/TextButton/TextButton.jsx'
import Toast from '../../components/ui/Toast/Toast.jsx'
import MemberRow from '../../components/app/MemberRow/MemberRow.jsx'
import InviteSheet from '../../components/app/InviteSheet/InviteSheet.jsx'
import ManageMemberSheet from '../../components/app/ManageMemberSheet/ManageMemberSheet.jsx'
import { useAppData } from '../../data/useAppData.js'
import { ROLES, findById } from '../../data/lists.js'
import { parseISODate } from '../../utils/dates.js'
import { formatDate } from '../../utils/format.js'
import { formatInviteCode } from '../../utils/inviteCode.js'
import { fullName } from '../../utils/text.js'
import './AppPages.css'

/**
 * חברי המרחב (M1–M5 · FR-1.5–1.7). גישה מלאה: הזמנה, שינוי הרשאה והסרה, עם אישור.
 * צפייה בלבד: רואים את הרשימה, בלי פעולות על אחרים. כל חבר מלבד יוצר המרחב יכול לעזוב.
 */
function MembersPage() {
  const navigate = useNavigate()
  const {
    user,
    users,
    activeSpace,
    isViewer,
    inviteRules,
    inviteMember,
    changeMemberRole,
    removeMember,
    leaveSpace,
  } = useAppData()
  const [sheet, setSheet] = useState({ kind: null, open: false, key: 0 })
  const [confirm, setConfirm] = useState(null)
  const [toast, setToast] = useState(null)

  const isOwner = activeSpace.ownerId === user.id

  function openSheet(kind, extra = {}) {
    setSheet((previous) => ({ kind, open: true, key: previous.key + 1, ...extra }))
  }

  function closeSheet() {
    setSheet((previous) => ({ ...previous, open: false }))
  }

  // ניסוח בלי מין (docs/07 §10), כמו «מסכימ/ה» בהרשמה
  async function confirmAction() {
    const { kind, member } = confirm
    setConfirm(null)
    try {
      if (kind === 'role') {
        await changeMemberRole(member.id, member.nextRole)
        setToast('ההרשאה עודכנה')
      } else if (kind === 'remove') {
        await removeMember(member.id)
        setToast(`${fullName(member.person)} הוסר/ה מהמרחב`)
      } else if (kind === 'leave') {
        await leaveSpace()
        navigate('/dashboard', { replace: true })
      }
    } catch (error) {
      console.error('הפעולה נכשלה', error)
      setToast('לא הצלחנו לעדכן כרגע. אפשר לנסות שוב.')
    }
  }

  const managed = sheet.member

  return (
    <AppPage width="reading">
      <title>חברי המרחב · אחריות+</title>
      <PageHeader title="חברי המרחב" subtitle={<bdi>{activeSpace.name}</bdi>} back="/settings" />

      <ul className="members__list">
        {activeSpace.members.map((member) => {
          const person = users[member.userId]
          const self = member.userId === user.id
          const owner = member.userId === activeSpace.ownerId
          return (
            <li key={member.userId}>
              <MemberRow
                name={`${fullName(person)}${self ? ' (אני)' : ''}`}
                avatarName={person.firstName}
                roleLabel={findById(ROLES, member.role)?.label}
                detail={owner ? 'יצר/ה את המרחב' : undefined}
                onManage={
                  !isViewer && !self && !owner
                    ? () => openSheet('manage', { member: { id: member.userId, role: member.role, person } })
                    : undefined
                }
              />
            </li>
          )
        })}
        {activeSpace.invites.map((invite) => (
          <li key={invite.id}>
            <MemberRow
              name={invite.name || `קוד ${formatInviteCode(invite.code)}`}
              avatarName={invite.name || '+'}
              roleLabel={findById(ROLES, invite.role)?.label}
              detail={`הזמנה ממתינה · בתוקף עד ${formatDate(parseISODate(invite.expiresAt))}`}
            />
          </li>
        ))}
      </ul>

      <p className="members__info">
        גישה מלאה: הוספה, עריכה ומחיקה של מוצרים. צפייה בלבד: צפייה במוצרים, במסמכים ובאנשי הקשר.
      </p>

      <div className="members__actions">
        {!isViewer && (
          <Button variant="primary" icon="person_add" fullWidth aria-haspopup="dialog" onClick={() => openSheet('invite')}>
            הזמנה למרחב
          </Button>
        )}
        {!isOwner && (
          <TextButton
            className="text-button--danger"
            aria-haspopup="dialog"
            onClick={() => setConfirm({ kind: 'leave' })}
          >
            עזיבת המרחב
          </TextButton>
        )}
      </div>

      {sheet.kind === 'invite' && (
        <InviteSheet
          key={sheet.key}
          open={sheet.open}
          onClose={closeSheet}
          spaceName={activeSpace.name}
          rules={inviteRules}
          onCreate={inviteMember}
          onMessage={setToast}
        />
      )}
      {sheet.kind === 'manage' && managed && (
        <ManageMemberSheet
          key={sheet.key}
          open={sheet.open}
          onClose={closeSheet}
          name={fullName(managed.person)}
          role={managed.role}
          viewerOnly={inviteRules.viewerOnly}
          onChangeRole={(nextRole) => {
            closeSheet()
            setConfirm({ kind: 'role', member: { ...managed, nextRole } })
          }}
          onRemove={() => {
            closeSheet()
            setConfirm({ kind: 'remove', member: managed })
          }}
        />
      )}

      <Dialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        title={
          confirm?.kind === 'leave' ? (
            <>
              לעזוב את המרחב <bdi>{activeSpace.name}</bdi>?
            </>
          ) : confirm?.kind === 'remove' ? (
            <>
              להסיר את <bdi>{fullName(confirm.member.person)}</bdi> מהמרחב?
            </>
          ) : confirm?.kind === 'role' ? (
            <>
              לשנות את ההרשאה של <bdi>{fullName(confirm.member.person)}</bdi>?
            </>
          ) : (
            ''
          )
        }
        actions={
          <>
            <Button variant={confirm?.kind === 'role' ? 'primary' : 'danger'} fullWidth onClick={confirmAction}>
              {confirm?.kind === 'leave' ? 'עזיבה' : confirm?.kind === 'remove' ? 'הסרה' : 'שינוי ההרשאה'}
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setConfirm(null)}>
              ביטול
            </Button>
          </>
        }
      >
        {confirm?.kind === 'leave' && <p>כדי לחזור תצטרכו קוד הזמנה חדש.</p>}
        {confirm?.kind === 'remove' && (
          <p>
            אחרי ההסרה לא תהיה יותר גישה למוצרים ולמסמכים של{' '}
            <bdi>{activeSpace.name}</bdi>.
          </p>
        )}
        {confirm?.kind === 'role' && (
          <p>
            {findById(ROLES, confirm.member.nextRole)?.label}: {findById(ROLES, confirm.member.nextRole)?.description}
          </p>
        )}
      </Dialog>

      <Toast message={toast} onDone={() => setToast(null)} />
    </AppPage>
  )
}

export default MembersPage
