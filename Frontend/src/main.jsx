import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import './index.css';
import { PresenceProvider } from './context/PresenceContext.jsx';
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    <PresenceProvider>
      <App />
    </PresenceProvider>
    </BrowserRouter>
  </React.StrictMode>
)
