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
      case 'trip_completed': return '✅'
      case 'maintenance': return '🔧'
      case 'vehicle_added': return '🚛'
      default: return '📋'
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
            <div className="stat-icon">🚛</div>
            <div className="stat-content">
              <h3>{stats.activeFleet}</h3>
              <p>Active Fleet</p>
              <span className="stat-label">Vehicles on trip</span>
            </div>
          </div>

          <div className="stat-card stat-alert">
            <div className="stat-icon">🔧</div>
            <div className="stat-content">
              <h3>{stats.maintenanceAlerts}</h3>
              <p>Maintenance Alerts</p>
              <span className="stat-label">In shop</span>
            </div>
          </div>

          <div className="stat-card stat-utilization">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{stats.utilizationRate}%</h3>
              <p>Utilization Rate</p>
              <span className="stat-label">Fleet efficiency</span>
            </div>
          </div>

          <div className="stat-card stat-pending">
            <div className="stat-icon">📦</div>
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
