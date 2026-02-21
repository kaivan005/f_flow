import api from './api'

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  }
}

export const vehicleService = {
  getAll: async () => {
    const response = await api.get('/vehicles')
    return response.data
  },
  
  getAvailable: async () => {
    const response = await api.get('/vehicles/available')
    return response.data
  },
  
  getById: async (id) => {
    const response = await api.get(`/vehicles/${id}`)
    return response.data
  },
  
  create: async (vehicleData) => {
    const response = await api.post('/vehicles', vehicleData)
    return response.data
  },
  
  update: async (id, vehicleData) => {
    const response = await api.put(`/vehicles/${id}`, vehicleData)
    return response.data
  },
  
  updateStatus: async (id, status) => {
    const response = await api.patch(`/vehicles/${id}/status`, { status })
    return response.data
  },
  
  delete: async (id) => {
    const response = await api.delete(`/vehicles/${id}`)
    return response.data
  }
}

export const driverService = {
  getAll: async () => {
    const response = await api.get('/drivers')
    return response.data
  },
  
  getAvailable: async () => {
    const response = await api.get('/drivers/available')
    return response.data
  },
  
  create: async (driverData) => {
    const response = await api.post('/drivers', driverData)
    return response.data
  },
  
  updateStatus: async (id, statusData) => {
    const response = await api.patch(`/drivers/${id}/status`, statusData)
    return response.data
  }
}

export const tripService = {
  getAll: async () => {
    const response = await api.get('/trips')
    return response.data
  },
  
  create: async (tripData) => {
    const response = await api.post('/trips', tripData)
    return response.data
  },
  
  updateStatus: async (id, statusData) => {
    const response = await api.patch(`/trips/${id}/status`, statusData)
    return response.data
  }
}

export const maintenanceService = {
  getAll: async () => {
    const response = await api.get('/maintenance')
    return response.data
  },
  
  create: async (maintenanceData) => {
    const response = await api.post('/maintenance', maintenanceData)
    return response.data
  }
}

export const expenseService = {
  getFuel: async () => {
    const response = await api.get('/expenses/fuel')
    return response.data
  },
  
  createFuel: async (fuelData) => {
    const response = await api.post('/expenses/fuel', fuelData)
    return response.data
  },
  
  getExpenses: async () => {
    const response = await api.get('/expenses/expenses')
    return response.data
  },
  
  createExpense: async (expenseData) => {
    const response = await api.post('/expenses/expenses', expenseData)
    return response.data
  },
  
  getVehicleTotal: async (vehicleId) => {
    const response = await api.get(`/expenses/vehicle/${vehicleId}/total`)
    return response.data
  }
}

export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },
  
  getActivity: async () => {
    const response = await api.get('/dashboard/activity')
    return response.data
  }
}
