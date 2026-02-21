import express from 'express'
import db from '../config/database.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// Get all drivers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [drivers] = await db.query('SELECT * FROM drivers ORDER BY full_name')
    res.json({
      success: true,
      data: drivers
    })
  } catch (error) {
    console.error('Get drivers error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching drivers'
    })
  }
})

// Get available drivers
router.get('/available', authMiddleware, async (req, res) => {
  try {
    const [drivers] = await db.query(
      'SELECT * FROM drivers WHERE duty_status = "On Duty" AND availability_status = "Available" AND license_expiry_date > CURDATE() ORDER BY full_name'
    )
    res.json({
      success: true,
      data: drivers
    })
  } catch (error) {
    console.error('Get available drivers error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching available drivers'
    })
  }
})

// Create driver
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { full_name, license_number, license_category, license_expiry_date } = req.body

    const [result] = await db.query(
      'INSERT INTO drivers (full_name, license_number, license_category, license_expiry_date) VALUES (?, ?, ?, ?)',
      [full_name, license_number, license_category, license_expiry_date]
    )

    res.status(201).json({
      success: true,
      message: 'Driver registered successfully',
      driver_id: result.insertId
    })
  } catch (error) {
    console.error('Create driver error:', error)
    res.status(500).json({
      success: false,
      message: error.code === 'ER_DUP_ENTRY' ? 'License number already exists' : 'Error creating driver'
    })
  }
})

// Update driver status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { duty_status, availability_status } = req.body

    let query = 'UPDATE drivers SET '
    const params = []
    
    if (duty_status) {
      query += 'duty_status = ?'
      params.push(duty_status)
    }
    
    if (availability_status) {
      if (params.length > 0) query += ', '
      query += 'availability_status = ?'
      params.push(availability_status)
    }
    
    query += ' WHERE driver_id = ?'
    params.push(req.params.id)

    const [result] = await db.query(query, params)

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      })
    }

    res.json({
      success: true,
      message: 'Driver status updated successfully'
    })
  } catch (error) {
    console.error('Update driver status error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating driver status'
    })
  }
})

export default router
