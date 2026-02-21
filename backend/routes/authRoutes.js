import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../config/database.js'

const router = express.Router()

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      })
    }

    // Get user from database
    const [users] = await db.query(
      'SELECT u.*, r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.email = ?',
      [email]
    )

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    const user = users[0]

    // Check if account is active
    if (user.account_status !== 'Active') {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Check if requested role matches user's role (if role is specified)
    if (role && user.role_name.toLowerCase() !== role.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied for this role'
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role_name.toLowerCase()
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    )

    res.json({
      success: true,
      token,
      role: user.role_name.toLowerCase(),
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role_name.toLowerCase()
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    })
  }
})

// Register (for admin use)
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, role_name } = req.body

    // Validate input
    if (!full_name || !email || !password || !role_name) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      })
    }

    // Check if user already exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email])
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      })
    }

    // Get role_id
    const [roles] = await db.query('SELECT role_id FROM roles WHERE role_name = ?', [role_name])
    
    if (roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, salt)

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (full_name, email, password_hash, role_id) VALUES (?, ?, ?, ?)',
      [full_name, email, password_hash, roles[0].role_id]
    )

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user_id: result.insertId
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    })
  }
})

export default router
