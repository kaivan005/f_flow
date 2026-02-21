import express from 'express'
import db from '../config/database.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// Get all fuel logs
router.get('/fuel', authMiddleware, async (req, res) => {
  try {
    const [logs] = await db.query(`
      SELECT f.*, v.vehicle_name, t.trip_id
      FROM fuel_logs f
      JOIN vehicles v ON f.vehicle_id = v.vehicle_id
      LEFT JOIN trips t ON f.trip_id = t.trip_id
      ORDER BY f.fuel_date DESC
    `)
    
    res.json({
      success: true,
      data: logs
    })
  } catch (error) {
    console.error('Get fuel logs error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching fuel logs'
    })
  }
})

// Create fuel log
router.post('/fuel', authMiddleware, async (req, res) => {
  try {
    const { vehicle_id, trip_id, liters, cost, fuel_date } = req.body

    const [result] = await db.query(
      'INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, fuel_date) VALUES (?, ?, ?, ?, ?)',
      [vehicle_id, trip_id, liters, cost, fuel_date]
    )

    res.status(201).json({
      success: true,
      message: 'Fuel log created successfully',
      fuel_id: result.insertId
    })
  } catch (error) {
    console.error('Create fuel log error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating fuel log'
    })
  }
})

// Get all expenses
router.get('/expenses', authMiddleware, async (req, res) => {
  try {
    const [expenses] = await db.query(`
      SELECT e.*, v.vehicle_name
      FROM expenses e
      JOIN vehicles v ON e.vehicle_id = v.vehicle_id
      ORDER BY e.expense_date DESC
    `)
    
    res.json({
      success: true,
      data: expenses
    })
  } catch (error) {
    console.error('Get expenses error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses'
    })
  }
})

// Create expense
router.post('/expenses', authMiddleware, async (req, res) => {
  try {
    const { vehicle_id, expense_type, amount, expense_date } = req.body

    const [result] = await db.query(
      'INSERT INTO expenses (vehicle_id, expense_type, amount, expense_date) VALUES (?, ?, ?, ?)',
      [vehicle_id, expense_type, amount, expense_date]
    )

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      expense_id: result.insertId
    })
  } catch (error) {
    console.error('Create expense error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating expense'
    })
  }
})

// Get total operational cost per vehicle
router.get('/vehicle/:id/total', authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query(`
      SELECT 
        COALESCE(SUM(f.cost), 0) as total_fuel_cost,
        COALESCE(SUM(m.cost), 0) as total_maintenance_cost,
        COALESCE(SUM(e.amount), 0) as total_other_expenses,
        (COALESCE(SUM(f.cost), 0) + COALESCE(SUM(m.cost), 0) + COALESCE(SUM(e.amount), 0)) as total_operational_cost
      FROM vehicles v
      LEFT JOIN fuel_logs f ON v.vehicle_id = f.vehicle_id
      LEFT JOIN maintenance_logs m ON v.vehicle_id = m.vehicle_id
      LEFT JOIN expenses e ON v.vehicle_id = e.vehicle_id
      WHERE v.vehicle_id = ?
      GROUP BY v.vehicle_id
    `, [req.params.id])

    res.json({
      success: true,
      data: result[0] || {
        total_fuel_cost: 0,
        total_maintenance_cost: 0,
        total_other_expenses: 0,
        total_operational_cost: 0
      }
    })
  } catch (error) {
    console.error('Get total cost error:', error)
    res.status(500).json({
      success: false,
      message: 'Error calculating total cost'
    })
  }
})

export default router
