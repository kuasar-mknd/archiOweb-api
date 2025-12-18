import { connectDB, disconnectDB } from '../../config/database.js'
import Garden from '../../models/gardenModel.js'
import Plant from '../../models/plantModel.js'
import User from '../../models/userModel.js'
import { listPlantsInGarden } from '../../services/gardenService.js'

process.env.NODE_ENV = 'test'

const runBenchmark = async () => {
  await connectDB()

  try {
    // Setup
    const user = await User.create({
      identifier: 'benchuser',
      firstName: 'Bench',
      lastName: 'User',
      password: 'password'
    })

    const garden = await Garden.create({
      name: 'Bench Garden',
      location: { type: 'Point', coordinates: [0, 0] },
      user: user._id
    })

    const userRequesting = { userId: user._id, role: 'user' }

    // Create 2000 plants
    console.log('Creating 2000 plants...')
    const plants = []
    for (let i = 0; i < 2000; i++) {
      plants.push({
        commonName: `Plant ${i}`,
        scientificName: `Scientific ${i}`,
        family: 'Family',
        exposure: 'Full Sun',
        garden: garden._id
      })
    }
    const createdPlants = await Plant.insertMany(plants)

    // Simulate current behavior where garden stores all plant IDs
    garden.plants = createdPlants.map(p => p._id)
    await garden.save()

    console.log('Starting benchmark (100 iterations)...')
    const start = process.hrtime.bigint()

    for (let i = 0; i < 100; i++) {
      await listPlantsInGarden(garden._id, userRequesting)
    }

    const end = process.hrtime.bigint()
    const duration = Number(end - start) / 1e6 // milliseconds

    console.log(`Total time: ${duration} ms`)
    console.log(`Average execution time: ${duration / 100} ms`)

  } catch (err) {
    console.error(err)
  } finally {
    await disconnectDB()
  }
}

runBenchmark()
