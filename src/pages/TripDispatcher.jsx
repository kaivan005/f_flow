import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { tripService, vehicleService, driverService } from '../services'
import '../pages/VehicleRegistry.css'

function TripDispatcher() {
  const [trips, setTrips] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    vehicle_id: '',
    driver_id: '',
    cargo_weight_kg: '',
    origin: '',
    destination: '',
    trip_status: 'Draft'
  })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [tripsResponse, vehiclesResponse, driversResponse] = await Promise.all([
        tripService.getAll(),
        vehicleService.getAvailable(),
        driverService.getAvailable()
      ])

      if (tripsResponse.success) setTrips(tripsResponse.data)
      if (vehiclesResponse.success) setVehicles(vehiclesResponse.data)
      if (driversResponse.success) setDrivers(driversResponse.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const selectedVehicle = vehicles.find(v => v.vehicle_id === parseInt(formData.vehicle_id))
    const selectedDriver = drivers.find(d => d.driver_id === parseInt(formData.driver_id))
    const cargoWeight = parseFloat(formData.cargo_weight_kg)

    // Validation: Cargo weight must be less than vehicle capacity
    if (cargoWeight > selectedVehicle.max_capacity_kg) {
      setError(`Cargo weight (${cargoWeight}kg) exceeds vehicle capacity (${selectedVehicle.max_capacity_kg}kg)`)
      return
    }

    // Check license expiry
    const expiryDate = new Date(selectedDriver.license_expiry_date)
    if (expiryDate < new Date()) {
      setError(`Driver's license has expired`)
      return
    }

    try {
      const tripData = {
        vehicle_id: parseInt(formData.vehicle_id),
        driver_id: parseInt(formData.driver_id),
        cargo_weight_kg: cargoWeight,
        origin: formData.origin,
        destination: formData.destination,
        trip_status: formData.trip_status
      }

      const response = await tripService.create(tripData)
      if (response.success) {
        await fetchData()
        setShowForm(false)
        setFormData({
          vehicle_id: '',
          driver_id: '',
          cargo_weight_kg: '',
          origin: '',
          destination: '',
          trip_status: 'Draft'
        })
      }
    } catch (error) {
      console.error('Failed to create trip:', error)
      setError(error.response?.data?.message || 'Failed to create trip. Please try again.')
    }
  }

  const updateTripStatus = async (id, status) => {
    try {
      const response = await tripService.updateStatus(id, status)
      if (response.success) {
        await fetchData()
      }
    } catch (error) {
      console.error('Failed to update trip status:', error)
      alert('Failed to update trip status.')
    }
  }

  return (
    <Layout>
      <div className="vehicle-registry">
        <div className="page-header">
          <div>
            <h1>Trip Dispatcher & Management</h1>
            <p className="page-subtitle">Create and manage delivery trips</p>
          </div>
          <button className="primary-btn" onClick={() => setShowForm(true)}>
            + Create Trip
          </button>
        </div>

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Create New Trip</h2>
              {error && <div className="error-alert">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Vehicle</label>
                    <select
                      value={formData.vehicle_id}
                      onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
                      required
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.filter(v => v.status === 'Available').map(v => (
                        <option key={v.vehicle_id} value={v.vehicle_id}>
                          {v.vehicle_name} (Capacity: {v.max_capacity_kg}kg)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Driver</label>
                    <select
                      value={formData.driver_id}
                      onChange={(e) => setFormData({...formData, driver_id: e.target.value})}
                      required
                    >
                      <option value="">Select Driver</option>
                      {drivers.filter(d => d.availability_status === 'Available').map(d => (
                        <option key={d.driver_id} value={d.driver_id}>
                          {d.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Cargo Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.cargo_weight_kg}
                      onChange={(e) => setFormData({...formData, cargo_weight_kg: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Origin</label>
                    <input
                      type="text"
                      value={formData.origin}
                      onChange={(e) => setFormData({...formData, origin: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Destination</label>
                    <input
                      type="text"
                      value={formData.destination}
                      onChange={(e) => setFormData({...formData, destination: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Initial Status</label>
                    <select
                      value={formData.trip_status}
                      onChange={(e) => setFormData({...formData, trip_status: e.target.value})}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Dispatched">Dispatched</option>
                    </select>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="primary-btn">Create Trip</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="table-container">
          {loading ? (
            <div className="loading">Loading trips...</div>
          ) : trips.length === 0 ? (
            <div className="no-data">No trips found. Click "Create Trip" to start.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Trip ID</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Cargo (kg)</th>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trips.map(trip => (
                  <tr key={trip.trip_id}>
                    <td>#{trip.trip_id}</td>
                    <td>{trip.vehicle_name}</td>
                    <td>{trip.driver_name}</td>
                    <td>{trip.cargo_weight_kg}</td>
                    <td>{trip.origin}</td>
                    <td>{trip.destination}</td>
                    <td>
                      <span className={`status-badge status-${trip.trip_status.toLowerCase()}`}>
                        {trip.trip_status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={trip.trip_status}
                        onChange={(e) => updateTripStatus(trip.trip_id, e.target.value)}
                        className="status-select"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
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

export default TripDispatcher
