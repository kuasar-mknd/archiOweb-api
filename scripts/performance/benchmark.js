import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Plant from '../../models/plantModel.js';
import Garden from '../../models/gardenModel.js';

// Setup
const setup = async () => {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  // Ensure indexes are created
  await Plant.init();
  await Garden.init();
  return mongoServer;
};

// Seeding
const seed = async (gardenCount, plantsPerGarden) => {
  console.log(`Seeding ${gardenCount} gardens with ${plantsPerGarden} plants each...`);
  const gardens = [];
  const plants = [];

  for (let i = 0; i < gardenCount; i++) {
    const garden = new Garden({
      name: `Garden ${i}`,
      location: { type: 'Point', coordinates: [0, 0] },
      user: new mongoose.Types.ObjectId(), // Fake user ID
    });
    gardens.push(garden);
  }
  await Garden.insertMany(gardens);

  // Now create plants
  // We need garden IDs
  const gardenDocs = await Garden.find();

  for (const garden of gardenDocs) {
    for (let j = 0; j < plantsPerGarden; j++) {
      plants.push({
        commonName: `Plant ${j}`,
        scientificName: `Sci Name ${j}`,
        family: 'Family',
        exposure: 'Full Sun',
        garden: garden._id
      });
    }
  }
  await Plant.insertMany(plants);
  console.log(`Seeded ${plants.length} plants.`);
  return gardenDocs;
};

const runVerification = async () => {
  const mongoServer = await setup();

  // Create enough data
  const gardens = await seed(500, 20); // 10000 plants total

  const targetGarden = gardens[Math.floor(Math.random() * gardens.length)];

  console.log('\n--- VERIFYING OPTIMIZATION ---');

  // Warmup
  await Plant.find({ garden: targetGarden._id });

  const start = performance.now();
  await Plant.find({ garden: targetGarden._id });
  const end = performance.now();
  console.log(`Query time: ${(end - start).toFixed(3)}ms`);

  // Check explain
  const explain = await Plant.find({ garden: targetGarden._id }).explain('executionStats');

  // We expect IXSCAN or FETCH with IXSCAN
  let stage = explain.executionStats.executionStages.stage;
  let inputStage = explain.executionStats.executionStages.inputStage ? explain.executionStats.executionStages.inputStage.stage : null;

  console.log(`Execution Stage: ${stage}`);
  if (inputStage) {
      console.log(`Input Stage: ${inputStage}`);
  }
  console.log(`Total Docs Examined: ${explain.executionStats.totalDocsExamined}`);

  if (stage === 'IXSCAN' || inputStage === 'IXSCAN') {
    console.log('✅ Index is being used!');
  } else {
    console.log('❌ Index is NOT being used!');
    process.exit(1);
  }

  await mongoose.disconnect();
  await mongoServer.stop();
};

runVerification().catch(console.error);
