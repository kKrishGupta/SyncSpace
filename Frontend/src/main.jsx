import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { PresenceProvider } from './context/PresenceContext.jsx';
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <PresenceProvider>
        <App />
      </PresenceProvider>
    </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
