import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { vehicleService } from '../services'
import './VehicleRegistry.css'

function VehicleRegistry() {
  const [vehicles, setVehicles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [formData, setFormData] = useState({
    vehicle_name: '',
    model: '',
    license_plate: '',
    vehicle_type: 'Truck',
    max_capacity_kg: '',
    odometer_km: '0',
    status: 'Available',
    acquisition_cost: ''
  })

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await vehicleService.getAll()
      if (response.success) {
        setVehicles(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredAndSortedVehicles = () => {
    let filtered = vehicles.filter(vehicle => {
      const matchSearch = vehicle.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchType = filterType === 'All' || vehicle.vehicle_type === filterType
      const matchStatus = filterStatus === 'All' || vehicle.status === filterStatus
      
      return matchSearch && matchType && matchStatus
    })

    filtered.sort((a, b) => {
      let aVal, bVal

      switch(sortBy) {
        case 'name':
          aVal = a.vehicle_name.toLowerCase()
          bVal = b.vehicle_name.toLowerCase()
          break
        case 'type':
          aVal = a.vehicle_type
          bVal = b.vehicle_type
          break
        case 'status':
          aVal = a.status
          bVal = b.status
          break
        case 'capacity':
          aVal = a.max_capacity_kg
          bVal = b.max_capacity_kg
          break
        case 'odometer':
          aVal = a.odometer_km
          bVal = b.odometer_km
          break
        default:
          aVal = a.vehicle_name
          bVal = b.vehicle_name
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      } else {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }
    })

    return filtered
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const response = await vehicleService.delete(id)
        if (response.success) {
          await fetchVehicles()
        }
      } catch (error) {
        console.error('Failed to delete vehicle:', error)
        alert('Failed to delete vehicle.')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const vehicleData = {
        ...formData,
        max_capacity_kg: parseFloat(formData.max_capacity_kg),
        odometer_km: parseFloat(formData.odometer_km),
        acquisition_cost: parseFloat(formData.acquisition_cost)
      }
      
      const response = await vehicleService.create(vehicleData)
      if (response.success) {
        await fetchVehicles()
        setShowForm(false)
        setFormData({
          vehicle_name: '',
          model: '',
          license_plate: '',
          vehicle_type: 'Truck',
          max_capacity_kg: '',
          odometer_km: '0',
          status: 'Available',
          acquisition_cost: ''
        })
      }
    } catch (error) {
      console.error('Failed to create vehicle:', error)
      alert('Failed to create vehicle. Please try again.')
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await vehicleService.updateStatus(id, newStatus)
      if (response.success) {
        await fetchVehicles()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update vehicle status.')
    }
  }

  return (
    <Layout>
      <div className="vehicle-registry">
        <div className="page-header">
          <div>
            <h1>Vehicle Registry</h1>
            <p className="page-subtitle">Asset management & fleet inventory</p>
          </div>
          <button className="primary-btn" onClick={() => setShowForm(true)}>
            + Add Vehicle
          </button>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search by name, license plate, or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-controls">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Types</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Bike">Bike</option>
            </select>

            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Status</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>

            <div className="sort-controls">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="name">Sort by Name</option>
                <option value="type">Sort by Type</option>
                <option value="status">Sort by Status</option>
                <option value="capacity">Sort by Capacity</option>
                <option value="odometer">Sort by Odometer</option>
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
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Add New Vehicle</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Vehicle Name</label>
                    <input
                      type="text"
                      value={formData.vehicle_name}
                      onChange={(e) => setFormData({...formData, vehicle_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Model</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>License Plate</label>
                    <input
                      type="text"
                      value={formData.license_plate}
                      onChange={(e) => setFormData({...formData, license_plate: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Vehicle Type</label>
                    <select
                      value={formData.vehicle_type}
                      onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                    >
                      <option value="Truck">Truck</option>
                      <option value="Van">Van</option>
                      <option value="Bike">Bike</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Max Capacity (kg)</label>
                    <input
                      type="number"
                      value={formData.max_capacity_kg}
                      onChange={(e) => setFormData({...formData, max_capacity_kg: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Acquisition Cost ($)</label>
                    <input
                      type="number"
                      value={formData.acquisition_cost}
                      onChange={(e) => setFormData({...formData, acquisition_cost: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="primary-btn">Add Vehicle</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="table-container">
          {loading ? (
            <div className="loading">Loading vehicles...</div>
          ) : getFilteredAndSortedVehicles().length === 0 ? (
            <div className="no-data">No vehicles found. Try adjusting your filters or add a new vehicle.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Model</th>
                  <th>License Plate</th>
                  <th>Type</th>
                  <th>Capacity (kg)</th>
                  <th>Odometer (km)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredAndSortedVehicles().map(vehicle => (
                  <tr key={vehicle.vehicle_id}>
                    <td>{vehicle.vehicle_name}</td>
                    <td>{vehicle.model}</td>
                    <td><span className="badge">{vehicle.license_plate}</span></td>
                    <td>{vehicle.vehicle_type}</td>
                    <td>{vehicle.max_capacity_kg.toLocaleString()}</td>
                    <td>{vehicle.odometer_km.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge status-${vehicle.status.toLowerCase().replace(' ', '-')}`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <select
                          value={vehicle.status}
                          onChange={(e) => handleStatusChange(vehicle.vehicle_id, e.target.value)}
                          className="status-select"
                        >
                          <option value="Available">Available</option>
                          <option value="On Trip">On Trip</option>
                          <option value="In Shop">In Shop</option>
                          <option value="Retired">Retired</option>
                        </select>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(vehicle.vehicle_id)}
                          title="Delete vehicle"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                        </button>
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

export default VehicleRegistry
