import React from 'react'
import AppRoutes from './routes/AppRoutes'
import NetworkStatus from './components/ui/NetworkStatus'

const App = () => {
  return (
    <>
      <NetworkStatus />
      <AppRoutes />
    </>
  )
}

export default App
