import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authService.login(email, password)

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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="rbac-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            RBAC Active: Role-based access controls are enforced
          </div>

          <div className="register-link">
            <p>
              Don't have an account? 
              <button 
                type="button"
                onClick={() => navigate('/register')}
                className="link-btn"
              >
                Register here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
