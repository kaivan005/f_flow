import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { maintenanceService, vehicleService } from '../services'
import './VehicleRegistry.css'

function Maintenance() {
  const [maintenanceLogs, setMaintenanceLogs] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterServiceType, setFilterServiceType] = useState('All')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [formData, setFormData] = useState({
    vehicle_id: '',
    service_type: 'Oil Change',
    service_date: new Date().toISOString().split('T')[0],
    cost: '',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [logsResponse, vehiclesResponse] = await Promise.all([
        maintenanceService.getAll(),
        vehicleService.getAll()
      ])

      if (logsResponse.success) setMaintenanceLogs(logsResponse.data)
      if (vehiclesResponse.success) setVehicles(vehiclesResponse.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const maintenanceData = {
        vehicle_id: parseInt(formData.vehicle_id),
        service_type: formData.service_type,
        service_date: formData.service_date,
        cost: parseFloat(formData.cost),
        notes: formData.notes
      }

      const response = await maintenanceService.create(maintenanceData)
      if (response.success) {
        await fetchData()
        setShowForm(false)
        setFormData({
          vehicle_id: '',
          service_type: 'Oil Change',
          service_date: new Date().toISOString().split('T')[0],
          cost: '',
          notes: ''
        })
      }
    } catch (error) {
      console.error('Failed to create maintenance log:', error)
      alert('Failed to create maintenance log. Please try again.')
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

  const getFilteredAndSortedLogs = () => {
    let filtered = maintenanceLogs.filter(log => {
      const matchSearch = log.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.notes.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchType = filterServiceType === 'All' || log.service_type === filterServiceType
      
      return matchSearch && matchType
    })

    filtered.sort((a, b) => {
      let aVal, bVal

      switch(sortBy) {
        case 'date':
          aVal = new Date(a.service_date)
          bVal = new Date(b.service_date)
          break
        case 'vehicle':
          aVal = a.vehicle_name.toLowerCase()
          bVal = b.vehicle_name.toLowerCase()
          break
        case 'type':
          aVal = a.service_type
          bVal = b.service_type
          break
        case 'cost':
          aVal = a.cost
          bVal = b.cost
          break
        default:
          aVal = new Date(a.service_date)
          bVal = new Date(b.service_date)
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      } else {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }
    })

    return filtered
  }

  return (
    <Layout>
      <div className="vehicle-registry">
        <div className="page-header">
          <div>
            <h1>Maintenance & Service Logs</h1>
            <p className="page-subtitle">Track vehicle health and service history</p>
          </div>
          <button className="primary-btn" onClick={() => setShowForm(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Service Log
          </button>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search by vehicle, service type, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-controls">
            <select 
              value={filterServiceType}
              onChange={(e) => setFilterServiceType(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Service Types</option>
              <option value="Oil Change">Oil Change</option>
              <option value="Tire Replacement">Tire Replacement</option>
              <option value="Brake Service">Brake Service</option>
              <option value="Engine Inspection">Engine Inspection</option>
              <option value="Suspension">Suspension</option>
              <option value="Other">Other</option>
            </select>

            <div className="sort-controls">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="date">Sort by Date</option>
                <option value="vehicle">Sort by Vehicle</option>
                <option value="type">Sort by Service Type</option>
                <option value="cost">Sort by Cost</option>
              </select>

              <button 
                className="sort-order-btn"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                title={`Currently ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {sortOrder === 'asc' ? (
                    <>
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <polyline points="19 12 12 19 5 12"/>
                    </>
                  ) : (
                    <>
                      <line x1="12" y1="19" x2="12" y2="5"/>
                      <polyline points="5 12 12 5 19 12"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Add Maintenance Log</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Vehicle</label>
                    <select
                      name="vehicle_id"
                      value={formData.vehicle_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                          {vehicle.vehicle_name} - {vehicle.license_plate}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Service Type</label>
                    <select
                      name="service_type"
                      value={formData.service_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="Oil Change">Oil Change</option>
                      <option value="Tire Replacement">Tire Replacement</option>
                      <option value="Brake Service">Brake Service</option>
                      <option value="Engine Repair">Engine Repair</option>
                      <option value="Transmission Service">Transmission Service</option>
                      <option value="General Inspection">General Inspection</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Service Date</label>
                    <input
                      type="date"
                      name="service_date"
                      value={formData.service_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Cost ($)</label>
                    <input
                      type="number"
                      name="cost"
                      value={formData.cost}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group" style={{gridColumn: '1 / -1'}}>
                    <label>Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Additional details about the service..."
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="primary-btn">Add Log</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="table-container">
          {loading ? (
            <div className="loading">Loading maintenance logs...</div>
          ) : getFilteredAndSortedLogs().length === 0 ? (
            <div className="no-data">No maintenance logs found. Try adjusting your filters or click "Add Service Log" to create one.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Vehicle</th>
                  <th>Service Type</th>
                  <th>Service Date</th>
                  <th>Cost</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredAndSortedLogs().map(log => (
                  <tr key={log.log_id}>
                    <td>#{log.log_id}</td>
                    <td>
                      <div>
                        <strong>{log.vehicle_name}</strong>
                        <br/>
                        <small>{log.license_plate}</small>
                      </div>
                    </td>
                    <td>{log.service_type}</td>
                    <td>{formatDate(log.service_date)}</td>
                    <td>${parseFloat(log.cost).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td>
                      <div style={{maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {log.notes || '-'}
                      </div>
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

export default Maintenance

