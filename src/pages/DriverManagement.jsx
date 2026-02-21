import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { driverService } from '../services'
import './VehicleRegistry.css'

function DriverManagement() {
  const [drivers, setDrivers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    full_name: '',
    license_number: '',
    license_category: 'B',
    license_expiry_date: '',
    safety_score: '100',
    trip_completion_rate: '100',
    duty_status: 'On Duty',
    availability_status: 'Available'
  })

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const response = await driverService.getAll()
      if (response.success) {
        setDrivers(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch drivers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const driverData = {
        full_name: formData.full_name,
        license_number: formData.license_number,
        license_category: formData.license_category,
        license_expiry_date: formData.license_expiry_date,
        safety_score: parseFloat(formData.safety_score),
        trip_completion_rate: parseFloat(formData.trip_completion_rate),
        duty_status: formData.duty_status,
        availability_status: formData.availability_status
      }

      const response = await driverService.create(driverData)
      if (response.success) {
        await fetchDrivers()
        setShowForm(false)
        setFormData({
          full_name: '',
          license_number: '',
          license_category: 'B',
          license_expiry_date: '',
          safety_score: '100',
          trip_completion_rate: '100',
          duty_status: 'On Duty',
          availability_status: 'Available'
        })
      }
    } catch (error) {
      console.error('Failed to create driver:', error)
      alert('Failed to create driver. Please try again.')
    }
  }

  const handleStatusChange = async (id, field, value) => {
    try {
      const response = await driverService.updateStatus(id, value)
      if (response.success) {
        await fetchDrivers()
      }
    } catch (error) {
      console.error('Failed to update driver status:', error)
      alert('Failed to update driver status.')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isLicenseExpiring = (expiryDate) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0
  }

  const isLicenseExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date()
  }

  return (
    <Layout>
      <div className="vehicle-registry">
        <div className="page-header">
          <div>
            <h1>Driver Performance & Safety</h1>
            <p className="page-subtitle">Monitor driver compliance and performance</p>
          </div>
          <button className="primary-btn" onClick={() => setShowForm(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Driver
          </button>
        </div>

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Add New Driver</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="form-group">
                    <label>License Number</label>
                    <input
                      type="text"
                      name="license_number"
                      value={formData.license_number}
                      onChange={handleChange}
                      required
                      placeholder="LIC123456"
                    />
                  </div>
                  <div className="form-group">
                    <label>License Category</label>
                    <select
                      name="license_category"
                      value={formData.license_category}
                      onChange={handleChange}
                      required
                    >
                      <option value="A">A - Motorcycle</option>
                      <option value="B">B - Car</option>
                      <option value="C">C - Truck</option>
                      <option value="D">D - Bus</option>
                      <option value="E">E - Trailer</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>License Expiry Date</label>
                    <input
                      type="date"
                      name="license_expiry_date"
                      value={formData.license_expiry_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Safety Score (%)</label>
                    <input
                      type="number"
                      name="safety_score"
                      value={formData.safety_score}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Trip Completion Rate (%)</label>
                    <input
                      type="number"
                      name="trip_completion_rate"
                      value={formData.trip_completion_rate}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Duty Status</label>
                    <select
                      name="duty_status"
                      value={formData.duty_status}
                      onChange={handleChange}
                      required
                    >
                      <option value="On Duty">On Duty</option>
                      <option value="Off Duty">Off Duty</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Availability Status</label>
                    <select
                      name="availability_status"
                      value={formData.availability_status}
                      onChange={handleChange}
                      required
                    >
                      <option value="Available">Available</option>
                      <option value="On Trip">On Trip</option>
                      <option value="Unavailable">Unavailable</option>
                    </select>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="primary-btn">Add Driver</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="table-container">
          {loading ? (
            <div className="loading">Loading drivers...</div>
          ) : drivers.length === 0 ? (
            <div className="no-data">No drivers found. Click "Add Driver" to create one.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>License</th>
                  <th>Category</th>
                  <th>Expiry Date</th>
                  <th>Safety Score</th>
                  <th>Completion Rate</th>
                  <th>Status</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map(driver => (
                  <tr key={driver.driver_id}>
                    <td>#{driver.driver_id}</td>
                    <td><strong>{driver.full_name}</strong></td>
                    <td><span className="badge">{driver.license_number}</span></td>
                    <td>{driver.license_category}</td>
                    <td>
                      <div>
                        {formatDate(driver.license_expiry_date)}
                        {isLicenseExpired(driver.license_expiry_date) && (
                          <span className="status-badge status-cancelled" style={{display: 'block', marginTop: '0.25rem'}}>
                            Expired
                          </span>
                        )}
                        {isLicenseExpiring(driver.license_expiry_date) && !isLicenseExpired(driver.license_expiry_date) && (
                          <span className="status-badge" style={{background: '#fef3c7', color: '#92400e', display: 'block', marginTop: '0.25rem'}}>
                            Expiring Soon
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <div style={{flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden'}}>
                          <div 
                            style={{
                              height: '100%', 
                              background: driver.safety_score >= 90 ? '#48bb78' : driver.safety_score >= 70 ? '#ed8936' : '#f56565',
                              width: `${driver.safety_score}%`
                            }}
                          />
                        </div>
                        <span style={{fontSize: '0.85rem', fontWeight: '600'}}>{driver.safety_score.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <div style={{flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden'}}>
                          <div 
                            style={{
                              height: '100%', 
                              background: driver.trip_completion_rate >= 90 ? '#48bb78' : driver.trip_completion_rate >= 70 ? '#ed8936' : '#f56565',
                              width: `${driver.trip_completion_rate}%`
                            }}
                          />
                        </div>
                        <span style={{fontSize: '0.85rem', fontWeight: '600'}}>{driver.trip_completion_rate.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${driver.duty_status.toLowerCase().replace(' ', '-')}`}>
                        {driver.duty_status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={driver.availability_status}
                        onChange={(e) => handleStatusChange(driver.driver_id, 'availability_status', e.target.value)}
                        className="status-select"
                      >
                        <option value="Available">Available</option>
                        <option value="On Trip">On Trip</option>
                        <option value="Unavailable">Unavailable</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default DriverManagement

