import StateMessage from '../StateMessage/StateMessage.jsx'

/** מצב הצלחה אחרי שליחת טופס באתר (S7). הפוקוס עובר לכותרת, כדי שקורא מסך יכריז עליה */
function SuccessState({ title, children, action, titleAs = 'h2' }) {
  return (
    <StateMessage
      className="state-message--spacious"
      icon="check_circle"
      tone="success"
      title={title}
      titleAs={titleAs}
      actions={action}
      focusOnMount
    >
      {children}
    </StateMessage>
  )
}

export default SuccessState
