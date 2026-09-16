import './AuthCard.css'

/** הכרטיס הלבן של עמודי ההתחברות. title → h1 של העמוד; בלי title, ה־h1 בא מהתוכן */
function AuthCard({ title, children }) {
  return (
    <section className="auth-card" aria-labelledby={title ? 'auth-card-title' : undefined}>
      {title && (
        <h1 id="auth-card-title" className="auth-card__title">
          {title}
        </h1>
      )}
      {children}
    </section>
  )
}

export default AuthCard
