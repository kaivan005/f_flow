-- FleetFlow Database Setup
-- Run this in phpMyAdmin or MySQL command line

-- Create database
CREATE DATABASE IF NOT EXISTS fleetflow;
USE fleetflow;

-- Drop existing tables if they exist (for fresh install)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS fuel_logs;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS maintenance_logs;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS vehicles;
SET FOREIGN_KEY_CHECKS = 1;

-- Table structure for roles
CREATE TABLE roles (
  role_id INT NOT NULL AUTO_INCREMENT,
  role_name VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id),
  UNIQUE KEY role_name (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for users
CREATE TABLE users (
  user_id INT NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  account_status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY email (email),
  KEY fk_user_role (role_id),
  CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles (role_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for vehicles
CREATE TABLE vehicles (
  vehicle_id INT NOT NULL AUTO_INCREMENT,
  vehicle_name VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  license_plate VARCHAR(20) NOT NULL,
  vehicle_type ENUM('Truck','Van','Bike') NOT NULL,
  max_capacity_kg DECIMAL(10,2) NOT NULL,
  odometer_km DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  status ENUM('Available','On Trip','In Shop','Retired') NOT NULL DEFAULT 'Available',
  acquisition_cost DECIMAL(12,2) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (vehicle_id),
  UNIQUE KEY license_plate (license_plate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for drivers
CREATE TABLE drivers (
  driver_id INT NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  license_number VARCHAR(50) NOT NULL,
  license_category VARCHAR(50) NOT NULL,
  license_expiry_date DATE NOT NULL,
  safety_score DECIMAL(5,2) DEFAULT '0.00',
  trip_completion_rate DECIMAL(5,2) DEFAULT '0.00',
  duty_status ENUM('On Duty','Off Duty','Suspended') NOT NULL DEFAULT 'Off Duty',
  availability_status ENUM('Available','On Trip') NOT NULL DEFAULT 'Available',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (driver_id),
  UNIQUE KEY license_number (license_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for trips
CREATE TABLE trips (
  trip_id INT NOT NULL AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  driver_id INT NOT NULL,
  cargo_weight_kg DECIMAL(10,2) NOT NULL,
  origin VARCHAR(150) NOT NULL,
  destination VARCHAR(150) NOT NULL,
  trip_status ENUM('Draft','Dispatched','Completed','Cancelled') NOT NULL DEFAULT 'Draft',
  start_odometer DECIMAL(10,2) DEFAULT NULL,
  end_odometer DECIMAL(10,2) DEFAULT NULL,
  revenue DECIMAL(12,2) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME DEFAULT NULL,
  PRIMARY KEY (trip_id),
  KEY fk_trip_vehicle (vehicle_id),
  KEY fk_trip_driver (driver_id),
  CONSTRAINT fk_trip_driver FOREIGN KEY (driver_id) REFERENCES drivers (driver_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_trip_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles (vehicle_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for maintenance_logs
CREATE TABLE maintenance_logs (
  maintenance_id INT NOT NULL AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  service_date DATE NOT NULL,
  cost DECIMAL(12,2) NOT NULL,
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (maintenance_id),
  KEY fk_maintenance_vehicle (vehicle_id),
  CONSTRAINT fk_maintenance_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles (vehicle_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for fuel_logs
CREATE TABLE fuel_logs (
  fuel_id INT NOT NULL AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  trip_id INT DEFAULT NULL,
  liters DECIMAL(10,2) NOT NULL,
  cost DECIMAL(12,2) NOT NULL,
  fuel_date DATE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (fuel_id),
  KEY fk_fuel_vehicle (vehicle_id),
  KEY fk_fuel_trip (trip_id),
  CONSTRAINT fk_fuel_trip FOREIGN KEY (trip_id) REFERENCES trips (trip_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_fuel_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles (vehicle_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for expenses
CREATE TABLE expenses (
  expense_id INT NOT NULL AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  expense_type VARCHAR(100) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  expense_date DATE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (expense_id),
  KEY fk_expense_vehicle (vehicle_id),
  CONSTRAINT fk_expense_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles (vehicle_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default roles
INSERT INTO roles (role_name) VALUES 
('Admin'),
('Manager'), 
('Dispatcher'),
('Driver');

-- Insert demo users
-- Password for all demo users is: password123
-- Hash generated using bcrypt with salt rounds 10: $2a$10$rlKSI4YyGBauRneXuORszeKan0vAvJHBPW4VRj7wtep6cSjMwEUP.
INSERT INTO users (full_name, email, password_hash, role_id, account_status) VALUES
('Admin User', 'admin@fleetflow.com', '$2a$10$rlKSI4YyGBauRneXuORszeKan0vAvJHBPW4VRj7wtep6cSjMwEUP.', 1, 'Active'),
('John Manager', 'manager@fleetflow.com', '$2a$10$rlKSI4YyGBauRneXuORszeKan0vAvJHBPW4VRj7wtep6cSjMwEUP.', 2, 'Active'),
('Sarah Dispatcher', 'dispatcher@fleetflow.com', '$2a$10$rlKSI4YyGBauRneXuORszeKan0vAvJHBPW4VRj7wtep6cSjMwEUP.', 3, 'Active'),
('Mike Driver', 'driver@fleetflow.com', '$2a$10$rlKSI4YyGBauRneXuORszeKan0vAvJHBPW4VRj7wtep6cSjMwEUP.', 4, 'Active');

-- Insert sample vehicles
INSERT INTO vehicles (vehicle_name, model, license_plate, vehicle_type, max_capacity_kg, odometer_km, status, acquisition_cost) VALUES
('Van-01', 'Ford Transit', 'ABC123', 'Van', 500.00, 25000.00, 'Available', 35000.00),
('Van-02', 'Mercedes Sprinter', 'ABC124', 'Van', 600.00, 18000.00, 'Available', 42000.00),
('Truck-01', 'Mercedes Actros', 'XYZ789', 'Truck', 2000.00, 45000.00, 'Available', 85000.00),
('Truck-02', 'Volvo FH', 'XYZ790', 'Truck', 2500.00, 32000.00, 'Available', 95000.00),
('Bike-01', 'Honda CB500X', 'BIK001', 'Bike', 50.00, 12000.00, 'Available', 8000.00);

-- Insert sample drivers
INSERT INTO drivers (full_name, license_number, license_category, license_expiry_date, safety_score, trip_completion_rate, duty_status, availability_status) VALUES
('Alex Johnson', 'LIC001', 'C', '2027-12-31', 95.50, 98.20, 'On Duty', 'Available'),
('Maria Santos', 'LIC002', 'C', '2026-08-15', 92.30, 96.50, 'On Duty', 'Available'),
('Robert Chen', 'LIC003', 'C', '2027-06-20', 89.75, 94.80, 'On Duty', 'Available'),
('Emma Wilson', 'LIC004', 'A', '2026-11-10', 96.80, 99.10, 'On Duty', 'Available');

-- Insert sample trips
INSERT INTO trips (vehicle_id, driver_id, cargo_weight_kg, origin, destination, trip_status, start_odometer, end_odometer, revenue, completed_at) VALUES
(1, 1, 450.00, 'Depot A', 'City Center', 'Completed', 24500.00, 24650.00, 250.00, '2026-02-20 14:30:00'),
(2, 2, 550.00, 'Warehouse B', 'Downtown', 'Completed', 17800.00, 17950.00, 320.00, '2026-02-19 16:45:00'),
(3, 3, 1800.00, 'Port', 'Industrial Zone', 'Dispatched', 44900.00, NULL, NULL, NULL);

-- Insert sample maintenance logs
INSERT INTO maintenance_logs (vehicle_id, service_type, service_date, cost, notes) VALUES
(1, 'Oil Change', '2026-02-15', 120.00, 'Regular maintenance - 25000 km service'),
(3, 'Tire Replacement', '2026-02-10', 850.00, 'Replaced all 6 tires');

-- Insert sample fuel logs
INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, fuel_date) VALUES
(1, 1, 45.50, 68.25, '2026-02-20'),
(2, 2, 52.30, 78.45, '2026-02-19'),
(3, 3, 95.00, 142.50, '2026-02-21');

-- Insert sample expenses
INSERT INTO expenses (vehicle_id, expense_type, amount, expense_date) VALUES
(1, 'Insurance', 450.00, '2026-02-01'),
(2, 'Insurance', 480.00, '2026-02-01'),
(3, 'Road Tax', 320.00, '2026-02-05');

-- Display success message
SELECT 'Database setup completed successfully!' as Message;
