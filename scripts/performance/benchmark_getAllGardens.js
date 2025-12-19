
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Garden from '../../models/gardenModel.js';
import { getAllGardens } from '../../services/gardenService.js';

// Setup Mongoose
const mongod = await MongoMemoryServer.create();
const uri = mongod.getUri();
await mongoose.connect(uri);

// Seed Data
const GARDEN_COUNT = 1000;
console.log(`Seeding ${GARDEN_COUNT} gardens...`);

const gardens = [];
for (let i = 0; i < GARDEN_COUNT; i++) {
  gardens.push({
    name: `Garden ${i}`,
    location: {
      type: 'Point',
      coordinates: [0, 0]
    },
    user: new mongoose.Types.ObjectId()
  });
}
await Garden.insertMany(gardens);
console.log('Seeding complete.');

// Benchmark
const iterations = 50;
console.log(`Running getAllGardens ${iterations} times...`);

const start = performance.now();
for (let i = 0; i < iterations; i++) {
    // We need to simulate paging through or fetching all?
    // getAllGardens fetch 10 items by default.
    // Let's fetch the first page 50 times to measure overhead of hydration per request.
    await getAllGardens({ page: 1 });
}
const end = performance.now();

const duration = end - start;
console.log(`Total time: ${duration.toFixed(2)}ms`);
console.log(`Average time per call: ${(duration / iterations).toFixed(2)}ms`);

await mongoose.disconnect();
await mongod.stop();
