# FleetFlow Backend API

Backend server for FleetFlow - Fleet & Logistics Management System

## Prerequisites

- Node.js (v16 or higher)
- XAMPP with MySQL running
- phpMyAdmin (included with XAMPP)

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
- Copy `.env` file and update with your database credentials
- Default credentials for XAMPP:
  - DB_HOST=localhost
  - DB_USER=root
  - DB_PASSWORD= (empty)
  - DB_NAME=fleetflow

3. Setup database:
- Start XAMPP and ensure MySQL is running
- Open phpMyAdmin (http://localhost/phpmyadmin)
- Import the database setup file: `database/setup.sql`
  OR
- Create a new database named `fleetflow`
- Run the SQL from `database/setup.sql`

## Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on http://localhost:5000

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - Register new user (admin)

### Vehicles
- GET `/api/vehicles` - Get all vehicles
- GET `/api/vehicles/available` - Get available vehicles
- GET `/api/vehicles/:id` - Get single vehicle
- POST `/api/vehicles` - Create vehicle
- PUT `/api/vehicles/:id` - Update vehicle
- PATCH `/api/vehicles/:id/status` - Update vehicle status
- DELETE `/api/vehicles/:id` - Delete vehicle

### Drivers
- GET `/api/drivers` - Get all drivers
- GET `/api/drivers/available` - Get available drivers
- POST `/api/drivers` - Create driver
- PATCH `/api/drivers/:id/status` - Update driver status

### Trips
- GET `/api/trips` - Get all trips
- POST `/api/trips` - Create trip (with validation)
- PATCH `/api/trips/:id/status` - Update trip status

### Maintenance
- GET `/api/maintenance` - Get all maintenance logs
- POST `/api/maintenance` - Create maintenance log

### Expenses & Fuel
- GET `/api/expenses/fuel` - Get all fuel logs
- POST `/api/expenses/fuel` - Create fuel log
- GET `/api/expenses/expenses` - Get all expenses
- POST `/api/expenses/expenses` - Create expense
- GET `/api/expenses/vehicle/:id/total` - Get total operational cost

### Dashboard
- GET `/api/dashboard/stats` - Get dashboard statistics
- GET `/api/dashboard/activity` - Get recent activity

## Demo Users

The database setup includes two demo users:

**Manager Account:**
- Email: manager@fleetflow.com
- Password: password123

**Dispatcher Account:**
- Email: dispatcher@fleetflow.com
- Password: password123

## Authentication

All API endpoints (except login/register) require JWT authentication.

Include the token in request headers:
```
Authorization: Bearer <your-jwt-token>
```

## Business Logic

1. **Trip Creation Validation:**
   - Cargo weight must not exceed vehicle capacity
   - Driver license must not be expired
   - Vehicle must be available
   - Driver must be available

2. **Status Management:**
   - When trip is dispatched: Vehicle and Driver status → "On Trip"
   - When trip is completed/cancelled: Vehicle and Driver → "Available"
   - When maintenance log is created: Vehicle → "In Shop"

3. **RBAC (Role-Based Access Control):**
   - Manager: Full access to all modules
   - Dispatcher: Limited access (no analytics)
