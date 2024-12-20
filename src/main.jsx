import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './styles.css'
import App from './App.jsx'
import AuthProvider from './auth/AuthProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter basename="/anitrack-app">
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
)