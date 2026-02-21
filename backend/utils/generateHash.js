import bcrypt from 'bcryptjs'

// Generate password hash for demo users
const generateHash = async () => {
  const password = 'password123'
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)
  console.log('Password:', password)
  console.log('Hash:', hash)
}

generateHash()
