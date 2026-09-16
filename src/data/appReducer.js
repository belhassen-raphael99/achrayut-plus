// הפעולות על הנתונים המזויפים. כל פעולה מחזירה state חדש, בלי לשנות את הקודם.

export function appReducer(state, action) {
  switch (action.type) {
    case 'signIn':
      return { ...state, userId: action.userId, signedOut: false }

    // התנתקות: הסשן נגמר, וכניסה לעמודי האפליקציה מחזירה להתחברות (FR-1.9)
    case 'signOut':
      return { ...state, signedOut: true }

    case 'switchSpace':
      return withActiveSpace(state, action.spaceId)

    // הנכס שנבחר בסינון נשמר לכל משתמש בכל מרחב (FR-7.4)
    case 'setActiveProperty': {
      const byUser = state.activePropertyByUser ?? {}
      return {
        ...state,
        activePropertyByUser: {
          ...byUser,
          [state.userId]: { ...byUser[state.userId], [action.spaceId]: action.propertyId },
        },
      }
    }

    case 'createSpace':
      return withActiveSpace({ ...state, spaces: [...state.spaces, action.space] }, action.space.id)

    case 'joinSpace':
      return withActiveSpace(
        {
          ...state,
          spaces: state.spaces.map((space) =>
            space.id === action.spaceId
              ? {
                  ...space,
                  members: [...space.members, { userId: state.userId, role: action.role }],
                  invites: space.invites.filter((invite) => invite.id !== action.inviteId),
                }
              : space,
          ),
          notifications: [action.notification, ...state.notifications],
        },
        action.spaceId,
      )

    case 'addAppliance':
      return {
        ...state,
        appliances: [...state.appliances, action.appliance],
        notifications: [action.notification, ...state.notifications],
      }

    case 'updateAppliance':
      return {
        ...state,
        appliances: state.appliances.map((item) => (item.id === action.id ? { ...item, ...action.changes } : item)),
      }

    // המחיקה מוחקת גם את המסמכים, את התזכורות ואת ההתראות על המכשיר (FR-3.7)
    case 'deleteAppliance':
      return {
        ...state,
        appliances: state.appliances.filter((item) => item.id !== action.id),
        notifications: state.notifications.filter((item) => item.target !== `/appliances/${action.id}`),
      }

    // «נקראה» נשמר לכל חבר בנפרד (FR-5.6)
    case 'markNotificationsRead':
      return {
        ...state,
        notifications: state.notifications.map((item) =>
          action.ids.includes(item.id) && !item.readBy.includes(state.userId)
            ? { ...item, readBy: [...item.readBy, state.userId] }
            : item,
        ),
      }

    case 'addNotification':
      return { ...state, notifications: [action.notification, ...state.notifications] }

    case 'updateSpace':
      return {
        ...state,
        spaces: state.spaces.map((space) => (space.id === action.id ? { ...space, ...action.changes } : space)),
      }

    // מחיקת מרחב מוחקת את המכשירים, המסמכים וההתראות שלו לכל החברים (P5)
    case 'deleteSpace':
      return {
        ...state,
        spaces: state.spaces.filter((space) => space.id !== action.id),
        appliances: state.appliances.filter((item) => item.spaceId !== action.id),
        notifications: state.notifications.filter((item) => item.spaceId !== action.id),
      }

    case 'updateUser': {
      const user = state.users[state.userId]
      return { ...state, users: { ...state.users, [user.id]: { ...user, ...action.changes } } }
    }

    case 'reset':
      return action.state

    // רק קריאה מוצלחת נספרת במכסה (FR-2.3)
    case 'recordScan': {
      const user = state.users[state.userId]
      return { ...state, users: { ...state.users, [user.id]: { ...user, scansUsed: user.scansUsed + 1 } } }
    }

    default:
      return state
  }
}

/** המרחב הפעיל נשמר לכל משתמש בנפרד */
function withActiveSpace(state, spaceId) {
  return { ...state, activeSpaceByUser: { ...state.activeSpaceByUser, [state.userId]: spaceId } }
}
