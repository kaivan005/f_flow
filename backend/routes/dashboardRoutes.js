import express from 'express'
import db from '../config/database.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// Get dashboard statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Active fleet count
    const [activeFleet] = await db.query(
      'SELECT COUNT(*) as count FROM vehicles WHERE status = "On Trip"'
    )

    // Maintenance alerts
    const [maintenanceAlerts] = await db.query(
      'SELECT COUNT(*) as count FROM vehicles WHERE status = "In Shop"'
    )

    // Total vehicles
    const [totalVehicles] = await db.query(
      'SELECT COUNT(*) as count FROM vehicles'
    )

    // Utilization rate
    const utilizationRate = totalVehicles[0].count > 0 
      ? Math.round((activeFleet[0].count / totalVehicles[0].count) * 100) 
      : 0

    // Pending cargo (Draft trips)
    const [pendingCargo] = await db.query(
      'SELECT COUNT(*) as count FROM trips WHERE trip_status = "Draft"'
    )

    // Total drivers
    const [totalDrivers] = await db.query(
      'SELECT COUNT(*) as count FROM drivers'
    )

    // Completed trips
    const [completedTrips] = await db.query(
      'SELECT COUNT(*) as count FROM trips WHERE trip_status = "Completed"'
    )

    // Total revenue
    const [revenue] = await db.query(
      'SELECT COALESCE(SUM(revenue), 0) as total FROM trips WHERE trip_status = "Completed"'
    )

    res.json({
      success: true,
      data: {
        activeFleet: activeFleet[0].count,
        maintenanceAlerts: maintenanceAlerts[0].count,
        utilizationRate: utilizationRate,
        pendingCargo: pendingCargo[0].count,
        totalVehicles: totalVehicles[0].count,
        totalDrivers: totalDrivers[0].count,
        completedTrips: completedTrips[0].count,
        totalRevenue: parseFloat(revenue[0].total)
      }
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    })
  }
})

// Get recent activity
router.get('/activity', authMiddleware, async (req, res) => {
  try {
    const [activities] = await db.query(`
      (SELECT 'trip_completed' as type, CONCAT('Trip #', trip_id, ' completed') as message, completed_at as timestamp
       FROM trips WHERE trip_status = 'Completed' ORDER BY completed_at DESC LIMIT 5)
      UNION ALL
      (SELECT 'maintenance' as type, CONCAT(v.vehicle_name, ' sent to maintenance') as message, m.created_at as timestamp
       FROM maintenance_logs m JOIN vehicles v ON m.vehicle_id = v.vehicle_id ORDER BY m.created_at DESC LIMIT 5)
      UNION ALL
      (SELECT 'vehicle_added' as type, CONCAT('New vehicle ', vehicle_name, ' added') as message, created_at as timestamp
       FROM vehicles ORDER BY created_at DESC LIMIT 5)
      ORDER BY timestamp DESC LIMIT 10
    `)

    res.json({
      success: true,
      data: activities
    })
  } catch (error) {
    console.error('Get activity error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity'
    })
  }
})

export default router
