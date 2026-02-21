import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { vehicleService } from '../services'
import './VehicleRegistry.css'

function VehicleRegistry() {
  const [vehicles, setVehicles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
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

        {showForm && (
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
          ) : vehicles.length === 0 ? (
            <div className="no-data">No vehicles found. Click "Add Vehicle" to create one.</div>
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
                {vehicles.map(vehicle => (
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
