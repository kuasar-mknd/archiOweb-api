import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongoServer

const connectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    return
  }
  if (process.env.NODE_ENV === 'test') {
    // Use MongoDB Memory Server for tests
    if (!mongoServer) {
      mongoServer = await MongoMemoryServer.create()
    }
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
  } else {
// ... existing code ...
    // Connect to the actual database for other environments
    const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/homeGarden'

    // Retry logic for robust startup
    const maxRetries = 5
    let retries = 0

    while (retries < maxRetries) {
      try {
        const conn = await mongoose.connect(dbUrl)
        console.log(`MongoDB Connected: ${conn.connection.host}`)
        return
      } catch (error) {
        retries++
        console.error(`MongoDB connection attempt ${retries} failed:`, error.message)

        if (retries >= maxRetries) {
          console.error('Max retries reached. Exiting.')
          throw error
        }

        // Exponential backoff: 2s, 4s, 8s, 16s...
        const delay = Math.pow(2, retries) * 1000
        console.log(`Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
}

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
  if (process.env.NODE_ENV === 'test' && mongoServer) {
    await mongoServer.stop()
    mongoServer = null // Reset the variable
  }
}

export { connectDB, disconnectDB }
