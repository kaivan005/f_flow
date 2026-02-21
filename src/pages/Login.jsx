import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('manager')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authService.login(email, password, role)

      if (response.success) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('role', response.role)
        localStorage.setItem('user', JSON.stringify(response.user))

        navigate('/dashboard')
      } else {
        setError(response.message || 'Login failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-badge">FleetFlow</div>
          <h1>Login & Authentication</h1>
          <p className="login-subtitle">Secure access for fleet management</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="role-selector">
            <label className={`role-option ${role === 'manager' ? 'active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="manager"
                checked={role === 'manager'}
                onChange={(e) => setRole(e.target.value)}
              />
              <div className="role-content">
                <span className="role-icon">👔</span>
                <span className="role-label">Manager</span>
              </div>
            </label>
            <label className={`role-option ${role === 'dispatcher' ? 'active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="dispatcher"
                checked={role === 'dispatcher'}
                onChange={(e) => setRole(e.target.value)}
              />
              <div className="role-content">
                <span className="role-icon">📋</span>
                <span className="role-label">Dispatcher</span>
              </div>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="manager@fleetflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember this device</span>
            </label>
            <button type="button" className="forgot-password">
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : `Sign in as ${role === 'manager' ? 'Manager' : 'Dispatcher'}`}
          </button>

          <div className="rbac-note">
            🔒 RBAC Active: Role-based access controls are enforced
          </div>

          <div className="demo-credentials">
            <p><strong>Demo Credentials:</strong></p>
            <p>Manager: manager@fleetflow.com / password123</p>
            <p>Dispatcher: dispatcher@fleetflow.com / password123</p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
