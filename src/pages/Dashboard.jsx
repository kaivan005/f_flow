import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { dashboardService } from '../services'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    activeFleet: 0,
    maintenanceAlerts: 0,
    utilizationRate: 0,
    pendingCargo: 0,
    totalVehicles: 0,
    totalDrivers: 0,
    completedTrips: 0,
    totalRevenue: 0
  })
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getActivity()
      ])

      if (statsResponse.success) {
        setStats(statsResponse.data)
      }

      if (activityResponse.success) {
        setActivity(activityResponse.data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'trip_completed': 
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#48bb78" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
      case 'maintenance': 
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ed8936" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
      case 'vehicle_added': 
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4299e1" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
      default: 
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    }
  }

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Less than an hour ago'
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  if (loading) {
    return (
      <Layout>
        <div className="dashboard">
          <div className="loading">Loading dashboard...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="dashboard">
        <div className="page-header">
          <h1>Command Center</h1>
          <p className="page-subtitle">High-level fleet oversight at a glance</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-active">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.activeFleet}</h3>
              <p>Active Fleet</p>
              <span className="stat-label">Vehicles on trip</span>
            </div>
          </div>

          <div className="stat-card stat-alert">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.maintenanceAlerts}</h3>
              <p>Maintenance Alerts</p>
              <span className="stat-label">In shop</span>
            </div>
          </div>

          <div className="stat-card stat-utilization">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.utilizationRate}%</h3>
              <p>Utilization Rate</p>
              <span className="stat-label">Fleet efficiency</span>
            </div>
          </div>

          <div className="stat-card stat-pending">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>{stats.pendingCargo}</h3>
              <p>Pending Cargo</p>
              <span className="stat-label">Awaiting assignment</span>
            </div>
          </div>
        </div>

        <div className="secondary-stats">
          <div className="secondary-stat">
            <span className="secondary-label">Total Vehicles</span>
            <span className="secondary-value">{stats.totalVehicles}</span>
          </div>
          <div className="secondary-stat">
            <span className="secondary-label">Total Drivers</span>
            <span className="secondary-value">{stats.totalDrivers}</span>
          </div>
          <div className="secondary-stat">
            <span className="secondary-label">Completed Trips</span>
            <span className="secondary-value">{stats.completedTrips}</span>
          </div>
          <div className="secondary-stat">
            <span className="secondary-label">Total Revenue</span>
            <span className="secondary-value">${stats.totalRevenue.toLocaleString()}</span>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-section">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {activity.length > 0 ? (
                activity.map((item, index) => (
                  <div key={index} className="activity-item">
                    <span className="activity-icon">{getActivityIcon(item.type)}</span>
                    <div className="activity-details">
                      <p>{item.message}</p>
                      <span className="activity-time">{formatTimeAgo(item.timestamp)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No recent activity</p>
              )}
            </div>
          </div>

          <div className="dashboard-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <button className="action-btn">+ Create Trip</button>
              <button className="action-btn">+ Add Vehicle</button>
              <button className="action-btn">+ Register Driver</button>
              <button className="action-btn">📊 View Reports</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
