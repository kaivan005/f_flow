import express from 'express'
import db from '../config/database.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// Get all vehicles
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [vehicles] = await db.query('SELECT * FROM vehicles ORDER BY created_at DESC')
    res.json({
      success: true,
      data: vehicles
    })
  } catch (error) {
    console.error('Get vehicles error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles'
    })
  }
})

// Get available vehicles
router.get('/available', authMiddleware, async (req, res) => {
  try {
    const [vehicles] = await db.query(
      'SELECT * FROM vehicles WHERE status = "Available" ORDER BY vehicle_name'
    )
    res.json({
      success: true,
      data: vehicles
    })
  } catch (error) {
    console.error('Get available vehicles error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching available vehicles'
    })
  }
})

// Get single vehicle
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [vehicles] = await db.query('SELECT * FROM vehicles WHERE vehicle_id = ?', [req.params.id])
    
    if (vehicles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      })
    }

    res.json({
      success: true,
      data: vehicles[0]
    })
  } catch (error) {
    console.error('Get vehicle error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle'
    })
  }
})

// Create vehicle
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { vehicle_name, model, license_plate, vehicle_type, max_capacity_kg, odometer_km, acquisition_cost } = req.body

    const [result] = await db.query(
      'INSERT INTO vehicles (vehicle_name, model, license_plate, vehicle_type, max_capacity_kg, odometer_km, acquisition_cost) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [vehicle_name, model, license_plate, vehicle_type, max_capacity_kg, odometer_km || 0, acquisition_cost]
    )

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      vehicle_id: result.insertId
    })
  } catch (error) {
    console.error('Create vehicle error:', error)
    res.status(500).json({
      success: false,
      message: error.code === 'ER_DUP_ENTRY' ? 'License plate already exists' : 'Error creating vehicle'
    })
  }
})

// Update vehicle
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { vehicle_name, model, license_plate, vehicle_type, max_capacity_kg, odometer_km, status, acquisition_cost } = req.body

    const [result] = await db.query(
      'UPDATE vehicles SET vehicle_name = ?, model = ?, license_plate = ?, vehicle_type = ?, max_capacity_kg = ?, odometer_km = ?, status = ?, acquisition_cost = ? WHERE vehicle_id = ?',
      [vehicle_name, model, license_plate, vehicle_type, max_capacity_kg, odometer_km, status, acquisition_cost, req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      })
    }

    res.json({
      success: true,
      message: 'Vehicle updated successfully'
    })
  } catch (error) {
    console.error('Update vehicle error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating vehicle'
    })
  }
})

// Update vehicle status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body

    const [result] = await db.query(
      'UPDATE vehicles SET status = ? WHERE vehicle_id = ?',
      [status, req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      })
    }

    res.json({
      success: true,
      message: 'Vehicle status updated successfully'
    })
  } catch (error) {
    console.error('Update vehicle status error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating vehicle status'
    })
  }
})

// Delete vehicle
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM vehicles WHERE vehicle_id = ?', [req.params.id])

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      })
    }

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    })
  } catch (error) {
    console.error('Delete vehicle error:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting vehicle'
    })
  }
})

export default router
