import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Garden from '../../models/gardenModel.js';
import Plant from '../../models/plantModel.js';
import AppError from '../../utils/AppError.js';

// Setup Mongoose
const mongod = await MongoMemoryServer.create();
const uri = mongod.getUri();
await mongoose.connect(uri);

// Seed Data
const userId = new mongoose.Types.ObjectId();
const userRequesting = { userId: userId, role: 'user' };

const gardenId = new mongoose.Types.ObjectId();
const garden = {
    _id: gardenId,
    name: `Garden 1`,
    location: { type: 'Point', coordinates: [0, 0] },
    user: userId
};

const plants = [];
for (let j = 0; j < 50; j++) {
    plants.push({
      commonName: `Plant ${j}`,
      scientificName: `Scientific ${j}`,
      family: 'Family',
      exposure: 'Full Sun',
      garden: gardenId
    });
}

await Garden.create(garden);
await Plant.insertMany(plants);

const isOwnerOrAdmin = (userRequesting, resourceOwnerId) => {
    if (userRequesting.role === 'admin') return true
    return userRequesting.userId.toString() === resourceOwnerId.toString()
}

const getGardenByIdSequential = async (gardenId, userRequesting) => {
    const garden = await Garden.findById(gardenId).lean()
    if (!garden) {
      throw new AppError('Garden not found', 404)
    }

    if (!isOwnerOrAdmin(userRequesting, garden.user)) {
      throw new AppError('Not authorized to access this garden', 403)
    }

    garden.plants = await Plant.find({ garden: gardenId }).lean()

    return garden
}

const getGardenByIdParallel = async (gardenId, userRequesting) => {
    // Parallelize fetches
    // Note: We might fetch plants even if auth fails, but for valid users this is faster.
    const [garden, plants] = await Promise.all([
        Garden.findById(gardenId).lean(),
        Plant.find({ garden: gardenId }).lean()
    ])

    if (!garden) {
      throw new AppError('Garden not found', 404)
    }

    if (!isOwnerOrAdmin(userRequesting, garden.user)) {
      throw new AppError('Not authorized to access this garden', 403)
    }

    garden.plants = plants
    return garden
}

// Benchmark
const iterations = 1000;
console.log(`Running getGardenById Sequential ${iterations} times...`);
const startSeq = performance.now();
for (let i = 0; i < iterations; i++) {
    await getGardenByIdSequential(gardenId, userRequesting);
}
const endSeq = performance.now();
console.log(`Sequential Total: ${(endSeq - startSeq).toFixed(2)}ms`);

console.log(`Running getGardenById Parallel ${iterations} times...`);
const startPar = performance.now();
for (let i = 0; i < iterations; i++) {
    await getGardenByIdParallel(gardenId, userRequesting);
}
const endPar = performance.now();
console.log(`Parallel Total: ${(endPar - startPar).toFixed(2)}ms`);

await mongoose.disconnect();
await mongod.stop();
