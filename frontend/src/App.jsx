import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import PatientPortal from './pages/PatientPortal'
import AdminPortal from './pages/AdminPortal'
import ResearcherPortal from './pages/ResearcherPortal'
import Faq from './pages/Faq'
import Privacy from './pages/Privacy'
import Researchers from './pages/Researchers'
import Trials from './pages/Trials'
import VerifyEmail from './pages/VerifyEmail'

function ProtectedRoute({ role, children }) {
  const { auth } = useAuth()
  if (!auth) return <Navigate to="/login" replace />
  if (role && auth.role !== role) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/researchers" element={<Researchers />} />
        <Route path="/trials" element={<Trials />} />
        <Route path="/patient" element={
          <ProtectedRoute role="participant"><PatientPortal /></ProtectedRoute>
        } />
        <Route path="/researcher" element={
          <ProtectedRoute role="researcher"><ResearcherPortal /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminPortal /></ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}
