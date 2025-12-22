import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Garden from '../../models/gardenModel.js';
import Plant from '../../models/plantModel.js';
import { getAllPlants } from '../../services/plantService.js';

// Setup Mongoose
const mongod = await MongoMemoryServer.create();
const uri = mongod.getUri();
await mongoose.connect(uri);

// Seed Data
const userId = new mongoose.Types.ObjectId();
const userRequesting = { userId: userId, role: 'user' };

const GARDEN_COUNT = 50;
const PLANTS_PER_GARDEN = 20;

console.log(`Seeding ${GARDEN_COUNT} gardens and ${GARDEN_COUNT * PLANTS_PER_GARDEN} plants...`);

const gardens = [];
const plants = [];

for (let i = 0; i < GARDEN_COUNT; i++) {
  const gardenId = new mongoose.Types.ObjectId();
  gardens.push({
    _id: gardenId,
    name: `Garden ${i}`,
    location: { type: 'Point', coordinates: [0, 0] },
    user: userId
  });

  for (let j = 0; j < PLANTS_PER_GARDEN; j++) {
    plants.push({
      commonName: `Plant ${i}-${j}`,
      scientificName: `Scientific ${i}-${j}`,
      family: 'Family',
      exposure: 'Full Sun',
      garden: gardenId
    });
  }
}

await Garden.insertMany(gardens);
await Plant.insertMany(plants);
console.log('Seeding complete.');

// Benchmark
const iterations = 50;
console.log(`Running getAllPlants ${iterations} times...`);

const start = performance.now();
for (let i = 0; i < iterations; i++) {
    const res = await getAllPlants(userRequesting);
    if (res.length !== GARDEN_COUNT * PLANTS_PER_GARDEN) {
        throw new Error(`Expected ${GARDEN_COUNT * PLANTS_PER_GARDEN} plants, got ${res.length}`);
    }
}
const end = performance.now();

const duration = end - start;
console.log(`Total time: ${duration.toFixed(2)}ms`);
console.log(`Average time per call: ${(duration / iterations).toFixed(2)}ms`);

await mongoose.disconnect();
await mongod.stop();
