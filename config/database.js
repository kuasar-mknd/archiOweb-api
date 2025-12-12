import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongoServer

const connectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    return
  }
  if (process.env.NODE_ENV === 'test') {
    // Use MongoDB Memory Server for tests
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
  } else {
    // Connect to the actual database for other environments
    const conn = await mongoose.connect(
      process.env.DATABASE_URL || 'mongodb://localhost:27017/homeGarden'
    )
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  }
}

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
  if (process.env.NODE_ENV === 'test' && mongoServer) {
    // await mongoServer.stop()
  }
}

export { connectDB, disconnectDB }
