import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { dashboardService, vehicleService, expenseService } from '../services'
import './VehicleRegistry.css'
import './Analytics.css'

function Analytics() {
  const [stats, setStats] = useState({})
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('month')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [statsResponse, vehiclesResponse] = await Promise.all([
        dashboardService.getStats(),
        vehicleService.getAll()
      ])

      if (statsResponse.success) setStats(statsResponse.data)
      if (vehiclesResponse.success) setVehicles(vehiclesResponse.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getVehicleUtilization = () => {
    return vehicles.map(v => ({
      name: v.vehicle_name,
      status: v.status,
      utilization: v.status === 'On Trip' ? 100 : v.status === 'Available' ? 0 : 50
    }))
  }

  const getStatusDistribution = () => {
    const distribution = {
      'Available': 0,
      'On Trip': 0,
      'In Shop': 0,
      'Retired': 0
    }
    vehicles.forEach(v => {
      distribution[v.status] = (distribution[v.status] || 0) + 1
    })
    return distribution
  }

  const exportReport = () => {
    alert('Export functionality will generate CSV/PDF reports')
  }

  if (loading) {
    return (
      <Layout>
        <div className="vehicle-registry">
          <div className="loading">Loading analytics...</div>
        </div>
      </Layout>
    )
  }

  const statusDistribution = getStatusDistribution()
  const vehicleUtilization = getVehicleUtilization()

  return (
    <Layout>
      <div className="vehicle-registry">
        <div className="page-header">
          <div>
            <h1>Operational Analytics & Reports</h1>
            <p className="page-subtitle">Data-driven insights and exports</p>
          </div>
          <div style={{display: 'flex', gap: '1rem'}}>
            <select 
              className="date-range-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last Year</option>
            </select>
            <button className="primary-btn" onClick={exportReport}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export Report
            </button>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Fleet Overview</h3>
            <div className="metrics-grid">
              <div className="metric">
                <div className="metric-value">{stats.totalVehicles || 0}</div>
                <div className="metric-label">Total Vehicles</div>
              </div>
              <div className="metric">
                <div className="metric-value">{stats.activeFleet || 0}</div>
                <div className="metric-label">Active Fleet</div>
              </div>
              <div className="metric">
                <div className="metric-value">{stats.totalDrivers || 0}</div>
                <div className="metric-label">Total Drivers</div>
              </div>
              <div className="metric">
                <div className="metric-value">{stats.completedTrips || 0}</div>
                <div className="metric-label">Completed Trips</div>
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <h3>Financial Performance</h3>
            <div className="metrics-grid">
              <div className="metric">
                <div className="metric-value">${(stats.totalRevenue || 0).toLocaleString()}</div>
                <div className="metric-label">Total Revenue</div>
              </div>
              <div className="metric">
                <div className="metric-value">{stats.utilizationRate || 0}%</div>
                <div className="metric-label">Utilization Rate</div>
              </div>
              <div className="metric">
                <div className="metric-value">{stats.pendingCargo || 0}</div>
                <div className="metric-label">Pending Cargo</div>
              </div>
              <div className="metric">
                <div className="metric-value">{stats.maintenanceAlerts || 0}</div>
                <div className="metric-label">Maintenance Alerts</div>
              </div>
            </div>
          </div>

          <div className="analytics-card full-width">
            <h3>Vehicle Status Distribution</h3>
            <div className="chart-container">
              <div className="bar-chart">
                {Object.entries(statusDistribution).map(([status, count]) => (
                  <div key={status} className="bar-item">
                    <div className="bar-label">{status}</div>
                    <div className="bar-wrapper">
                      <div 
                        className={`bar bar-${status.toLowerCase().replace(' ', '-')}`}
                        style={{width: `${(count / vehicles.length * 100) || 0}%`}}
                      >
                        <span className="bar-value">{count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="analytics-card full-width">
            <h3>Vehicle Utilization</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vehicle Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Odometer (km)</th>
                    <th>Capacity (kg)</th>
                    <th>Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map(vehicle => (
                    <tr key={vehicle.vehicle_id}>
                      <td><strong>{vehicle.vehicle_name}</strong></td>
                      <td>{vehicle.vehicle_type}</td>
                      <td>
                        <span className={`status-badge status-${vehicle.status.toLowerCase().replace(' ', '-')}`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td>{vehicle.odometer_km.toLocaleString()}</td>
                      <td>{vehicle.max_capacity_kg.toLocaleString()}</td>
                      <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          <div style={{flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden'}}>
                            <div 
                              style={{
                                height: '100%', 
                                background: vehicle.status === 'On Trip' ? '#48bb78' : vehicle.status === 'Available' ? '#cbd5e0' : '#ed8936',
                                width: vehicle.status === 'On Trip' ? '100%' : vehicle.status === 'Available' ? '0%' : '50%'
                              }}
                            />
                          </div>
                          <span style={{fontSize: '0.85rem', fontWeight: '600', minWidth: '45px'}}>
                            {vehicle.status === 'On Trip' ? '100%' : vehicle.status === 'Available' ? '0%' : '50%'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="analytics-card">
            <h3>Performance Metrics</h3>
            <div className="performance-list">
              <div className="performance-item">
                <div className="performance-header">
                  <span className="performance-label">On-Time Delivery Rate</span>
                  <span className="performance-value">94.5%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '94.5%', background: '#48bb78'}}></div>
                </div>
              </div>
              <div className="performance-item">
                <div className="performance-header">
                  <span className="performance-label">Fleet Availability</span>
                  <span className="performance-value">{stats.utilizationRate || 0}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: `${stats.utilizationRate || 0}%`, background: '#667eea'}}></div>
                </div>
              </div>
              <div className="performance-item">
                <div className="performance-header">
                  <span className="performance-label">Maintenance Compliance</span>
                  <span className="performance-value">87.3%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '87.3%', background: '#ed8936'}}></div>
                </div>
              </div>
              <div className="performance-item">
                <div className="performance-header">
                  <span className="performance-label">Driver Safety Score</span>
                  <span className="performance-value">91.8%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '91.8%', background: '#48bb78'}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <h3>Cost Analysis</h3>
            <div className="cost-breakdown">
              <div className="cost-item">
                <div className="cost-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  <span>Fuel Costs</span>
                </div>
                <div className="cost-value">$12,450</div>
              </div>
              <div className="cost-item">
                <div className="cost-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                  <span>Maintenance</span>
                </div>
                <div className="cost-value">$8,320</div>
              </div>
              <div className="cost-item">
                <div className="cost-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  <span>Other Expenses</span>
                </div>
                <div className="cost-value">$3,890</div>
              </div>
              <div className="cost-item total">
                <div className="cost-header">
                  <strong>Total Operating Cost</strong>
                </div>
                <div className="cost-value"><strong>$24,660</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Analytics

