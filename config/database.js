import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongoServer

const connectDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    // Use MongoDB Memory Server for tests
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  } else {
    // Connect to the actual database for other environments
    const conn = await mongoose.connect(
      process.env.DATABASE_URL || 'mongodb://localhost:27017/homeGarden'
    )
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  }
}

const disconnectDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    // Disconnect from MongoDB Memory Server
    await mongoose.disconnect()
    await mongoServer.stop()
  } else {
    // Disconnect from the actual database
    await mongoose.disconnect()
    console.log('MongoDB Disconnected')
  }
}

export { connectDB, disconnectDB }
