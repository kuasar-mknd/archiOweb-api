import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Garden from '../../models/gardenModel.js';
import Plant from '../../models/plantModel.js';
import User from '../../models/userModel.js';

// Setup
const setup = async () => {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  return mongoServer;
};

const teardown = async (mongoServer) => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

const runBenchmark = async () => {
  const mongoServer = await setup();
  const ObjectId = mongoose.Types.ObjectId;

  try {
    // 1. Seed Data
    console.log('Seeding data...');
    const userId = new ObjectId();
    await User.create({
      _id: userId,
      identifier: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
      gardens: []
    });

    const gardenId = new ObjectId();
    const garden = await Garden.create({
      _id: gardenId,
      name: 'Benchmark Garden',
      location: { type: 'Point', coordinates: [0, 0] },
      user: userId,
      plants: []
    });

    const plantDocs = [];
    const plantIds = [];
    const NUM_PLANTS = 5000;

    for (let i = 0; i < NUM_PLANTS; i++) {
        const plantId = new ObjectId();
        plantIds.push(plantId);
        plantDocs.push({
            _id: plantId,
            commonName: i % 2 === 0 ? 'Rose' : 'Tulip',
            scientificName: 'Rosa / Tulipa',
            family: 'Rosaceae / Liliaceae',
            exposure: 'Full Sun',
            garden: gardenId
        });
    }

    await Plant.insertMany(plantDocs);

    // Simulate updating the garden array
    garden.plants = plantIds;
    await garden.save();

    console.log(`Seeded 1 Garden with ${NUM_PLANTS} Plants.`);

    // 2. Benchmark Original Aggregation
    const startOriginal = performance.now();
    for (let i = 0; i < 50; i++) {
        await Garden.aggregate([
            { $match: { _id: gardenId } },
            {
            $lookup: {
                from: 'plants',
                localField: 'plants',
                foreignField: '_id',
                as: 'plants'
            }
            },
            { $unwind: '$plants' },
            {
            $group: {
                _id: '$plants.commonName',
                numberofplants: { $sum: 1 }
            }
            },
            {
            $project: {
                _id: 0,
                name: '$_id',
                numberofplants: 1
            }
            }
        ]);
    }
    const endOriginal = performance.now();
    const avgOriginal = (endOriginal - startOriginal) / 50;
    console.log(`Original Aggregation (avg of 50 runs): ${avgOriginal.toFixed(2)} ms`);

    // 3. Benchmark Optimized Aggregation
    const startOptimized = performance.now();
    for (let i = 0; i < 50; i++) {
        await Plant.aggregate([
            { $match: { garden: gardenId } },
            {
            $group: {
                _id: '$commonName',
                numberofplants: { $sum: 1 }
            }
            },
            {
            $project: {
                _id: 0,
                name: '$_id',
                numberofplants: 1
            }
            }
        ]);
    }
    const endOptimized = performance.now();
    const avgOptimized = (endOptimized - startOptimized) / 50;
    console.log(`Optimized Aggregation (avg of 50 runs): ${avgOptimized.toFixed(2)} ms`);

    // Verification
    const resOriginal = await Garden.aggregate([
        { $match: { _id: gardenId } },
        { $lookup: { from: 'plants', localField: 'plants', foreignField: '_id', as: 'plants' } },
        { $unwind: '$plants' },
        { $group: { _id: '$plants.commonName', numberofplants: { $sum: 1 } } },
        { $project: { _id: 0, name: '$_id', numberofplants: 1 } }
    ]);

    const resOptimized = await Plant.aggregate([
        { $match: { garden: gardenId } },
        { $group: { _id: '$commonName', numberofplants: { $sum: 1 } } },
        { $project: { _id: 0, name: '$_id', numberofplants: 1 } }
    ]);

    // Sort results to compare
    const sorter = (a, b) => a.name.localeCompare(b.name);
    resOriginal.sort(sorter);
    resOptimized.sort(sorter);

    console.log('Original Result:', JSON.stringify(resOriginal));
    console.log('Optimized Result:', JSON.stringify(resOptimized));

    if (JSON.stringify(resOriginal) === JSON.stringify(resOptimized)) {
        console.log('✅ Results Match!');
    } else {
        console.error('❌ Results Do Not Match!');
    }

  } catch (err) {
    console.error(err);
  } finally {
    await teardown(mongoServer);
  }
};

runBenchmark();
