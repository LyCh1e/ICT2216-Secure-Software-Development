import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import PatientPortal from './pages/PatientPortal'
import AdminPortal from './pages/AdminPortal'
import ResearcherPortal from './pages/ResearcherPortal'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/patient" element={<PatientPortal />} />
      <Route path="/admin" element={<AdminPortal />} />
      <Route path="/researcher" element={<ResearcherPortal />} />
    </Routes>
  )
}
