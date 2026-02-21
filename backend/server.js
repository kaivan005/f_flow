import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import vehicleRoutes from './routes/vehicleRoutes.js'
import driverRoutes from './routes/driverRoutes.js'
import tripRoutes from './routes/tripRoutes.js'
import maintenanceRoutes from './routes/maintenanceRoutes.js'
import expenseRoutes from './routes/expenseRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/drivers', driverRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/maintenance', maintenanceRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FleetFlow API is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  })
})

app.listen(PORT, () => {
  console.log(`🚀 FleetFlow API server running on http://localhost:${PORT}`)
})
