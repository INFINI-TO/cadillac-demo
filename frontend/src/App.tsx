import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './components/LoginPage'
import { AppSession } from './components/AppSession'
import { PageTracking } from './components/PageTracking'

function App() {
  return (
    <BrowserRouter>
      <PageTracking />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/app" element={<AppSession />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
