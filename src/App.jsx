import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import VehicleRegistry from './pages/VehicleRegistry'
import TripDispatcher from './pages/TripDispatcher'
import Maintenance from './pages/Maintenance'
import ExpenseFuel from './pages/ExpenseFuel'
import DriverManagement from './pages/DriverManagement'
import Analytics from './pages/Analytics'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/vehicles" element={
          <ProtectedRoute>
            <VehicleRegistry />
          </ProtectedRoute>
        } />
        
        <Route path="/trips" element={
          <ProtectedRoute>
            <TripDispatcher />
          </ProtectedRoute>
        } />
        
        <Route path="/maintenance" element={
          <ProtectedRoute>
            <Maintenance />
          </ProtectedRoute>
        } />
        
        <Route path="/expenses" element={
          <ProtectedRoute>
            <ExpenseFuel />
          </ProtectedRoute>
        } />
        
        <Route path="/drivers" element={
          <ProtectedRoute>
            <DriverManagement />
          </ProtectedRoute>
        } />
        
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App