import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'

// גופן מתארח בפרויקט (DESIGN.md §3): Assistant במשקלים 200/400/600/700
import '@fontsource/assistant/200.css'
import '@fontsource/assistant/400.css'
import '@fontsource/assistant/600.css'
import '@fontsource/assistant/700.css'

// משתני העיצוב והבסיס
import './styles/globals.css'

import AuthProvider from './data/AuthProvider.jsx'
import AppDataProvider from './data/AppDataProvider.jsx'
import ErrorBoundary from './components/layout/ErrorBoundary/ErrorBoundary.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <AppDataProvider>
            <App />
          </AppDataProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
)
