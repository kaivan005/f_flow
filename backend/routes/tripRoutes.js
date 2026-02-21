import express from 'express'
import db from '../config/database.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// Get all trips
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [trips] = await db.query(`
      SELECT t.*, v.vehicle_name, d.full_name as driver_name 
      FROM trips t
      JOIN vehicles v ON t.vehicle_id = v.vehicle_id
      JOIN drivers d ON t.driver_id = d.driver_id
      ORDER BY t.created_at DESC
    `)
    
    res.json({
      success: true,
      data: trips
    })
  } catch (error) {
    console.error('Get trips error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching trips'
    })
  }
})

// Create trip
router.post('/', authMiddleware, async (req, res) => {
  const connection = await db.getConnection()
  
  try {
    await connection.beginTransaction()
    
    const { vehicle_id, driver_id, cargo_weight_kg, origin, destination, trip_status } = req.body

    // Validate cargo weight against vehicle capacity
    const [vehicles] = await connection.query(
      'SELECT max_capacity_kg, status FROM vehicles WHERE vehicle_id = ?',
      [vehicle_id]
    )

    if (vehicles.length === 0) {
      await connection.rollback()
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      })
    }

    if (vehicles[0].status !== 'Available') {
      await connection.rollback()
      return res.status(400).json({
        success: false,
        message: 'Vehicle is not available'
      })
    }

    if (parseFloat(cargo_weight_kg) > parseFloat(vehicles[0].max_capacity_kg)) {
      await connection.rollback()
      return res.status(400).json({
        success: false,
        message: `Cargo weight (${cargo_weight_kg}kg) exceeds vehicle capacity (${vehicles[0].max_capacity_kg}kg)`
      })
    }

    // Check driver availability and license
    const [drivers] = await connection.query(
      'SELECT availability_status, license_expiry_date FROM drivers WHERE driver_id = ?',
      [driver_id]
    )

    if (drivers.length === 0) {
      await connection.rollback()
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      })
    }

    if (drivers[0].availability_status !== 'Available') {
      await connection.rollback()
      return res.status(400).json({
        success: false,
        message: 'Driver is not available'
      })
    }

    // Check license expiry
    const expiryDate = new Date(drivers[0].license_expiry_date)
    if (expiryDate < new Date()) {
      await connection.rollback()
      return res.status(400).json({
        success: false,
        message: 'Driver license has expired'
      })
    }

    // Create trip
    const [result] = await connection.query(
      'INSERT INTO trips (vehicle_id, driver_id, cargo_weight_kg, origin, destination, trip_status) VALUES (?, ?, ?, ?, ?, ?)',
      [vehicle_id, driver_id, cargo_weight_kg, origin, destination, trip_status || 'Draft']
    )

    // Update vehicle and driver status if trip is dispatched
    if (trip_status === 'Dispatched') {
      await connection.query('UPDATE vehicles SET status = "On Trip" WHERE vehicle_id = ?', [vehicle_id])
      await connection.query('UPDATE drivers SET availability_status = "On Trip" WHERE driver_id = ?', [driver_id])
    }

    await connection.commit()

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      trip_id: result.insertId
    })
  } catch (error) {
    await connection.rollback()
    console.error('Create trip error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating trip'
    })
  } finally {
    connection.release()
  }
})

// Update trip status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const connection = await db.getConnection()
  
  try {
    await connection.beginTransaction()
    
    const { trip_status, end_odometer, revenue } = req.body

    // Get trip details
    const [trips] = await connection.query(
      'SELECT * FROM trips WHERE trip_id = ?',
      [req.params.id]
    )

    if (trips.length === 0) {
      await connection.rollback()
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      })
    }

    const trip = trips[0]

    // Update trip
    let query = 'UPDATE trips SET trip_status = ?'
    const params = [trip_status]

    if (end_odometer) {
      query += ', end_odometer = ?'
      params.push(end_odometer)
    }

    if (revenue) {
      query += ', revenue = ?'
      params.push(revenue)
    }

    if (trip_status === 'Completed') {
      query += ', completed_at = NOW()'
    }

    query += ' WHERE trip_id = ?'
    params.push(req.params.id)

    await connection.query(query, params)

    // Update vehicle and driver status based on trip status
    if (trip_status === 'Dispatched') {
      await connection.query('UPDATE vehicles SET status = "On Trip" WHERE vehicle_id = ?', [trip.vehicle_id])
      await connection.query('UPDATE drivers SET availability_status = "On Trip" WHERE driver_id = ?', [trip.driver_id])
    } else if (trip_status === 'Completed' || trip_status === 'Cancelled') {
      await connection.query('UPDATE vehicles SET status = "Available" WHERE vehicle_id = ?', [trip.vehicle_id])
      await connection.query('UPDATE drivers SET availability_status = "Available" WHERE driver_id = ?', [trip.driver_id])
    }

    await connection.commit()

    res.json({
      success: true,
      message: 'Trip status updated successfully'
    })
  } catch (error) {
    await connection.rollback()
    console.error('Update trip status error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating trip status'
    })
  } finally {
    connection.release()
  }
})

export default router
