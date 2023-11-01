import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.DATABASE_URL || 'mongodb://db:27017/homeGarden',
      {}
    )
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

const disconnectDB = async () => {
  await mongoose.disconnect()
  console.log('MongoDB Disconnected')
}

export { connectDB, disconnectDB }
