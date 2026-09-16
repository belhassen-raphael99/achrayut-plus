import { Component } from 'react'
import Logo from '../../ui/Logo/Logo.jsx'
import Container from '../Container/Container.jsx'
import ServerErrorPage from '../../../pages/system/ServerErrorPage.jsx'
import '../SystemLayout/SystemLayout.css'

/**
 * כשרכיב נכשל בזמן ההצגה, מוצג «משהו השתבש אצלנו» (E2) במקום מסך לבן.
 * בלי פרטים טכניים למשתמש; הפרטים נרשמים בקונסול בזמן הפיתוח.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <div className="system-layout">
        <header className="system-layout__header">
          <Container>
            <Logo />
          </Container>
        </header>
        <main id="content" className="system-layout__main" tabIndex={-1}>
          <ServerErrorPage />
        </main>
      </div>
    )
  }
}

export default ErrorBoundary
