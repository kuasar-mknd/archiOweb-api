import { connectDB, disconnectDB } from '../../config/database.js';
import User from '../../models/userModel.js';
import Garden from '../../models/gardenModel.js';
import * as userService from '../../services/userService.js';

// Setup environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'benchmark';

async function runBenchmark() {
  await connectDB();

  // Create seed data
  const user = await User.create({
    identifier: 'bench@test.com',
    password: 'password123',
    firstName: 'Bench',
    lastName: 'Mark',
    birthDate: new Date()
  });

  // Create 50 gardens
  const gardens = [];
  for (let i = 0; i < 50; i++) {
    const garden = await Garden.create({
      name: `Garden ${i}`,
      location: { type: 'Point', coordinates: [0, 0] },
      user: user._id
    });
    gardens.push(garden._id);
  }

  // Populate user.gardens array (simulate the "anti-pattern" reliance)
  user.gardens = gardens;
  await user.save();

  console.log('Setup complete. Starting benchmark...');

  const iterations = 500;

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    await userService.getUserGardens(user._id);
  }
  const end = performance.now();

  console.log(`Total time for ${iterations} iterations: ${(end - start).toFixed(2)}ms`);
  console.log(`Average time per call: ${((end - start) / iterations).toFixed(4)}ms`);

  await disconnectDB();
}

runBenchmark().catch(console.error);
