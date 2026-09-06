import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/app-layout'
import Login from './pages/login'
import Signup from './pages/signup'
import Dashboard from './pages/dashboard'
import Inventory from './pages/inventory'
import Prescriptions from './pages/prescriptions'
import Patients from './pages/patients'
import Analytics from './pages/analytics'
import Settings from './pages/settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
