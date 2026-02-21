import express from 'express'
import db from '../config/database.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// Get all maintenance logs
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [logs] = await db.query(`
      SELECT m.*, v.vehicle_name, v.license_plate
      FROM maintenance_logs m
      JOIN vehicles v ON m.vehicle_id = v.vehicle_id
      ORDER BY m.service_date DESC
    `)
    
    res.json({
      success: true,
      data: logs
    })
  } catch (error) {
    console.error('Get maintenance logs error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance logs'
    })
  }
})

// Create maintenance log
router.post('/', authMiddleware, async (req, res) => {
  const connection = await db.getConnection()
  
  try {
    await connection.beginTransaction()
    
    const { vehicle_id, service_type, service_date, cost, notes } = req.body

    const [result] = await connection.query(
      'INSERT INTO maintenance_logs (vehicle_id, service_type, service_date, cost, notes) VALUES (?, ?, ?, ?, ?)',
      [vehicle_id, service_type, service_date, cost, notes]
    )

    // Update vehicle status to "In Shop"
    await connection.query(
      'UPDATE vehicles SET status = "In Shop" WHERE vehicle_id = ?',
      [vehicle_id]
    )

    await connection.commit()

    res.status(201).json({
      success: true,
      message: 'Maintenance log created successfully',
      maintenance_id: result.insertId
    })
  } catch (error) {
    await connection.rollback()
    console.error('Create maintenance log error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating maintenance log'
    })
  } finally {
    connection.release()
  }
})

export default router
