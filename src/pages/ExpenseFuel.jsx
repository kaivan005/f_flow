import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { expenseService, vehicleService } from '../services'
import './VehicleRegistry.css'

function ExpenseFuel() {
  const [activeTab, setActiveTab] = useState('fuel')
  const [fuelLogs, setFuelLogs] = useState([])
  const [expenses, setExpenses] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [fuelFormData, setFuelFormData] = useState({
    vehicle_id: '',
    refuel_date: new Date().toISOString().split('T')[0],
    liters_filled: '',
    cost_per_liter: '',
    odometer_at_refuel: ''
  })
  const [expenseFormData, setExpenseFormData] = useState({
    vehicle_id: '',
    expense_type: 'Parts',
    expense_date: new Date().toISOString().split('T')[0],
    amount: '',
    description: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [fuelResponse, expensesResponse, vehiclesResponse] = await Promise.all([
        expenseService.getFuel(),
        expenseService.getExpenses(),
        vehicleService.getAll()
      ])

      if (fuelResponse.success) setFuelLogs(fuelResponse.data)
      if (expensesResponse.success) setExpenses(expensesResponse.data)
      if (vehiclesResponse.success) setVehicles(vehiclesResponse.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFuelSubmit = async (e) => {
    e.preventDefault()
    try {
      const fuelData = {
        vehicle_id: parseInt(fuelFormData.vehicle_id),
        refuel_date: fuelFormData.refuel_date,
        liters_filled: parseFloat(fuelFormData.liters_filled),
        cost_per_liter: parseFloat(fuelFormData.cost_per_liter),
        odometer_at_refuel: parseFloat(fuelFormData.odometer_at_refuel)
      }

      const response = await expenseService.createFuel(fuelData)
      if (response.success) {
        await fetchData()
        setShowForm(false)
        setFuelFormData({
          vehicle_id: '',
          refuel_date: new Date().toISOString().split('T')[0],
          liters_filled: '',
          cost_per_liter: '',
          odometer_at_refuel: ''
        })
      }
    } catch (error) {
      console.error('Failed to create fuel log:', error)
      alert('Failed to create fuel log. Please try again.')
    }
  }

  const handleExpenseSubmit = async (e) => {
    e.preventDefault()
    try {
      const expenseData = {
        vehicle_id: parseInt(expenseFormData.vehicle_id),
        expense_type: expenseFormData.expense_type,
        expense_date: expenseFormData.expense_date,
        amount: parseFloat(expenseFormData.amount),
        description: expenseFormData.description
      }

      const response = await expenseService.createExpense(expenseData)
      if (response.success) {
        await fetchData()
        setShowForm(false)
        setExpenseFormData({
          vehicle_id: '',
          expense_type: 'Parts',
          expense_date: new Date().toISOString().split('T')[0],
          amount: '',
          description: ''
        })
      }
    } catch (error) {
      console.error('Failed to create expense:', error)
      alert('Failed to create expense. Please try again.')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Layout>
      <div className="vehicle-registry">
        <div className="page-header">
          <div>
            <h1>Expenses & Fuel Logging</h1>
            <p className="page-subtitle">Financial tracking and fuel management</p>
          </div>
          <button className="primary-btn" onClick={() => setShowForm(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add {activeTab === 'fuel' ? 'Fuel Log' : 'Expense'}
          </button>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'fuel' ? 'active' : ''}`}
            onClick={() => setActiveTab('fuel')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              <path d="M19 7l-5 5"/>
              <path d="M14 3l1 1"/>
              <path d="M17 6l1 1"/>
            </svg>
            Fuel Logs
          </button>
          <button
            className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            Other Expenses
          </button>
        </div>

        {showForm && activeTab === 'fuel' && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Add Fuel Log</h2>
              <form onSubmit={handleFuelSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Vehicle</label>
                    <select
                      name="vehicle_id"
                      value={fuelFormData.vehicle_id}
                      onChange={(e) => setFuelFormData({...fuelFormData, vehicle_id: e.target.value})}
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
                    <label>Refuel Date</label>
                    <input
                      type="date"
                      name="refuel_date"
                      value={fuelFormData.refuel_date}
                      onChange={(e) => setFuelFormData({...fuelFormData, refuel_date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Liters Filled</label>
                    <input
                      type="number"
                      name="liters_filled"
                      value={fuelFormData.liters_filled}
                      onChange={(e) => setFuelFormData({...fuelFormData, liters_filled: e.target.value})}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Cost per Liter ($)</label>
                    <input
                      type="number"
                      name="cost_per_liter"
                      value={fuelFormData.cost_per_liter}
                      onChange={(e) => setFuelFormData({...fuelFormData, cost_per_liter: e.target.value})}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Odometer Reading (km)</label>
                    <input
                      type="number"
                      name="odometer_at_refuel"
                      value={fuelFormData.odometer_at_refuel}
                      onChange={(e) => setFuelFormData({...fuelFormData, odometer_at_refuel: e.target.value})}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="primary-btn">Add Fuel Log</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showForm && activeTab === 'expenses' && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Add Expense</h2>
              <form onSubmit={handleExpenseSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Vehicle</label>
                    <select
                      name="vehicle_id"
                      value={expenseFormData.vehicle_id}
                      onChange={(e) => setExpenseFormData({...expenseFormData, vehicle_id: e.target.value})}
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
                    <label>Expense Type</label>
                    <select
                      name="expense_type"
                      value={expenseFormData.expense_type}
                      onChange={(e) => setExpenseFormData({...expenseFormData, expense_type: e.target.value})}
                      required
                    >
                      <option value="Parts">Parts</option>
                      <option value="Tolls">Tolls</option>
                      <option value="Parking">Parking</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Registration">Registration</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Expense Date</label>
                    <input
                      type="date"
                      name="expense_date"
                      value={expenseFormData.expense_date}
                      onChange={(e) => setExpenseFormData({...expenseFormData, expense_date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount ($)</label>
                    <input
                      type="number"
                      name="amount"
                      value={expenseFormData.amount}
                      onChange={(e) => setExpenseFormData({...expenseFormData, amount: e.target.value})}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group" style={{gridColumn: '1 / -1'}}>
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={expenseFormData.description}
                      onChange={(e) => setExpenseFormData({...expenseFormData, description: e.target.value})}
                      rows="3"
                      placeholder="Additional details about the expense..."
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="primary-btn">Add Expense</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="table-container">
          {loading ? (
            <div className="loading">Loading {activeTab === 'fuel' ? 'fuel logs' : 'expenses'}...</div>
          ) : activeTab === 'fuel' ? (
            fuelLogs.length === 0 ? (
              <div className="no-data">No fuel logs found. Click "Add Fuel Log" to create one.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Vehicle</th>
                    <th>Date</th>
                    <th>Liters</th>
                    <th>Cost/Liter</th>
                    <th>Total Cost</th>
                    <th>Odometer</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelLogs.map(log => (
                    <tr key={log.fuel_id}>
                      <td>#{log.fuel_id}</td>
                      <td>
                        <div>
                          <strong>{log.vehicle_name}</strong>
                          <br/>
                          <small>{log.license_plate}</small>
                        </div>
                      </td>
                      <td>{formatDate(log.refuel_date)}</td>
                      <td>{parseFloat(log.liters_filled).toFixed(2)} L</td>
                      <td>${parseFloat(log.cost_per_liter).toFixed(2)}</td>
                      <td>${log.total_cost.toFixed(2)}</td>
                      <td>{parseFloat(log.odometer_at_refuel).toLocaleString()} km</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            expenses.length === 0 ? (
              <div className="no-data">No expenses found. Click "Add Expense" to create one.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Expense ID</th>
                    <th>Vehicle</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(expense => (
                    <tr key={expense.expense_id}>
                      <td>#{expense.expense_id}</td>
                      <td>
                        <div>
                          <strong>{expense.vehicle_name}</strong>
                          <br/>
                          <small>{expense.license_plate}</small>
                        </div>
                      </td>
                      <td>{expense.expense_type}</td>
                      <td>{formatDate(expense.expense_date)}</td>
                      <td>${parseFloat(expense.amount).toFixed(2)}</td>
                      <td>
                        <div style={{maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                          {expense.description || '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>
    </Layout>
  )
}

export default ExpenseFuel

