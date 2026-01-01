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
    // Sentinel: Robustness fix
    // Trim the connection string to prevent errors from accidental whitespace in env vars
    const dbUrl = (process.env.DATABASE_URL || 'mongodb://localhost:27017/homeGarden').trim()

    try {
      const conn = await mongoose.connect(dbUrl)
      console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (error) {
      // Allow the error to propagate to bin/start.js for logging and exit
      throw error
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
