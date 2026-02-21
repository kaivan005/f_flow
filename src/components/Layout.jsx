import { Link, useNavigate, useLocation } from 'react-router-dom'
import './Layout.css'

function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const userRole = localStorage.getItem('role')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/vehicles', label: 'Vehicles', icon: '🚛' },
    { path: '/trips', label: 'Trips', icon: '🗺️', roles: ['manager', 'dispatcher'] },
    { path: '/maintenance', label: 'Maintenance', icon: '🔧' },
    { path: '/expenses', label: 'Expenses', icon: '💰' },
    { path: '/drivers', label: 'Drivers', icon: '👤' },
    { path: '/analytics', label: 'Analytics', icon: '📈', roles: ['manager'] },
  ]

  const filteredNav = navItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  )

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">FleetFlow</h1>
          <span className="role-badge">{userRole}</span>
        </div>
        
        <nav className="nav">
          {filteredNav.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
      </aside>
      
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout
